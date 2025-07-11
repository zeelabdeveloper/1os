const mongoose = require("mongoose");

const ZoneSchema = new mongoose.Schema({
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

ZoneSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Zone = mongoose.model("Zone", ZoneSchema);
module.exports = Zone;