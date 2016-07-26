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

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS has a white list functionality. Use that once I figure out where this API lives
// https://www.npmjs.com/package/cors
const whitelist = ['http://localhost', 'http://stuartdotson.com'];
function corsOptionsDelegate(req, callback){
  var corsOptions;
  if(whitelist.indexOf(req.header('Origin')) !== -1){
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  }else{
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};
app.use(cors(corsOptionsDelegate));

// Log requests to console
app.use(morgan('dev'));

// Connect to database
mongoose.connect(config.database);

require('./routes')(app);

app.listen(port);
console.log('Listening on port 3000...');
