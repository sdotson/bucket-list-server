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
    type: String,
    required: true
  },
  categories: {
    type: Array
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('ListItem', ListItemSchema);
