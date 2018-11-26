'use strict';


// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// API Routes
app.get('/location', (request, response) => {
  searchToLatLong(request.query.data)
    .then(location => response.send(location))
    .catch(error => handleError(error, response));
})

app.get('/weather', getWeather);

app.get('/yelp', getYelp);

app.get('/movies', getMovies);

// app.get('/meetup', getEvents); //might have to change the /name

// app.get('/hiking', getTrails); //might have to change the /name

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
  console.log(this);
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
// function MUEvent(query) {
//   this.link
//   this.name
//   this.host
//   this.creation_date
// }

//object for hiking
// function Trail(query) {
//   this.trail_url
//   this.name
//   this.location
//   this.length
//   this.condition_date
//   this.condition_time
//   this.conditions
//   this.stars
//   this.star_votes
//   this.summary
// }


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
      console.log('yelpResult', yelpResult.body.businesses[0]);
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

// function getEvents(query,response) {
//   const eventUrl = `https://api.meetup.com/find/groups?zip=${query}`; //note to self will need the path to the query's zip

//   superagent.get(eventUrl)
//     .set('Authorization', `Bearer ${process.env.MEET_UP_API_KEY}`) 
//note to self, I think meet up also uses authorization bearer
//     .then(resultFromSuper => {
//      console.log(resultFromSuper);
//       const eventSummaries = resultFromSuper.map(eventItem => {
//         return new MUEvent(eventItem);
//       });
//       response.send(eventSummaries);
//     })
//     .catch(error => handleError(error, response));
// }

// function getTrails(query,response) {
//   const trailUrl = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${req.query.data.longitude}&maxDistance=10&key=${process.env.HIKING_API_KEY}`; 
//will I fill in max distance, is it a defalt number, do I need to remove it, etc?
//will I need a second URL for conditions: https://www.hikingproject.com/data/get-conditions?ids=7001635,7002742,7000108,7002175

//   superagent.get(trailUrl)
//     .then(resultFromSuper => {
//       console.log(resultFromSuper);
//       const trailSummaries = resultFromSuper.map(trailItem => { 
//         return new Trail(trailItem);
//       });
//       response.send(trailSummaries);
//     })
//     .catch(error => handleError(error, response));
// }
