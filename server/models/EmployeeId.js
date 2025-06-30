const mongoose = require("mongoose");

const EmployeeIdSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    set: (value) => value.toUpperCase(),
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EmployeeId", EmployeeIdSchema);
