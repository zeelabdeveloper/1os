const Goal = require("../../models/performance/Goal");
const { default: mongoose } = require("mongoose");

 
const createGoal = async (req, res) => {
  try {
    const { 
      branch, 
      department, 
      role, 
      goalType, 
      subject, 
      description, 
      startDate, 
      endDate, 
      targetAchievement 
    } = req.body;

    // Validate required fields
    if (!branch || !department || !role || !goalType || !subject || !startDate || !endDate || !targetAchievement) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create new goal
    const goal = new Goal({
      branch,
      department,
      role,
      goalType,
      subject,
      description,
      startDate,
      endDate,
      targetAchievement,
      currentProgress: 0,
      status: "not-started",
      progressHistory: [],
    });

    const createdGoal = await goal.save();

    // Populate the response
    const populatedGoal = await Goal.findById(createdGoal._id)
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    res.status(201).json({
      success: true,
      data: populatedGoal,
      message: "Goal created successfully",
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create goal",
    });
  }
};

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private/Admin
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({})
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch goals",
    });
  }
};

// @desc    Get single goal by ID
// @route   GET /api/goals/:id
// @access  Private/Admin
const getGoalById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID",
      });
    }

    const goal = await Goal.findById(req.params.id)
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch goal",
    });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private/Admin
const updateGoal = async (req, res) => {
  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID",
      });
    }

    const { currentProgress, status, progressNotes, ...otherUpdates } = req.body;

    // Get existing goal
    const existingGoal = await Goal.findById(req.params.id);
    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    // Prepare update data
    const updateData = { 
      ...otherUpdates,
      updatedAt: new Date() // Explicitly update the timestamp
    };

    // Handle progress update with history
    if (typeof currentProgress !== 'undefined' && currentProgress !== existingGoal.currentProgress) {
      // Validate progress value
      if (currentProgress < 0 || currentProgress > 100) {
        return res.status(400).json({
          success: false,
          message: "Progress must be between 0 and 100"
        });
      }

      updateData.currentProgress = currentProgress;
      updateData.progressHistory = [
        ...(existingGoal.progressHistory || []),
        {
          progress: currentProgress,
          date: new Date(),
          notes: progressNotes || "",
        },
      ];

      // Auto-update status based on progress
      if (currentProgress === 100) {
        updateData.status = 'completed';
      } else if (currentProgress > 0) {
        updateData.status = 'in-progress';
      }
    }

    // Handle status update separately
    if (status && status !== existingGoal.status) {
      updateData.status = status;
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
        context: 'query' // Ensures proper validation
      }
    )
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found after update",
      });
    }

    res.json({
      success: true,
      data: updatedGoal,
      message: "Goal updated successfully",
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    
    // Handle specific Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update goal",
    });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private/Admin
const deleteGoal = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID",
      });
    }

    const deletedGoal = await Goal.findByIdAndDelete(req.params.id);

    if (!deletedGoal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete goal",
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};