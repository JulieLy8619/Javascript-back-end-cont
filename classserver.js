'use strict';
//made a copy for follow along in class adding in sql stuff


// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg'); //do i need to do npm i pg, yes

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(cors());

//database configuation
const client = new pg.Client(process.env.DATABASE_URL); //green client is an object in pg library
//note to self: postgress://localhost:5432/city_explorer is protocol, server default port # and database name (note this form is for mac, there is a diff format for windows: postgres://USER:PASSWORD@HOST:PORT/DBNAME)
client.connect();
client.on('error', err => console.log(err));


// API Routes
// app.get('/location', (request, response) => {
//   searchToLatLong(request.query.data)
//     .then(location => response.send(location))
//     .catch(error => handleError(error, response));
// })
app.get('/location', getLocation); //will need to add getlocation function

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
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address; 
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
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
// will I fill in max distance, is it a defalt number, do I need to remove it, etc?
// will I need a second URL for conditions: https://www.hikingproject.com/data/get-conditions?ids=7001635,7002742,7000108,7002175

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

//new helper functions are actually going to be methods for our objects
//ie lookup and deletestaledata

//new handler functions
//ie error

//location handler commented out cuz i didn't fully record his code
// function getLocation (req, res) {
//   Location.lookupLocation ({ //note this isn't a prototype but is tied to the objects, just not each like a prototype
//     tableName: location.tableName,
//     query:request.query.data,
//     cacheHit: function (result) {
//       response.send(result.rows[0]);
//     },
//     cacheMiss: function (result) => 
//   })
// }
