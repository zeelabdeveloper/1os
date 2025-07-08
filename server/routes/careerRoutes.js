const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/jobs/applicationSchema');
const router = express.Router();

// Simple application tracking route
router.get('/application-track/:id', async (req, res) => {
  try {
    // Check if ID is valid
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid application ID');
    }

    // Find application
    const application = await Application.findById(req.params.id)
      .select('name status jobId appliedAt updatedAt')
      .populate('jobId', 'title');

    if (!application) {
      return res.status(404).send('Application not found');
    }
console.log(application)
    // Send response
    res.json({
      id: application._id,
      name: application.name,
      status: application.status,
      jobTitle: application.jobId?.title || 'Not specified',
      applied: application.appliedAt,
      updated: application.appliedAt
    });

  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;