const express = require("express");
const router = express.Router();
const regularizationController = require("../controllers/regularizationController");

// Employee routes
router.post("/", regularizationController.createRegularization);
router.get("/user/:userId", regularizationController.getUserRegularizations);
router.delete("/:id", regularizationController.cancelRegularization);

// Admin routes
router.get(
  "/admin",

  regularizationController.getAllRegularizations
);
router.put(
  "/:id/status",

  regularizationController.updateRegularizationStatus
);

module.exports = router;
