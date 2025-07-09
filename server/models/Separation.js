const mongoose = require("mongoose");

const SeparationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  separationType: {
    type: String,
    enum: ["resignation", "termination", "retirement", "other"],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  noticePeriod: {
    type: Number, // in days
    default: 30
  },
  expectedSeparationDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "under_review"],
    default: "pending"
  },
  adminComments: String,
  exitInterview: {
    conducted: Boolean,
    date: Date,
    notes: String
  },
  assetsReturned: {
    type: Boolean,
    default: false
  },
  clearance: {
    finance: Boolean,
    it: Boolean,
    hr: Boolean,
    admin: Boolean
  },
  documents: [{
    name: String,
    url: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

SeparationSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});
const Separation= mongoose.model("Separation", SeparationSchema);
module.exports =Separation