const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    trainingType: {
      type: String,
      required: true,
      enum: ["Technical", "Soft Skills", "Induction", "Other"],
    },
    trainingStartDate: {
      type: Date,
      required: true,
    },

    trainingEndDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },

    notes: String,
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  {
    timestamps: true,
  }
);

trainingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Training = mongoose.model("Training", trainingSchema);
module.exports = Training;
