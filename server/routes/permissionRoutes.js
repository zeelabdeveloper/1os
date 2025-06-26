// routes/permissionRoutes.js
const express = require("express");
const router = express.Router();
 
// Tree and permissions management
const permissionController = require("../controllers/permissionController");

router.get("/tree", permissionController.getPermissionTree);
router.get("/tree/:roleId", permissionController.getPermissionTree);
router.put("/:roleId", permissionController.updateRolePermissions);
router.get("/summary", permissionController.getRolePermissionsSummary);


module.exports = router;