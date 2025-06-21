// models/Onboarding.js
const mongoose = require("mongoose");

const OnboardingSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
     
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    workLocation: {
      type: String,
      enum: ["office", "remote", "hybrid"],
      required: true,
    },
    equipmentNeeded: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
const Onboarding = mongoose.model("Onboarding", OnboardingSchema);
module.exports = Onboarding;
