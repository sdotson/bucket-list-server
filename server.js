'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  app = express();

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

// Categories endpoint
router.route('/categories')
  .get(function(req, res) {
    res.json({message: "Just got a categories GET request"});
  })
  .post(function(req, res) {
    res.json({message: "Just got a categories POST request"});
  });

router.route('/categories/:category_id')
  .get(function(req,res) {
    res.json({message: "Just got a categories GET request for " + req.params.category_id});
  })
  .put(function(req,res) {
    res.json({message: "Just got a categories PUT request for " + req.params.category_id});
  })
  .delete(function(req,res) {
    res.json({message: "Just got a categories DELETE request for " + req.params.category_id});
  });

// User items endpoints
router.route('/users/:user_id/items')
  .get(function(req, res) {
    res.json({message: "Just got a items GET request for " + req.params.user_id});
  })
  .post(function(req, res) {
    res.json({message: "Just got a items POST request for " + req.params.user_id});
  });

router.route('/users/:user_id/items/:item_id')
  .get(function(req,res) {
    res.json({message: "Just got a items GET request for item " + req.params.item_id + ", user " + req.params.user_id});
  })
  .put(function(req,res) {
    res.json({message: "Just got a items PUT request for item " + req.params.item_id + ", user " + req.params.user_id});
  })
  .delete(function(req,res) {
    res.json({message: "Just got a items DELETE request for item " + req.params.item_id + ", user " + req.params.user_id});
  });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.listen(3000);
console.log('Listening on port 3000...');
