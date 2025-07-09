const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  currentLocation: {
    type: String,
  },
  division: {
    type: String,
  },
  position: {
    type: String,
  },
  zone: {
    type: String,
  },
  salary: {
    type: String,
  },
  experience: {
    type: String,
  },
  education: {
    type: String,
  },
  currentCompany: {
    type: String,
  },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  dob: Date,
  weaknesses: String,
  resume: {
    type: String,
  },
  coverLetter: String,
  status: {
    type: String,

    default: "applied",
  },

  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
