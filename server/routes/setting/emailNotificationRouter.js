const express = require("express");
const router = express.Router();
const emailSettingController = require("../../controllers/setting/emailNotificationController");

router.get("/", emailSettingController.getEmailSettings);
router.put("/", emailSettingController.updateEmailSettings);

module.exports = router;