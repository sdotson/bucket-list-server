const mongoose = require('mongoose');

const ListItemSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  categories: {
    type: Array
  },
  completed: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('ListItem', ListItemSchema);
