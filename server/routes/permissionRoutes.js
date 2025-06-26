const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");
 

router.get("/routes",   permissionController.getAllRoutes);
router.get("/role/:roleId", permissionController.getRolePermissions);
router.put("/role/:roleId", permissionController.updatePermissions);
router.delete("/role/:roleId", permissionController.deletePermissions);

module.exports = router;