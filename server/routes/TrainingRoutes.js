const express = require("express");
const {
  getAllTrainings,
  createOrUpdateTraining,
  getUserTrainings,
  deleteTraining,
} = require("../controllers/jobs/TrainingController");
const router = express.Router();

// User routes
router.post("/", createOrUpdateTraining);
router.get("/my-trainings/:applicationId", getUserTrainings);
router.delete("/:id", deleteTraining);

// Admin routes
router.get("/", getAllTrainings);

module.exports = router;
