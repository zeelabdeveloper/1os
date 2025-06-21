const Indicator = require("../../models/performance/Indicator");
const { default: mongoose } = require("mongoose");

// @desc    Create new performance indicator
// @route   POST /api/indicators
// @access  Private/Admin
const createIndicator = async (req, res) => {
  try {
    const { branch, department, role, competencies } = req.body;

    // Validate required fields
    if (!branch || !department || !role) {
      return res.status(400).json({
        success: false,
        message: "Branch, department and role are required fields",
      });
    }

    // Validate competencies
    const requiredCompetencies = [
      "leadership",
      "projectManagement",
      "allocatingResources",
      "businessProcess",
      "oralCommunication",
    ];

    for (const comp of requiredCompetencies) {
      if (!competencies || competencies[comp] === undefined) {
        return res.status(400).json({
          success: false,
          message: `Competency ${comp} is required`,
        });
      }

      if (competencies[comp] < 1 || competencies[comp] > 5) {
        return res.status(400).json({
          success: false,
          message: `Competency ${comp} must be between 1 and 5`,
        });
      }
    }

    // Check if indicator already exists for this branch-department-role combo
    const existingIndicator = await Indicator.findOne({
      branch,
      department,
      role,
    });

    if (existingIndicator) {
      return res.status(400).json({
        success: false,
        message:
          "Performance indicator already exists for this branch, department and role combination",
      });
    }

    // Create new indicator
    const indicator = new Indicator({
      branch,
      department,
      role,
      competencies,
    });

    const createdIndicator = await indicator.save();

    // Populate the response
    const populatedIndicator = await Indicator.findById(createdIndicator._id)
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    res.status(201).json({
      success: true,
      data: populatedIndicator,
      message: "Performance indicator created successfully",
    });
  } catch (error) {
    console.error("Error creating performance indicator:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create performance indicator",
    });
  }
};

// @desc    Get all performance indicators
// @route   GET /api/indicators
// @access  Private/Admin
const getIndicators = async (req, res) => {
  try {
    const indicators = await Indicator.find({})
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: indicators.length,
      data: indicators,
    });
  } catch (error) {
    console.error("Error fetching performance indicators:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch performance indicators",
    });
  }
};

// @desc    Get single performance indicator by ID
// @route   GET /api/indicators/:id
// @access  Private/Admin
const getIndicatorById = async (req, res) => {
  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid indicator ID",
      });
    }

    const indicator = await Indicator.findById(req.params.id)
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: "Performance indicator not found",
      });
    }

    res.json({
      success: true,
      data: indicator,
    });
  } catch (error) {
    console.error("Error fetching performance indicator:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch performance indicator",
    });
  }
};

// @desc    Update performance indicator
// @route   PUT /api/indicators/:id
// @access  Private/Admin
const updateIndicator = async (req, res) => {
  console.log(req.params.id)
  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid indicator ID",
      });
    }

    const { competencies } = req.body;

    // Validate competencies if provided
    if (competencies) {
      const validCompetencies = [
        "leadership",
        "projectManagement",
        "allocatingResources",
        "businessProcess",
        "oralCommunication",
      ];

      for (const comp in competencies) {
        if (!validCompetencies.includes(comp)) {
          return res.status(400).json({
            success: false,
            message: `Invalid competency: ${comp}`,
          });
        }

        if (competencies[comp] < 1 || competencies[comp] > 5) {
          return res.status(400).json({
            success: false,
            message: `Competency ${comp} must be between 1 and 5`,
          });
        }
      }
    }

    const updatedIndicator = await Indicator.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    if (!updatedIndicator) {
      return res.status(404).json({
        success: false,
        message: "Performance indicator not found",
      });
    }

    res.json({
      success: true,
      data: updatedIndicator,
      message: "Performance indicator updated successfully",
    });
  } catch (error) {
    console.error("Error updating performance indicator:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update performance indicator",
    });
  }
};

// @desc    Delete performance indicator
// @route   DELETE /api/indicators/:id
// @access  Private/Admin
const deleteIndicator = async (req, res) => {
 
  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid indicator ID",
      });
    }

    const deletedIndicator = await Indicator.findByIdAndDelete(req.params.id);

    if (!deletedIndicator) {
      return res.status(404).json({
        success: false,
        message: "Performance indicator not found",
      });
    }

    res.json({
      success: true,
      message: "Performance indicator deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting performance indicator:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete performance indicator",
    });
  }
};

module.exports = {
  createIndicator,
  getIndicators,
  getIndicatorById,
  updateIndicator,
  deleteIndicator,
};
