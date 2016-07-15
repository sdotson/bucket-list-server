// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('./config/main');
const jwt = require('jsonwebtoken');
var util = require('util');
// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
const User = require('./models/User');
const ListItem = require('./models/ListItem');

// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section

  // Initialize passport for use
  app.use(passport.initialize());

  // Bring in defined Passport Strategy
  require('./config/passport')(passport);

  // Create API group routes
  const apiRoutes = express.Router();

  // Register new users
  apiRoutes.post('/users/register', function(req, res) {
    console.log(req.body);
    if(!req.body.email || !req.body.password) {
      res.status(400).json({ success: false, message: 'Please enter email and password.' });
    } else {
      const newUser = new User({
        email: req.body.email,
        password: req.body.password
      });

      // Attempt to save the user
      newUser.save(function(err) {
        if (err) {
          return res.status(400).json({ success: false, message: 'That email address already exists.'});
        }
        res.status(201).json({ success: true, message: 'Successfully created new user.' });
      });
    }
  });

  // Authenticate the user and get a JSON Web Token to include in the header of future requests.
  apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
      } else {
        // Check if password matches
        user.comparePassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            // Create token if the password matched and no error was thrown
            const token = jwt.sign(user, config.secret, {
              expiresIn: 10080 // in seconds
            });
            res.status(200).json({ success: true, token: 'JWT ' + token, userId: user._id });
          } else {
            res.status(401).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
          }
        });
      }
    });
  });
  // routes require Authorization : token in the header
  // Regular routes
  apiRoutes.route('/users')
    .get(requireAuth, function(req, res) {
      res.json({message: "Just got a items GET request for "});
    });
  // User items endpoints
  apiRoutes.route('/items')
    .get(requireAuth, function(req, res) {
      console.log(util.inspect(req));
      ListItem.find({'user_id': req.user._id}, function(err, items) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).json(items);
        }
      });
      // res.json({message: "Just got a items GET request for " + req.params.user_id});
    })
    .post(requireAuth, function(req, res) {
      const listItem = new ListItem();
      listItem.user_id = req.user._id;
      listItem.title = req.body.title;
      listItem.description = req.body.description;
      listItem.categories = req.body.categories;

      // Save the chat message if there are no errors
      listItem.save(function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(201).json(listItem);
          }
      });
    });

  apiRoutes.route('/items/:item_id')
    .get(requireAuth, function(req, res) {
      ListItem.find({$and : [{'user_id': req.user._id}, {'_id': req.params.item_id}]}, function(err, items) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).json(items);
        }
      });
    })
    .put(requireAuth, function(req, res) {
      console.log(req.body);
      ListItem.findOne({$and : [{'_id': req.params.item_id}, {'user_id': req.user._id}]}, function(err, item) {
        if (err) {
          res.status(400).send(err);
        }
        console.log('made it', item);
        console.log(req.body);
        item.title = req.body.title || item.title;
        item.description = req.body.description || item.description;
        item.categories = req.body.categories || item.categories;

        // Save the updates to the message
        item.save(function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(200).json(item);
          }
        });
      });
    })
    .delete(requireAuth, function(req, res) {
      ListItem.findOneAndRemove({$and : [{'_id': req.params.item_id}, {'user_id': req.user._id}]}, function(err, item) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).json({ message: 'Message removed!' , item: item });
        }
      });
    });

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
