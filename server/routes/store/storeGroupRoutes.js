const express = require("express");
const router = express.Router();
 
const { body } = require("express-validator");
const {
  getAllStoreGroups,
  updateStoreGroup,
  deleteStoreGroup,
  createStoreGroup,
} = require("../../controllers/store/storeGroupController.js");

router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Store group name is required")
      .isLength({ max: 100 })
      .withMessage("Store group name must be less than 100 characters"),
  ],
  createStoreGroup
);

router.get("/", getAllStoreGroups);
router.put("/:id", updateStoreGroup);
router.delete("/:id", deleteStoreGroup);

module.exports = router;
