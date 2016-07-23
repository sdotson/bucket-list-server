'use strict';
// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('./config/main');
const jwt = require('jsonwebtoken');
const SparkPost = require('sparkpost');
const emailClient = new SparkPost('f1a7f69f95399cf4a3c79a46ff41dfc3be0eccf5');

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
    if(!req.body.email || !req.body.password) {
      res.status(400).json({ success: false, message: 'Please enter email and password.' });
    } else {
      let newUser = new User({
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

  // Send email for users who have forgotten their password
  apiRoutes.post('/users/password/reset', function(req, res) {
    if(!req.body.email) {
      res.status(400).json({ success: false, message: 'Please enter email.' });
    } else {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (err) throw err;

        if (!user) {
          res.status(400).json({ success: false, message: 'Email does not exist.' });
        } else {
          // Generate unique token for password reset, which will be verified in a different route
          let token = jwt.sign({_id: user._id, email: user.email, role: user.role}, config.secret, {
            expiresIn: 86400 // one day in seconds
          });

          let emailMessageLink = `http://localhost:8080/reset-password?token=${token}`;

          // Send email here
          emailClient.transmissions.send({
            transmissionBody: {
              content: {
                from: 'bucket-list@stuartdotson.com',
                subject: 'Bucket List password Reset Link',
                html:`<html><body><p>Included is the link to reset your password. This link is only valid for 24 hours:</p><p><a href="${emailMessageLink}">${emailMessageLink}</a></p><p>If you did not request this password reset, please disregard.</p></body></html>`
              },
              recipients: [
                {address: req.body.email}
              ]
            }
          }, function(err, spRes) {
            if (err) {
              res.status(400).json({ success: false, error: err });
            } else {
              res.status(200).json({ success: true, message: `You have sent your password reset email for ${req.body.email}`});
            }
          });
        }
      });
    }
  });

  // change password route
  apiRoutes.route('/users/password')
    .put(requireAuth, function(req, res) {
      User.findOne({
        email: req.user.email
      }, function(err, user) {
        if (err) throw err;

        if (!user) {
          res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
        } else {
          // update password
          User.findOne({'email': req.user.email}, function(err, user) {
            if (err) {
              res.status(400).json({success: false, error: err});
            }

            user.password = req.body.password;

            // Save the updates to the message
            user.save(function(err) {
              if (err) {
                res.status(400).json({success: false, error: err});
              } else {
                res.status(200).json({success: true, email: user.email, message: `Password updated for ${user.email}`});
              }
            });
          });
          // destroy token for safety (not sure how to do this)

        }
      });
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
            let token = jwt.sign({_id: user._id, email: user.email, role: user.role}, config.secret, {
              expiresIn: 10080 // in seconds
            });
            res.status(200).json({ success: true, token: 'JWT ' + token, user: { email: user.email, role: user.role } });
          } else {
            res.status(401).json({ success: false, error: err, message: 'Authentication failed. Passwords did not match.' });
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
      ListItem.find({'user_id': req.user._id}, function(err, items) {
        if (err) {
          res.status(400).json({ success: false, error: err });
        } else

        res.status(200).json(items);
      });
      // res.json({message: "Just got a items GET request for " + req.params.user_id});
    })
    .post(requireAuth, function(req, res) {
      let listItem = new ListItem();
      listItem.user_id = req.user._id;
      listItem.title = req.body.title;
      listItem.description = req.body.description;
      listItem.categories = req.body.categories;

      // Save the chat message if there are no errors
      listItem.save(function(err) {
          if (err) {
            res.status(400).json({success: false, error: err});
          } else {
            res.status(201).json(listItem);
          }
      });
    });

  apiRoutes.route('/items/:item_id')
    .get(requireAuth, function(req, res) {
      ListItem.find({$and : [{'user_id': req.user._id}, {'_id': req.params.item_id}]}, function(err, items) {
        if (err) {
          res.status(400).json({success: false, error: err});
        } else {
          res.status(200).json(items);
        }
      });
    })
    .put(requireAuth, function(req, res) {
      ListItem.findOne({$and : [{'_id': req.params.item_id}, {'user_id': req.user._id}]}, function(err, item) {
        if (err) {
          res.status(400).send({success: false, error: err});
        }
        item.title = req.body.title || item.title;
        item.description = req.body.description || item.description;
        item.categories = req.body.categories || item.categories;

        // Save the updates to the message
        item.save(function(err) {
          if (err) {
            res.status(400).json({success: false, error: err});
          } else {
            res.status(200).json(item);
          }
        });
      });
    })
    .delete(requireAuth, function(req, res) {
      ListItem.findOneAndRemove({$and : [{'_id': req.params.item_id}, {'user_id': req.user._id}]}, function(err, item) {
        if (err) {
          res.status(400).json({success: false, error: err});
        } else {
          res.status(200).json({ message: 'Message removed!' , item: item });
        }
      });
    });

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
