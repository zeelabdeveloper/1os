const express = require("express");
const router = express.Router();
const emailSettingsController = require("../../controllers/setting/emailSettingController");

router.get("/", emailSettingsController.getEmailSettings);
router.put("/", emailSettingsController.updateEmailSettings);

module.exports = router;