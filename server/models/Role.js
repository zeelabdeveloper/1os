const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyBranch",
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
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

RoleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
