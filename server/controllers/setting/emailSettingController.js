const EmailSettings = require("../../models/setting/emailSetting");

// Get current email settings
exports.getEmailSettings = async (req, res) => {
  try {
    const settings = await EmailSettings.findOne();
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        mailHost: "",
        mailPort: "",
        mailUsername: "",
        mailPassword: "",
        mailEncryption: "tls",
        mailFromAddress: "",
        mailFromName: "",
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update email settings
exports.updateEmailSettings = async (req, res) => {
  try {
    let settings = await EmailSettings.findOne();
    if (!settings) {
      settings = new EmailSettings();
    }

    // Update fields
    const fields = [
      "mailHost",
      "mailPort",
      "mailUsername",
      "mailPassword",
      "mailEncryption",
      "mailFromAddress",
      "mailFromName",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Error updating email settings:", error);
    res.status(400).json({ message: error.message });
  }
};