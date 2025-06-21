const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "present",
        "absent",
        "Casual Leave",
        "leave",
        "half-day",
        "pending",
        "approved",
        "rejected",
      ],
      required: true,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    hoursWorked: {
      type: Number,
    },
    location: {
      type: String,
      trim: true,
    },
    leaveType: {
      type: String,
      enum: ["Casual Leave", "Sick Leave", "Personal Leave", "Other"],
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ userId: 1, status: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
