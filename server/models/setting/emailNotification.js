const mongoose = require("mongoose");

const emailSettingSchema = new mongoose.Schema(
  {
    newUser: { type: Boolean, default: true },
    newEmployee: { type: Boolean, default: true },
    newPayroll: { type: Boolean, default: true },
    newTicket: { type: Boolean, default: true },
    newAward: { type: Boolean, default: true },
    employeeTransfer: { type: Boolean, default: true },
    employeeResignation: { type: Boolean, default: true },
    employeeTrip: { type: Boolean, default: true },
    employeePromotion: { type: Boolean, default: true },
    employeeComplaints: { type: Boolean, default: true },
    employeeWarning: { type: Boolean, default: true },
    employeeTermination: { type: Boolean, default: true },

    // Leave Management
    leaveStatus: { type: Boolean, default: true },
    contract: { type: Boolean, default: true },
    newLeaveRequest: { type: Boolean, default: true },

    // Other Notifications
    newComplaint: { type: Boolean, default: true },
    newWarning: { type: Boolean, default: true },
    newNews: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const EmailNotification = mongoose.model("EmailNotification", emailSettingSchema);
module.exports = EmailNotification;
