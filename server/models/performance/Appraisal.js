 const mongoose = require("mongoose");

const AppraisalSchema = new mongoose.Schema(
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    month: {
      type: String,
      required: [true, "Appraisal month is required"],
      enum: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
    },
    year: {
      type: Number,
      required: [true, "Appraisal year is required"],
      min: [2000, "Year must be after 2000"],
      max: [2100, "Year must be before 2100"]
    },
    overallRating: {
      type: Number,
      required: [true, "Overall rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"]
    },
    competencies: {
      technicalSkills: {
        type: Number,
        required: [true, "Technical skills rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      productivity: {
        type: Number,
        required: [true, "Productivity rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      teamwork: {
        type: Number,
        required: [true, "Teamwork rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      communication: {
        type: Number,
        required: [true, "Communication rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      initiative: {
        type: Number,
        required: [true, "Initiative rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      }
    },
    strengths: {
      type: [String],
      default: []
    },
    areasForImprovement: {
      type: [String],
      default: []
    },
    feedback: {
      type: String,
      maxlength: [1000, "Feedback cannot exceed 1000 characters"]
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer is required"]
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected"],
      default: "Draft"
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for performance
AppraisalSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Appraisal", AppraisalSchema);