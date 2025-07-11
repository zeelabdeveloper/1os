const mongoose = require("mongoose");

const employeeRequestSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  department: {
    type: String,
  },
  position: {
    type: String,
  },
  countRequired: [
    {
      type: String,
    },
  ],
  store: {
    type: String,
  },
  jobDescription: {
    type: String,
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "fulfilled"],
    default: "pending",
  },
  adminFeedback: {
    type: String,
    default: "",
  },

  candidateDetails: {
    name: String,
    resumeUrl: String,
    contact: String,
    interviewDate: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const managerCandidateRequests = mongoose.model(
  "ManagerCandidateRequest",
  employeeRequestSchema
);

module.exports = managerCandidateRequests;
