const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
   
  },
  summary: {
    type: String,
    required: [true, 'Please add a summary'],

  },
  content: {
    type: String,
    required: [true, 'Please add content'],
  },
  image: {
    type: String,
    default: '',
  },
  targetRoles: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Role',
      required: true,
    },
  ],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('News', NewsSchema);