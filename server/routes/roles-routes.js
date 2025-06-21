const express = require("express");
const { getAllRoleList } = require("../controllers/roleController.js");
const {
  CanRoleListView,
} = require("../middlewares/roles-middleware/rolesMiddleware");

const router = express.Router();

router.get("/", CanRoleListView, getAllRoleList);

router.post("/login", getAllRoleList);

module.exports = router;
