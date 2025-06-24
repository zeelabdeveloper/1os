const fs = require("fs");
const path = require("path");
const Settings = require("../../models/setting/setting");

// Get current settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Store previous file paths
    const previousLogo = settings.logo;
    const previousFavicon = settings.favicon;

    // Update simple fields
    const fields = [
      "companyName",
      "country",
      "zipCode",
      "telephone",
      "currency",
      "currencySymbol",
      "themeColor",
      "iconColor",
      "buttonColor",
      "sidebarBgColor",
      "titleText",
      "footerText",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    // Handle file uploads
    const uploadDir = path.join(__dirname, "../../uploads/company");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
   

    if (req.files?.logo) {
      const logo = req.files.logo[0];
      const logoPath = path.join(uploadDir, logo.filename);
      fs.copyFileSync(logo.path, logoPath);
      settings.logo = `${logo.filename}`;

      if (previousLogo && previousLogo !== settings.logo) {
        const oldLogoPath = path.join(
          uploadDir,
          path.basename(`${previousLogo}`)
        );
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }

    if (req.files?.favicon) {
      const favicon = req.files.favicon[0];
      const faviconPath = path.join(uploadDir, favicon.filename);
      fs.copyFileSync(favicon.path, faviconPath);
      settings.favicon = `${favicon.filename}`;

      if (previousFavicon && previousFavicon !== settings.favicon) {
        const oldFaviconPath = path.join(
          uploadDir,
          path.basename(`${previousFavicon}`)
        );
        if (fs.existsSync(oldFaviconPath)) {
          fs.unlinkSync(oldFaviconPath);
        }
      }
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(400).json({ message: error.message });
  }
};
