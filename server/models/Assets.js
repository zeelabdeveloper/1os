const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
  user: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
      
   },
   applicationId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Application",
      
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

AssetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const Asset=mongoose.model("Asset", AssetSchema);
module.exports = Asset
