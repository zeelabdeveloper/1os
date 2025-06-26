const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
     
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
     
  },
  documentType: {
    type: String,
    required: true,
  },
  documentNumber: {
    type: String,
    required: true,
  },
  documentUrl: {
    type: String,
    required: true,
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
});

DocumentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Document = mongoose.model("Document", DocumentSchema);
module.exports = Document;
