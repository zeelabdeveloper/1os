const express = require("express");
const {
  getStaffAnalytics,
  getStaffAnalyticsNew,
  getBranchAnalytics,
  getDepartmentAnalytics,
  getBankAnalytics,
  getSalaryAnalytics,
  getExperienceAnalytics,
  getSingleBranchAnalytics,
} = require("../controllers/analytics/staffController");
const {
  getAttendanceDashboard,
} = require("../controllers/analytics/attendanceAnalytics");

const router = express.Router();

router.get("/staff", getStaffAnalytics);

// Main dashboard
router.get("/dashboard", getStaffAnalyticsNew);

// Branch analytics
router.get("/branches", getBranchAnalytics);
router.get("/branches/:id", getSingleBranchAnalytics);

// Department analytics
router.get("/departments", getDepartmentAnalytics);

// Salary analytics
router.get("/salary", getSalaryAnalytics);

// Experience analytics
router.get("/experience", getExperienceAnalytics);
router.get("/attendance", getAttendanceDashboard);

module.exports = router;
