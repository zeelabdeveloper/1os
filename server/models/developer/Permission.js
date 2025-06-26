const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    unique: true
  },
  permissions: [{
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChildRoute',
      required: true
    },
    access: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PermissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

PermissionSchema.virtual('allowedRoutes', {
  ref: 'ChildRoute',
  localField: 'permissions.route',
  foreignField: '_id',
  match: { 'permissions.access': true }
});

module.exports = mongoose.model("Permission", PermissionSchema);