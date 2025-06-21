// models/Bank.js
const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountNumber: {
      type: String,
      trim: true,
      required: true,
    },
    bankName: {
      type: String,
      trim: true,
      required: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ["savings", "current", "joint", "salary", "nri", "other"],
      default: "savings",
    },
    isPrimary: {
      type: Boolean,
      default: true,
    },
    accountHolderName: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bank", BankSchema);
