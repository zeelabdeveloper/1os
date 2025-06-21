const Appraisal = require("../../models/performance/Appraisal");
const { default: mongoose } = require("mongoose");

// @desc    Create new appraisal
// @route   POST /api/appraisals
// @access  Private/Admin
const createAppraisal = async (req, res) => {
  console.log("dffdgfdgdfdd")
  try {
    const { branch, department, role, user, month, year } = req.body;

    // Validate required fields
    if (!branch || !department || !role || !user || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if appraisal already exists for this user-month-year combo
    const existingAppraisal = await Appraisal.findOne({
      user,
      month,
      year
    });

    if (existingAppraisal) {
      return res.status(400).json({
        success: false,
        message: "Appraisal already exists for this user in the selected month and year",
      });
    }

    // Validate competencies
    const requiredCompetencies = [
      "technicalSkills",
      "productivity",
      "teamwork",
      "communication",
      "initiative"
    ];

    for (const comp of requiredCompetencies) {
      if (!req.body.competencies || req.body.competencies[comp] === undefined) {
        return res.status(400).json({
          success: false,
          message: `Competency ${comp} is required`,
        });
      }

      if (req.body.competencies[comp] < 1 || req.body.competencies[comp] > 5) {
        return res.status(400).json({
          success: false,
          message: `Competency ${comp} must be between 1 and 5`,
        });
      }
    }

    // Create new appraisal
    const appraisal = new Appraisal({
      ...req.body,
      reviewer: req?.user?.id || "683fed6e4171723fde1cba1a"
    });

    const createdAppraisal = await appraisal.save();

    // Populate the response
    const populatedAppraisal = await Appraisal.findById(createdAppraisal._id)
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name")
      .populate("user", "firstName lastName email")
      .populate("reviewer", "firstName lastName");

    res.status(201).json({
      success: true,
      data: populatedAppraisal,
      message: "Appraisal created successfully",
    });
  } catch (error) {
    console.error("Error creating appraisal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create appraisal",
    });
  }
};

// @desc    Get all appraisals
// @route   GET /api/appraisals
// @access  Private/Admin
const getAppraisals = async (req, res) => {
  try {
    const { status, year, month } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (year) query.year = year;
    if (month) query.month = month;

    const appraisals = await Appraisal.find(query)
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name")
      .populate("user", "firstName lastName email")
      .populate("reviewer", "firstName lastName")
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.json({
      success: true,
      count: appraisals.length,
      data: appraisals,
    });
  } catch (error) {
    console.error("Error fetching appraisals:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appraisals",
    });
  }
};

// @desc    Get single appraisal by ID
// @route   GET /api/appraisals/:id
// @access  Private/Admin
const getAppraisalById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appraisal ID",
      });
    }

    const appraisal = await Appraisal.findById(req.params.id)
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name")
      .populate("user", "firstName lastName email")
      .populate("reviewer", "firstName lastName");

    if (!appraisal) {
      return res.status(404).json({
        success: false,
        message: "Appraisal not found",
      });
    }

    res.json({
      success: true,
      data: appraisal,
    });
  } catch (error) {
    console.error("Error fetching appraisal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appraisal",
    });
  }
};

// @desc    Get appraisals for a specific user
// @route   GET /api/users/:userId/appraisals
// @access  Private
const getUserAppraisals = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const { status, year } = req.query;
    let query = { user: req.params.userId };
    
    if (status) query.status = status;
    if (year) query.year = year;

    const appraisals = await Appraisal.find(query)
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name")
      .populate("reviewer", "firstName lastName")
      .sort({ year: -1, month: -1 });

    res.json({
      success: true,
      count: appraisals.length,
      data: appraisals,
    });
  } catch (error) {
    console.error("Error fetching user appraisals:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user appraisals",
    });
  }
};

// @desc    Update appraisal
// @route   PUT /api/appraisals/:id
// @access  Private/Admin
const updateAppraisal = async (req, res) => {
  console.log( req.params.id)
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appraisal ID",
      });
    }

    const { competencies } = req.body;

    // Validate competencies if provided
    if (competencies) {
      const validCompetencies = [
        "technicalSkills",
        "productivity",
        "teamwork",
        "communication",
        "initiative"
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
console.log( req.body)
    const updatedAppraisal = await Appraisal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name")
      .populate("user", "firstName lastName email")
      .populate("reviewer", "firstName lastName");

    if (!updatedAppraisal) {
      return res.status(404).json({
        success: false,
        message: "Appraisal not found",
      });
    }

    res.json({
      success: true,
      data: updatedAppraisal,
      message: "Appraisal updated successfully",
    });
  } catch (error) {
    console.error("Error updating appraisal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update appraisal",
    });
  }
};

// @desc    Delete appraisal
// @route   DELETE /api/appraisals/:id
// @access  Private/Admin
const deleteAppraisal = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appraisal ID",
      });
    }

    const deletedAppraisal = await Appraisal.findByIdAndDelete(req.params.id);

    if (!deletedAppraisal) {
      return res.status(404).json({
        success: false,
        message: "Appraisal not found",
      });
    }

    res.json({
      success: true,
      message: "Appraisal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting appraisal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete appraisal",
    });
  }
};

// @desc    Submit appraisal for approval
// @route   POST /api/appraisals/:id/submit
// @access  Private
const submitAppraisal = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appraisal ID",
      });
    }

    const appraisal = await Appraisal.findById(req.params.id);

    if (!appraisal) {
      return res.status(404).json({
        success: false,
        message: "Appraisal not found",
      });
    }

    if (appraisal.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft appraisals can be submitted",
      });
    }

    appraisal.status = "Submitted";
    await appraisal.save();

    res.json({
      success: true,
      message: "Appraisal submitted for approval",
      data: appraisal
    });
  } catch (error) {
    console.error("Error submitting appraisal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit appraisal",
    });
  }
};

// @desc    Approve/Reject appraisal
// @route   POST /api/appraisals/:id/review
// @access  Private/Admin
const reviewAppraisal = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appraisal ID",
      });
    }

    const { action, feedback } = req.body;

    if (!["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'Approved' or 'Rejected'",
      });
    }

    const appraisal = await Appraisal.findById(req.params.id);

    if (!appraisal) {
      return res.status(404).json({
        success: false,
        message: "Appraisal not found",
      });
    }

    if (appraisal.status !== "Submitted") {
      return res.status(400).json({
        success: false,
        message: "Only submitted appraisals can be reviewed",
      });
    }

    appraisal.status = action;
    if (feedback) appraisal.feedback = feedback;
    appraisal.reviewer = req.user.id;
    await appraisal.save();

    res.json({
      success: true,
      message: `Appraisal ${action.toLowerCase()} successfully`,
      data: appraisal
    });
  } catch (error) {
    console.error("Error reviewing appraisal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to review appraisal",
    });
  }
};

module.exports = {
  createAppraisal,
  getAppraisals,
  getAppraisalById,
  getUserAppraisals,
  updateAppraisal,
  deleteAppraisal,
  submitAppraisal,
  reviewAppraisal
};