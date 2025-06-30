const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Store routes
router.route('/')
  .get(storeController.getAllStores)
  .post(storeController.createStore);

router.route('/:id')
  .get(storeController.getStore)
  .put(storeController.updateStore)
  .delete(storeController.deleteStore);

module.exports = router;