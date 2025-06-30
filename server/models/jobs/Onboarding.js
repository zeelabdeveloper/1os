const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
       
    },

    InterviewSession: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSession",
      },
    ],

    Document: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    Asset: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
    Trainings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Training",
      },
    ],
    Letters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RelevantLetter",
      },
    ],

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
