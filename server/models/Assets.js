const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  
  purchaseDate: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ExperienceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const Asset=mongoose.model("Asset", ExperienceSchema);
module.exports = Asset
