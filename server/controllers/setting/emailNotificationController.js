const EmailSetting = require("../../models/setting/emailNotification");

// Get email settings
exports.getEmailSettings = async (req, res) => {
  try {
    let settings = await EmailSetting.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = new EmailSetting();
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update email settings
exports.updateEmailSettings = async (req, res) => {
  try {
    let settings = await EmailSetting.findOne();

    if (!settings) {
      settings = new EmailSetting();
    }

    // Update all fields from request body
    Object.keys(req.body).forEach((key) => {
      if (settings.schema.paths[key]) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
