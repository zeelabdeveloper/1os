const LetterTemplate = require('../models/letterTemplate');
const RelevantLetter = require('../models/relevantLetter');
const { sendEmail } = require('../services/emailService');
const { replaceTemplateVariables } = require('../utils/templateUtils');

// Get letter templates by type
exports.getLetterTemplatesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const templates = await LetterTemplate.find({ type });
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

// Generate and send letter
exports.generateLetter = async (req, res) => {
  try {
    const { userId } = req.user;
    const { templateId, variables, recipientEmail, subject, notes } = req.body;

    // Get the template
    const template = await LetterTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Replace variables in the template
    const content = replaceTemplateVariables(template.content, variables);

    // Send email
    await sendEmail({
      to: recipientEmail,
      subject,
      html: content
    });

    // Save to relevant letters
    const relevantLetter = new RelevantLetter({
      userId,
      templateId,
      variables,
      recipientEmail,
      subject,
      notes,
      status: 'sent'
    });
    await relevantLetter.save();

    res.json({
      success: true,
      message: 'Letter sent successfully',
      data: relevantLetter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send letter',
      error: error.message
    });
  }
};

// Get all sent letters for user
exports.getSentLetters = async (req, res) => {
  try {
    const { userId } = req.user;
    const letters = await RelevantLetter.find({ userId })
      .populate('templateId')
      .sort({ sentAt: -1 });

    res.json({
      success: true,
      data: letters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sent letters',
      error: error.message
    });
  }
};