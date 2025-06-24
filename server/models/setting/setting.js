const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: String,
  country: String,
  zipCode: String,
  telephone: String,
  currency: String,
  currencySymbol: String,
  themeColor: String,
  iconColor: String,
  buttonColor: String,
  sidebarBgColor: String,
  titleText: String,
  footerText: String,
  logo: String,
  favicon: String
}, { timestamps: true });
const Settings= mongoose.model('Settings', settingsSchema);
module.exports =Settings