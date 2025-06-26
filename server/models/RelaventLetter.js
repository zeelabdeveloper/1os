const mongoose = require('mongoose');

const relevantLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LetterTemplate',
    required: true
  },
  variables: {
    type: Object,
    required: true
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['sent', 'draft', 'failed'],
    default: 'sent'
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

const RelevantLetter = mongoose.model('RelevantLetter', relevantLetterSchema);

module.exports = RelevantLetter;