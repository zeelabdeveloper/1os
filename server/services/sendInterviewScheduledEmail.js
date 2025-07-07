const nodemailer = require("nodemailer");
const { EmailConfig } = require("../helper/emailConfig");
 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { 
    user: EmailConfig.mailFromAddress,
    pass: EmailConfig.mailPassword,
  },
});

/**
 * @param {Object} mailOptions
 * @returns {Object}
 */
const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

module.exports = sendEmail;
