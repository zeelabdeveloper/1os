const express = require("express");
const {
  loginUser,
  fetchUser,
  createUser,
  verifyToken,
  createDepartment,
  createRole,
} = require("../controllers/authController");

 

const router = express.Router();
  
router.post("/login", loginUser);
router.get("/auth/verify", verifyToken);
router.get("/fetchUser", fetchUser);
router.post("/createUser", createUser);
router.post("/createRole", createRole);
router.post("/departments", createDepartment);





 
module.exports = router;
