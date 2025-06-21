// routes/recruitmentRoutes.js
const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/jobs/recruitmentController');
 

 
router.post('/onboarding',  recruitmentController.initiateOnboarding);

module.exports = router;