const express = require("express");
const router = express.Router();
const settingsController = require("../../controllers/setting/setting");
const upload = require("../../middlewares/uploadMiddleware");

router.get("/", settingsController.getSettings);
router.put(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  settingsController.updateSettings
);

module.exports = router;