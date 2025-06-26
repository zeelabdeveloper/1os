// 📁 File: models/developer/CreateRoute.js
const mongoose = require("mongoose");

const allRouteSchema = new mongoose.Schema({
  header: {
    type: String,
    required: true,
  },
  child: {
    type: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChildRoute'
    }],
    default: [],
  },
});

const AllRoute = mongoose.model("allRoute", allRouteSchema);
module.exports = AllRoute;