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
      if (config) {
        configData.mailHost = config.mailHost || "";
        configData.mailPort = config.mailPort || "";
        configData.mailUsername = config.mailUsername || "";
        configData.mailPassword = config.mailPassword || "";
        configData.mailEncryption = config.mailEncryption || "tls";
        configData.mailFromAddress = config.mailFromAddress || "";
        configData.mailFromName = config.mailFromName || "";
      }
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
