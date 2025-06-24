const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  interviewRoundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewRound',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  feedback: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  outcome: {
    type: String,
    enum: ['selected', 'rejected', 'hold', 'pending'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  recordingLink: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});



const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
module.exports = InterviewSession;