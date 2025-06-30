const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    LetterTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LetterTemplate",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", OrganizationSchema);
