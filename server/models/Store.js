const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  storeId: {
    type: String,
     
    trim: true
  },
  storeName: {
    type: String,
     
    trim: true
  },
  storeAddress: {
    type: String,
    
    trim: true
  },
  city: {
    type: String,
     
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  state: {
    type: String,
     
    trim: true
  },
  pincode: {
    type: String,
     
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true
  },
  panNumber: {
    type: String,
    trim: true
  },
  dlNumber: {
    type: String,
    trim: true
  },
  fssaiNumber: {
    type: String,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  storeGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreGroup',
    
  },
  isActive: {
    type: Boolean,
    default: true
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

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;