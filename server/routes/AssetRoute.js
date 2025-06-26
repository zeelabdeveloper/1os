const express = require("express");
const {
  getAllAssets,
  createOrUpdateAsset,
  getUserAssets,
  deleteAsset,
} = require("../controllers/jobs/AssetController");
const router = express.Router();

// User routes
router.post("/", createOrUpdateAsset);
router.get("/my-assets/:applicationId", getUserAssets);
router.delete("/:id", deleteAsset);

// Admin routes
router.get("/", getAllAssets);

module.exports = router;
