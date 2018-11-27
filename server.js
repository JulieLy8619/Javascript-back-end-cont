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

// ============  Models (aka constructors)============== 
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

//object for dark sky
function Weather(day) {
  this.tableName = 'weathers';
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  this.created_at = Date.now();
}
Weather.tableName = 'weathers';
Weather.lookup = lookup;
Weather.deleteByLocationId = deleteByLocationId;
Weather.prototype.save = function(location_id) {
  const SQL = `INSERT INTO ${this.tableName} (forecast, time, created_at, location_id) VALUES ($1, $2, $3, $4);`;
  const values = [this.forecast, this.time, this.created_at, location_id];

  client.query(SQL, values);
}

//object for yelp
function Food(place) {
  this.tableName = 'yelp';
  this.url = place.url;
  this.name = place.name;
  this.rating = place.rating;
  this.price = place.price;
  this.image_url = place.image_url;
  this.created_at = Date.now();
}
Food.tableName = 'yelp';
Food.lookup = lookup;
Food.deleteByLocationId = deleteByLocationId;
Food.prototype.save = function (location_id) {
  const SQL = `INSERT INTO ${this.tableName} (name, created_at, rating, price, image_url, location_id) VALUES ($1, $2, $3, $4, $5, $6);`;
  const values = [this.name, this.created_at, this.rating, this.price, this.image_url, location_id];

  client.query(SQL, values);
}


//object for the movie database
function Movie(query) {
  this.tableName = 'tmdb';
  this.title = query.title;
  this.released_on = query.release_date;
  this.total_votes = query.vote_count;
  this.average_votes = query.vote_average;
  this.popularity = query.popularity;
  this.image_url = ('http://image.tmdb.org/t/p/w185/'+query.poster_path);
  this.overview = query.overview;
}
Movie.tableName = 'tmdb';
Movie.lookup = lookup;
Movie.deleteByLocationId = deleteByLocationId;
Movie.prototype.save = function (location_id) {
  const SQL = `INSERT INTO ${this.tableName} (created_at, title, released_on, total_votes, average_votes, popularity, image_url, overview, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
  const values = [this.created_at, this.title, this.released_on, this.total_votes, this.average_votes, this.popularity, this.image_url, this.overview, location_id];

  client.query(SQL, values);
}

//object for meet up
function MUEvent(query) {
  this.link = query.link;
  this.name = query.name;
  this.host = query.group.name;
  this.creation_date = (new Date(query.created)).toLocaleDateString();
}

//object for hiking
function Trail(query) {
  this.trail_url = query.url;
  this.name = query.name;
  this.location = query.location;
  this.length = query.length;
  this.condition_date = query.conditionDate; //need to fix this, returning 01/01/1970
  this.condition_time = 1; //need to fix this too
  this.conditions = query.conditionStatus;
  this.stars = query.stars;
  this.star_votes = query.starVotes;
  this.summary = query.summary;
}


// ====== Handlers Functions ================
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

//i don't think I need this anymore
// function searchToLatLong(query) {
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

//   return superagent.get(url)
//     .then(res => {
//       return new Location(query, res);
//     })
//     .catch(error => handleError(error));
// }

// function getWeather(request, response) {
//   const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

//   superagent.get(url)
//     .then(result => {
//       const weatherSummaries = result.body.daily.data.map(day => {
//         return new Weather(day);
//       });
//       response.send(weatherSummaries);
//     })
//     .catch(error => handleError(error, response));
// }

// Weather handler
function getWeather(request, response) {
  Weather.lookup({
    tableName: Weather.tableName,
    location: request.query.data.id,
    cacheHit: function (result) {
      let ageOfResultsInMinutes = (Date.now() - result.rows[0].created_at) / (1000 * 60);
      if (ageOfResultsInMinutes > 30) {
        Weather.deleteByLocationId(Weather.tableName, request.query.data.id);
        this.cacheMiss();
      } else {
        response.send(result.rows);
      }
    },
    cacheMiss: function () {
      const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

      return superagent.get(url)
        .then(result => {
          const weatherSummaries = result.body.daily.data.map(day => {
            const summary = new Weather(day);
            summary.save(request.query.data.id);
            return summary;
          });
          response.send(weatherSummaries);
        })
        .catch(error => handleError(error, response));
    }
  })
}

// function getYelp(req, res){
//   const yelpUrl = `https://api.yelp.com/v3/businesses/search?latitude=${req.query.data.latitude}&longitude=${req.query.data.longitude}`;

//   superagent.get(yelpUrl)
//     .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
//     .then(yelpResult => {
//       const yelpSummaries = yelpResult.body.businesses.map(place => {
//         return new Food(place);
//       });
//       res.send(yelpSummaries);
//     })
//     .catch(error => handleError(error, res));
// }

function getYelp(req, res){
  Food.lookup({
    tableName: Food.tableName,
    location: req.query.data.id,
    cacheHit: function (result) {
      let ageOfResultsInMinutes = (Date.now() - result.rows[0].created_at) / (1000 * 60);
      if (ageOfResultsInMinutes > 30) {
        Food.deleteByLocationId(Food.tableName, req.query.data.id);
        this.cacheMiss();
      } else {
        res.send(result.rows);
      }
    },
    cacheMiss: function () {
      const url = `https://api.yelp.com/v3/businesses/search?latitude=${req.query.data.latitude}&longitude=${req.query.data.longitude}`;

      return superagent.get(url)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then(yelpResult => {
          const yelpSummaries = yelpResult.body.businesses.map(place => {
            const summary = new Food(place);
            summary.save(req.query.data.id);
            return summary;
          });
          res.send(yelpSummaries);
        })
        .catch(error => handleError(error, res));
    }
  })
}


// function getMovies(query,response) {
//   const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${query}`;

//   superagent.get(movieUrl)
//     .then(resultFromSuper => {
//       const movieSummaries = resultFromSuper.body.results.map(movieItem => {
//         return new Movie(movieItem);
//       });
//       response.send(movieSummaries);
//     })
//     .catch(error => handleError(error, response));
// }
function getMovies(request,response) {
  Movie.lookup({
    tableName: Movie.tableName,
    location: request.query.data.id,
    cacheHit: function (result) {
      let ageOfResultsInMinutes = (Date.now() - result.rows[0].created_at) / (1000 * 60);
      if (ageOfResultsInMinutes > 30) {
        Movie.deleteByLocationId(Movie.tableName, request.query.data.id);
        this.cacheMiss();
      } else {
        response.send(result.rows);
      }
    },
    cacheMiss: function () {
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${request}`;

      return superagent.get(url)
        .then(resultFromSuper => {
          const movieSummaries = resultFromSuper.body.results.map(movieItem => {
            const summary = new Movie(movieItem);
            summary.save(request.query.data.id);
            return summary;
          });
          response.send(movieSummaries);
        })
        .catch(error => handleError(error, response));
    }
  })
}

function getEvents(req,response) {
  const eventUrl = `https://api.meetup.com/find/upcoming_events?key=${process.env.MEET_UP_API_KEY}&lon=${req.query.data.longitude}&page=20&lat=${req.query.data.latitude}`; 

  superagent.get(eventUrl)
    .then(resultFromSuper => {
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
      const trailSummaries = resultFromSuper.body.trails.map(trailItem => {
        return new Trail(trailItem);
      });
      response.send(trailSummaries);
    })
    .catch(error => handleError(error, response));
}

// // Error handler
// function handleError(err, res) {
//   console.error(err);
//   if (res) res.status(500).send('Sorry, something went wrong');
// }

// ============ Helper functions ===============
// These functions are assigned to properties on the models

// Checks to see if there is DB data for a given location
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

// Clear the DB data for a location if it is stale
function deleteByLocationId(table, city) {
  const SQL = `DELETE from ${table} WHERE location_id=${city};`;
  return client.query(SQL);
}
