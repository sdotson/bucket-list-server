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
app.use(cors());

// Log requests to console
app.use(morgan('dev'));

// Connect to database
mongoose.connect(config.database);

require('./routes')(app);

app.listen(port);
console.log('Listening on port 3000...');
