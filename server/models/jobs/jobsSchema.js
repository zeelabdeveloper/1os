const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    location: { type: String, required: true },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "CompanyBranch",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    startDate: Date,
    endDate: Date,
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, enum: ["INR", "USD"], default: "INR" },
    },
    experience: {
      type: String,
      enum: ["0-1", "1-3", "3-5", "5+"],
    },
    skills: [String],
    customQuestions: [
      {
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "multiple-choice", "file"],
          required: true,
        },
        options: [String],
        required: Boolean,
      },
    ],
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const job = mongoose.model("Job", JobSchema);
module.exports = job;
