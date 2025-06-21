const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyBranch",
      required: [true, "Branch is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required"],
    },
    goalType: {
      type: String,
      required: [true, "Goal type is required"],
      enum: ["short-term", "long-term", "quarterly", "annual", "other"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    targetAchievement: {
      type: String,
      required: [true, "Target achievement is required"],
    },
    currentProgress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be less than 0"],
      max: [100, "Progress cannot exceed 100"],
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    progressHistory: [
      {
        progress: Number,
        date: Date,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Goal", GoalSchema);
