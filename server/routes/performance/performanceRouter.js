const express = require("express");
const indicatorController = require("../../controllers/performance/performanceController");
const goalController = require("../../controllers/performance/goalController");
const appraisalController = require("../../controllers/performance/appraisalController");

const router = express.Router();

// Create a new indicator
router.post("/indicators", indicatorController.createIndicator);

// Get all indicators
router.get("/indicators", indicatorController.getIndicators);

// Get a single indicator by ID
router.get("/indicators/:id", indicatorController.getIndicatorById);

// Update an indicator
router.put("/indicators/:id", indicatorController.updateIndicator);

// Delete an indicator
router.delete("/indicators/:id", indicatorController.deleteIndicator);

router.post("/goals", goalController.createGoal);

// Get all goals
router.get("/goals", goalController.getGoals);

// Get a single goal by ID
router.get("/goals/:id", goalController.getGoalById);

// Update a goal
router.put("/goals/:id", goalController.updateGoal);

// Delete a goal
router.delete("/goals/:id", goalController.deleteGoal);

// Create a new appraisal
router.post("/appraisals", appraisalController.createAppraisal);

// Get all appraisals
router.get("/appraisals", appraisalController.getAppraisals);

// Get a single appraisal by ID
router.get("/appraisals/:id", appraisalController.getAppraisalById);

// Get appraisals for a specific user
router.get("/users/:userId/appraisals", appraisalController.getUserAppraisals);

// Update an appraisal
router.put("/appraisals/:id", appraisalController.updateAppraisal);

// Delete an appraisal
router.delete("/appraisals/:id", appraisalController.deleteAppraisal);

// Submit an appraisal for approval
router.post("/appraisals/:id/submit", appraisalController.submitAppraisal);

// Approve/Reject an appraisal
router.post("/appraisals/:id/review", appraisalController.reviewAppraisal);

module.exports = router;
