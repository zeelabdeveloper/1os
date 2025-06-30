const Store = require('../models/Store');
const asyncHandler = require('express-async-handler');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getAllStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({}).populate('storeGroup');
  res.json(stores);
});

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
const getStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate('storeGroup');
  
  if (store) {
    res.json(store);
  } else {
    res.status(404);
    throw new Error('Store not found');
  }
});

// @desc    Create a store
// @route   POST /api/stores
// @access  Private/Admin
const createStore = asyncHandler(async (req, res) => {
  const {
    storeCode,
    storeId,
    storeName,
    storeAddress,
    city,
    district,
    state,
    pincode,
    gstNumber,
    panNumber,
    dlNumber,
    fssaiNumber,
    contactPerson,
    contactNumber,
    email,
    storeGroup,
    isActive
  } = req.body;
  
  const store = new Store({
    storeCode,
    storeId,
    storeName,
    storeAddress,
    city,
    district,
    state,
    pincode,
    gstNumber,
    panNumber,
    dlNumber,
    fssaiNumber,
    contactPerson,
    contactNumber,
    email,
    storeGroup,
    isActive
  });

  const createdStore = await store.save();
  res.status(201).json(createdStore);
});

// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Private/Admin
const updateStore = asyncHandler(async (req, res) => {
  const {
    storeCode,
    storeId,
    storeName,
    storeAddress,
    city,
    district,
    state,
    pincode,
    gstNumber,
    panNumber,
    dlNumber,
    fssaiNumber,
    contactPerson,
    contactNumber,
    email,
    storeGroup,
    isActive
  } = req.body;

  const store = await Store.findById(req.params.id);

  if (store) {
    store.storeCode = storeCode || store.storeCode;
    store.storeId = storeId || store.storeId;
    store.storeName = storeName || store.storeName;
    store.storeAddress = storeAddress || store.storeAddress;
    store.city = city || store.city;
    store.district = district || store.district;
    store.state = state || store.state;
    store.pincode = pincode || store.pincode;
    store.gstNumber = gstNumber || store.gstNumber;
    store.panNumber = panNumber || store.panNumber;
    store.dlNumber = dlNumber || store.dlNumber;
    store.fssaiNumber = fssaiNumber || store.fssaiNumber;
    store.contactPerson = contactPerson || store.contactPerson;
    store.contactNumber = contactNumber || store.contactNumber;
    store.email = email || store.email;
    store.storeGroup = storeGroup || store.storeGroup;
    store.isActive = isActive !== undefined ? isActive : store.isActive;

    const updatedStore = await store.save();
    res.json(updatedStore);
  } else {
    res.status(404);
    throw new Error('Store not found');
  }
});

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Private/Admin
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (store) {
    await store.remove();
    res.json({ message: 'Store removed' });
  } else {
    res.status(404);
    throw new Error('Store not found');
  }
});

module.exports = {
  getAllStores,
  getStore,
  createStore,
  updateStore,
  deleteStore
};