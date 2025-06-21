const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  dob: Date,
  weaknesses: String,
  resume: {
    type: String,
    required: true,
  },
  coverLetter: String,
  status: {
    type: String,
    enum: ["applied", "phone_screen",  "onboarding" , "interview", "hired", "rejected"],
    default: "applied",
  },
 
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
