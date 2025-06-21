const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyBranch",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    employmentType: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "contract",
        "internship",
        "trainee",
        "other",
      ],
      default: "full-time",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", OrganizationSchema);
