const EmailSettings = require("../models/setting/emailSetting");

let configData = {
  mailHost: "",
  mailPort: "",
  mailUsername: "",
  mailPassword: "",
  mailEncryption: "tls",
  mailFromAddress: "",
  mailFromName: "",
};

const loadEmailConfig = async () => {
  try {
    const config = await EmailSettings.findOne();
    if (config) {
     
      configData = {
        mailHost: config.mailHost || "",
        mailPort: config.mailPort || "",
        mailUsername: config.mailUsername || "",
        mailPassword: config.mailPassword || "",
        mailEncryption: config.mailEncryption || "tls",
        mailFromAddress: config.mailFromAddress || "",
        mailFromName: config.mailFromName || "",
      };
    }
    console.log("Email config loaded/refreshed.");
  } catch (error) {
    console.error("Failed to load email config:", error.message);
  }
};

// Load once at startup
loadEmailConfig();

module.exports = {
  EmailConfig: configData,
  refreshEmailConfig: loadEmailConfig,
};
