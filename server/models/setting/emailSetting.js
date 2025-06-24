const mongoose = require('mongoose');

const emailSettingsSchema = new mongoose.Schema({
  mailHost: String,
  mailPort: String,
  mailUsername: String,
  mailPassword: String,
  mailEncryption: {
    type: String,
    enum: ['tls', 'ssl', 'none'],
    default: 'tls'
  },
  mailFromAddress: String,
  mailFromName: String
}, { timestamps: true });

const EmailSettings = mongoose.model('EmailSettings', emailSettingsSchema);
module.exports = EmailSettings;