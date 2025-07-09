const express = require("express");
const {
  loginUser,
  fetchUser,
  createUser,
  verifyToken,
  createDepartment,
  createRole,
  forgotPassword,
  convertUserFromOnboarding,
  checkEmployeeConversion,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/auth/verify", verifyToken);
router.get("/fetchUser", fetchUser);
router.post("/createUser", createUser);
router.post("/employees/convert", convertUserFromOnboarding);
router.get("/employees/check-conversion", checkEmployeeConversion);
router.post("/createRole", createRole);
router.post("/departments", createDepartment);

module.exports = router;
