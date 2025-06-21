const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    photo: {
      type: String,
      default: "",
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
    },
    address: String,
    state: String,
    district: String,
    family: {
      fatherName: {
        type: String,
        trim: true,
      },
      fatherOccupation: {
        type: String,
        trim: true,
      },
      motherName: {
        type: String,
        trim: true,
      },
      motherOccupation: {
        type: String,
        trim: true,
      },
      numberOfBrothers: {
        type: Number,
        default: 0,
        min: 0,
      },
      numberOfSisters: {
        type: Number,
        default: 0,
        min: 0,
      },
      hasCrimeRecord: {
        type: String,
        enum: ["yes", "no", null],
        default: null,
      },
      crimeReason: String,
    },

    education: {
      highestQualification: String,
      institution: String,
      yearOfCompletion: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ProfileSchema.pre("save", function (next) {
  // Convert string numbers to actual numbers if provided
  if (this.family) {
    if (typeof this.family.numberOfBrothers === "string") {
      this.family.numberOfBrothers =
        parseInt(this.family.numberOfBrothers) || 0;
    }
    if (typeof this.family.numberOfSisters === "string") {
      this.family.numberOfSisters = parseInt(this.family.numberOfSisters) || 0;
    }
  }

  next();
});
const Profile= mongoose.model("Profile", ProfileSchema)
module.exports =Profile;
