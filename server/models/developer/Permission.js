const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    unique: true
  },
  childRoutes: [{
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChildRoute',
      required: true
    },
    access: {
      type: Boolean,
      default: false
    }
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

PermissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Permission", PermissionSchema);