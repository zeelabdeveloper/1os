// 📁 File: models/developer/ChildRoute.js
const mongoose = require("mongoose");

const ChildSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const ChildRoute = mongoose.model("ChildRoute", ChildSchema);
module.exports = ChildRoute;