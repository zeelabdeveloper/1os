const express = require('express');
const router = express.Router();
const InterviewSession = require('../models/InterviewSession');
const InterviewRound = require('../models/InterviewRound');
const Application = require('../models/Application');
const { authenticate, authorize } = require('../middleware/auth');
const { DateTime } = require('luxon');

// Create new interview session
router.post('/', authenticate, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const { applicationId, interviewRoundId, startTime, endTime, meetingLink } = req.body;
    
    // Validate time
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Check if application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Get interview round with interviewer
    const interviewRound = await InterviewRound.findById(interviewRoundId).populate('interviewer');
    if (!interviewRound) {
      return res.status(404).json({ message: 'Interview round not found' });
    }

    // Check for scheduling conflicts
    const conflictingSession = await InterviewSession.findOne({
      $or: [
        { 
          interviewerId: interviewRound.interviewer._id,
          $or: [
            { startTime: { $lt: end, $gte: start } },
            { endTime: { $gt: start, $lte: end } },
            { startTime: { $lte: start }, endTime: { $gte: end } }
          ]
        },
        {
          applicationId,
          $or: [
            { startTime: { $lt: end, $gte: start } },
            { endTime: { $gt: start, $lte: end } },
            { startTime: { $lte: start }, endTime: { $gte: end } }
          ]
        }
      ]
    });

    if (conflictingSession) {
      return res.status(400).json({ 
        message: 'Scheduling conflict detected',
        conflictWith: conflictingSession._id
      });
    }

    const interviewSession = new InterviewSession({
      applicationId,
      interviewRoundId,
      startTime: start,
      endTime: end,
      meetingLink,
      interviewerId: interviewRound.interviewer._id
    });
    
    await interviewSession.save();
    
    // Update application status
    if (application.status === 'applied' || application.status === 'phone_screen') {
      application.status = 'interview';
      await application.save();
    }
    
    res.status(201).json(await interviewSession.populate(['interviewRound', 'application']));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

 

module.exports = router;