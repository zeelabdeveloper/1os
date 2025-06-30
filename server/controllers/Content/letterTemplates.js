const Onboarding = require("../../models/jobs/Onboarding");
const LetterTemplate = require("../../models/LetterTemplate");

const letterTemplateController = {
  // Get all templates for the authenticated user
  getAllTemplates: async (req, res) => {
    try {
      const templates = await LetterTemplate.find();
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Get templates by type
  getTemplatesByType: async (req, res) => {
    try {
      const templates = await LetterTemplate.find({
        createdBy: req.user.id,
        type: req.params.type,
      });
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Get single template
  getTemplate: async (req, res) => {
    try {
      const template = await LetterTemplate.findOne({
        _id: req.params.id,
        createdBy: req.user.id,
      });

      if (!template) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Create new template
  createTemplate: async (req, res) => {
    try {
      const { name, type, content, variables } = req.body;
      console.log(req.body);
      // Validate variables
      if (variables && variables.some((v) => !v.name || !v.description)) {
        return res.status(400).json({
          success: false,
          message: "All variables must have name and description",
        });
      }

      const newTemplate = new LetterTemplate({
        name,
        type,
        content,
        variables: variables || [],
        createdBy: req?.user?.id,
      });

      await newTemplate.save();

      res.status(201).json({
        success: true,
        message: "Template created successfully",
        data: newTemplate,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Update template
  updateTemplate: async (req, res) => {
    try {
      const { name, type, content, variables } = req.body;

      // Validate variables
      if (variables && variables.some((v) => !v.name || !v.description)) {
        return res.status(400).json({
          success: false,
          message: "All variables must have name and description",
        });
      }

      const updatedTemplate = await LetterTemplate.findOneAndUpdate(
        { _id: req.params.id },
        { name, type, content, variables: variables || [] },
        { new: true }
      );

      if (!updatedTemplate) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({
        success: true,
        message: "Template updated successfully",
        data: updatedTemplate,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Delete template
  deleteTemplate: async (req, res) => {
    try {
      const deletedTemplate = await LetterTemplate.findOneAndDelete({
        _id: req.params.id,
      });

      if (!deletedTemplate) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({
        success: true,
        message: "Template deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Generate letter from template
  generateLetter: async (req, res) => {
    console.log(req.body);
    try {
      const template = await LetterTemplate.findOne({
        _id: req.body.templateId,
      });

      if (!template) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      const ApplicationDetails = await Onboarding.findOne({
        applicationId: req.body.applicationId,
      }).populate("applicationId");
      console.log(ApplicationDetails);
      res.json({
        success: true,
        message: "Letter sent successfully",
        ApplicationDetails,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};

module.exports = letterTemplateController;
