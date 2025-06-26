const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
});

const letterTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['offer', 'appointment', 'termination', 'promotion', 'warning', 'experience', 'resignation', 'custom'],
    default: 'custom'
  },
  content: {
    type: String,
    required: true
  },
  variables: [variableSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
letterTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const LetterTemplate = mongoose.model('LetterTemplate', letterTemplateSchema);

module.exports = LetterTemplate;