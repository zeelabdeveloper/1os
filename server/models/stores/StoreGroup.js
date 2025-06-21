const mongoose = require('mongoose');

const storeGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const StoreGroup = mongoose.model('StoreGroup', storeGroupSchema);

module.exports = StoreGroup;