'use strict';


// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(cors());

//data base set up
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// API Routes
app.get('/location', getLocation);
// app.get('/location', (request, response) => {
//   searchToLatLong(request.query.data)
//     .then(location => response.send(location))
//     .catch(error => handleError(error, response));
// })

app.get('/weather', getWeather);

app.get('/yelp', getYelp);

app.get('/movies', getMovies);

app.get('/meetups', getEvents); 

app.get('/trails', getTrails);

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

// Models (aka constructors) 
//reminder to self: the "this"s are from the handlebars from the index in the class respoitory
//object for user location entry
function Location(query, res) {
  this.tableName = 'location';
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address; 
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.created_at = Date.now();
}

Location.lookupLocation = (location) => {
  const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  const values = [location.query];

  return client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0) {
        console.log('We have a match for location');
        location.cacheHit(result);
      } else {
        console.log('We do not have a location match');
        location.cacheMiss();
      }
    })
    .catch(console.error);
}

Location.prototype.save = function () {
  const SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id;`;
  const values = [this.search_query, this.formatted_query, this.latitude, this.longitude];

  return client.query(SQL, values)
    .then(result => {
      this.id = result.rows[0].id;
      return this;
    });
}

function getLocation (req, resp) {
  Location.lookupLocation({
    tableName: Location.tableName,
    query: req.query.data,
    cacheHit: function(result) {
      console.log(result.rows[0]);
      resp.send(result.rows[0]);
    },
    cacheMiss: function() {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${this.query}&key=${process.env.GEOCODE_API_KEY}`;

      return superagent.get(url)
        .then(result => {
          const location = new Location(this.query, result);
          location.save()
            .then(location => resp.send(location));
        })
        .catch(error => handleError(error));
    }
  })
}

//object for dark sky
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

//object for yelp
function Food(place) {
  this.url = place.url;
  this.name = place.name;
  this.rating = place.rating;
  this.price = place.price;
  this.image_url = place.image_url;
  // console.log(this);
}

//object for the movie database
function Movie(query) {
  this.title = query.title;
  this.released_on = query.release_date;
  this.total_votes = query.vote_count;
  this.average_votes = query.vote_average;
  this.popularity = query.popularity;
  this.image_url = ('http://image.tmdb.org/t/p/w185/'+query.poster_path);
  this.overview = query.overview;
}

//object for meet up
function MUEvent(query) {
  this.link = query.link;
  this.name = query.name;
  this.host = query.group.name;
  // console.log('object query group name',query.group.name);
  // this.creation_date = query.created;
  this.creation_date = (new Date(query.created)).toLocaleDateString();

  // console.log(this);
}

//object for hiking
function Trail(query) {
  this.trail_url = query.url;
  this.name = query.name;
  this.location = query.location;
  this.length = query.length;
  this.condition_date = query.conditionDate;
  this.condition_time = 1;
  this.conditions = query.conditionStatus;
  this.stars = query.stars;
  this.star_votes = query.starVotes;
  this.summary = query.summary;
  // console.log(this);
}


// Helper Functions
function searchToLatLong(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url)
    .then(res => {
      return new Location(query, res);
    })
    .catch(error => handleError(error));
}

function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  superagent.get(url)
    .then(result => {
      const weatherSummaries = result.body.daily.data.map(day => {
        return new Weather(day);
      });
      response.send(weatherSummaries);
    })
    .catch(error => handleError(error, response));
}

function getYelp(req, res){
  const yelpUrl = `https://api.yelp.com/v3/businesses/search?latitude=${req.query.data.latitude}&longitude=${req.query.data.longitude}`;

  superagent.get(yelpUrl)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(yelpResult => {
      const yelpSummaries = yelpResult.body.businesses.map(place => {
        return new Food(place);
      });
      res.send(yelpSummaries);
    })
    .catch(error => handleError(error, res));
}

function getMovies(query,response) {
  const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${query}`;

  superagent.get(movieUrl)
    .then(resultFromSuper => {
      const movieSummaries = resultFromSuper.body.results.map(movieItem => {
        return new Movie(movieItem);
      });
      response.send(movieSummaries);
    })
    .catch(error => handleError(error, response));
}

function getEvents(req,response) {
  const eventUrl = `https://api.meetup.com/find/upcoming_events?key=${process.env.MEET_UP_API_KEY}&lon=${req.query.data.longitude}&page=20&lat=${req.query.data.latitude}`; 
  

  superagent.get(eventUrl)
    .then(resultFromSuper => {
      // console.log(resultFromSuper.body.events);
      const eventSummaries = resultFromSuper.body.events.map(eventItem => {
        return new MUEvent(eventItem);
      });
      response.send(eventSummaries);
    })
    .catch(error => handleError(error, response));
}

function getTrails(req,response) {
  const trailUrl = `https://www.hikingproject.com/data/get-trails?lat=${req.query.data.latitude}&lon=${req.query.data.longitude}&maxDistance=10&key=${process.env.HIKING_API_KEY}`; 

  superagent.get(trailUrl)
    .then(resultFromSuper => {
      // console.log('trail info', resultFromSuper.body.trails);
      const trailSummaries = resultFromSuper.body.trails.map(trailItem => {
        return new Trail(trailItem);
      });
      response.send(trailSummaries);
    })
    .catch(error => handleError(error, response));
}

// new helper functions
function lookup(options) {
  const SQL = `SELECT * FROM ${options.tableName} WHERE location_id=$1;`;
  const values = [options.location];

  client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0) {
        options.cacheHit(result);
      } else {
        options.cacheMiss();
      }
    })
    .catch(error => handleError(error));
}

