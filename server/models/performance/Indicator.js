const mongoose = require("mongoose");

const IndicatorSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyBranch",
      required: [true, "Branch is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required"],
    },
    competencies: {
      leadership: {
        type: Number,
        required: [true, "Leadership rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      projectManagement: {
        type: Number,
        required: [true, "Project Management rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      allocatingResources: {
        type: Number,
        required: [true, "Allocating Resources rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      businessProcess: {
        type: Number,
        required: [true, "Business Process rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      oralCommunication: {
        type: Number,
        required: [true, "Oral Communication rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

 

module.exports = mongoose.model("Indicator", IndicatorSchema);