const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    
   
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },

  isCocoEmployee: {
    type: Boolean,
    default: false,
  },
  reportingto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  contactNumber: {
    type: String,
    
  },
  EmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmployeeId",
  },
  Profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  Bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
  },
  Organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  Salary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salary",
  },
  Experience: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
    },
  ],
  Asset: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
  ],
  Document: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
  ],  
  InterviewSession: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSession",
      },
    ],


  Trainings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Training",
      },
    ],
    Letters: [{}],






  dateOfJoining: {
    type: Date,
    default: Date.now,
  },
  Store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },

  isActive: {
    type: Boolean,
    default: false,
  },
  lastLogin: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
      next();
  }










});



 
UserSchema.pre("findOneAndUpdate", async function(next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    } catch (err) {
      return next(err);
    }
  }
  next();
});







UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
const User = mongoose.model("User", UserSchema);
module.exports = User;
