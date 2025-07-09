const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    
  },
  interviewRoundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewRound',
    
  },
  startTime: {
    type: Date,
    
  },
  endTime: {
    type: Date,
    
  },
  feedback: {
    type: String,
    trim: true
  },
  recordingLink: {
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