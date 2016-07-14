'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./config/main');
const cors = require('cors');
const port = 3000;

/*
http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4

Data structures

Category = {
  name,
  created,
  updated
}

User = {
  username,
  email,
  created,
  updated
}

**** Below is a guess. I should figure out login system first ****
ListItem = {
  user,
  title,
  description,
  categories
}

*/
// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Log requests to console
app.use(morgan('dev'));

// Connect to database
mongoose.connect(config.database);

// var router = express.Router();
//
// // User items endpoints
// router.route('/users/:user_id/items')
//   .get(function(req, res) {
//     res.json({message: "Just got a items GET request for " + req.params.user_id});
//   })
//   .post(function(req, res) {
//     res.json({message: "Just got a items POST request for " + req.params.user_id});
//   });
//
// router.route('/users/:user_id/items/:item_id')
//   .get(function(req,res) {
//     res.json({message: "Just got a items GET request for item " + req.params.item_id + ", user " + req.params.user_id});
//   })
//   .put(function(req,res) {
//     res.json({message: "Just got a items PUT request for item " + req.params.item_id + ", user " + req.params.user_id});
//   })
//   .delete(function(req,res) {
//     res.json({message: "Just got a items DELETE request for item " + req.params.item_id + ", user " + req.params.user_id});
//   });


require('./routes')(app);

app.listen(port);
console.log('Listening on port 3000...');
