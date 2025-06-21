const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    match: /^[A-Z]{2,5}$/,
    trim: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyBranch",
    required: true
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
  budget: {
    type: Number,
    min: 0,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
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

DepartmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});


const Department = mongoose.model("Department", DepartmentSchema);
module.exports = Department;