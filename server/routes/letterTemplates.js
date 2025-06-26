const express = require("express");
const letterTemplateController = require("../controllers/Content/letterTemplates");
const router = express.Router();
 
// Get all templates
router.get("/", letterTemplateController.getAllTemplates);

// Get templates by type
router.get("/type/:type", letterTemplateController.getTemplatesByType);

// Get single template
router.get("/:id", letterTemplateController.getTemplate);

// Create new template
router.post("/", letterTemplateController.createTemplate);

// Update template
router.put("/:id", letterTemplateController.updateTemplate);

// Delete template
router.delete("/:id", letterTemplateController.deleteTemplate);

// Generate letter from template
router.post("/generate/:id", letterTemplateController.generateLetter);

module.exports = router;
