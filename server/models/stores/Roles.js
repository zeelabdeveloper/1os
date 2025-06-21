const mongoose = require('mongoose');

const storeRolesSchema = new mongoose.Schema({
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

const StoreRoles = mongoose.model('StoreRoles', storeRolesSchema);

module.exports = StoreRoles;