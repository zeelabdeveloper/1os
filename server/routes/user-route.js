const express = require("express");
const {
  createStaff,
  fetchStaffByRole,
  getStaff,
  deleteStaff,
  getStaffByEmpId,
  editStaffByEmpId,
  editStaffByStaff,
} = require("../controllers/userController.js");

const router = express.Router();

router.post(
  "/create-staff",

  createStaff
);
router.get("/staff", getStaff);

router.get("/roles/:roleID", fetchStaffByRole);
router.get("/staff/:empId", getStaffByEmpId);
router.put("/staff/:empId", editStaffByEmpId);
router.put("/staff/fromstaff/:empId", editStaffByStaff);
router.delete("/staff/:id", deleteStaff);

module.exports = router;
