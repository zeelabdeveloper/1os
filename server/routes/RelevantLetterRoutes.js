const express = require('express');
const {   getLetterTemplatesByType,
  generateLetter } = require('../controllers/Content/letterTemplates');
const router = express.Router();
 
 
// // Get letter templates by type
// router.get('/templates/:type',   getLetterTemplatesByType);

// Generate and send letter
router.post('/generate',   generateLetter);

// // Get all sent letters for user
// router.get('/sent',   getSentLetters);

module.exports = router;