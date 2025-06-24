const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    stages: [
      {
        stageType: {
          type: String,
          enum: [
            "interview",
            "document_verification",
            "background_check",
            "training",
            "final_approval",
          ],
          required: true,
        },
        stageNumber: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed", "passed", "failed"],
          default: "pending",
        },
        // For interview rounds
        interviewRound: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InterviewRound",
        },
        interviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        interviewFeedback: String,
        scheduledDate: Date,
        completedDate: Date,

        
        backgroundCheckStatus: String,
        backgroundCheckReport: String,

        // For training
        trainingDetails: {
          startDate: Date,
          endDate: Date,
          trainer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          skillsCovered: [String],
          evaluationScore: Number,
        },

        // For final approval
        approvalDetails: {
          approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          approvedAt: Date,
          designation: String,
          salary: Number,
          joiningDate: Date,
        },
      },
    ],
    currentStage: {
      type: Number,
      default: 1,
    },
    overallStatus: {
      type: String,
      enum: ["in_progress", "completed", "terminated"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);
const Onboarding = mongoose.model("Onboarding", onboardingSchema);
module.exports = Onboarding;
