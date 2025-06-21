const express = require("express");
const router = express.Router();
 
const { body } = require("express-validator");
const {
  getAllRoles,
  updateRole,
  deleteRole,
  createRole,
} = require("../../controllers/store/storeRoleController.js");

router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Role name is required")
      .isLength({ max: 50 })
      .withMessage("Role name must be less than 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Only letters are allowed in role name"),
  ],
  createRole
);

router.get("/", getAllRoles);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

module.exports = router;