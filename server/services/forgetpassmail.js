const nodemailer = require("nodemailer");
const { EmailConfig } = require("../helper/emailConfig");

/**
 * @param {Object} mailOptions
 * @returns {Object}
 */
const sendEmail = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EmailConfig.mailFromAddress,
      pass: EmailConfig.mailPassword,
    },
  });

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

module.exports = sendEmail;
