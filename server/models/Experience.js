const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  employmentType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship", "freelance"],
    required: true,
  },
  location: String,
  startDate: {
    type: Date,
   
  },
  endDate: Date,
  currentlyWorking: {
    type: Boolean,
    default: false,
  },
  description: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ExperienceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const Experience=mongoose.model("Experience", ExperienceSchema);
module.exports = Experience
