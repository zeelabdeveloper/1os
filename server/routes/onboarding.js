const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/jobs/onboardingController');
 

// Get all onboardings
router.get('/',   onboardingController.getAllOnboardings);

// Delete an onboarding
router.delete('/:id',  onboardingController.deleteOnboarding);

// Convert to employee
router.post('/:id/convert', onboardingController.convertToEmployee);

module.exports = router;