const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    stages: [
      {
        stageType: {
          type: String,
          enum: [
            "interview",
            "document_verification",
            "background_check",
            "training",
            "final_approval",
          ],
          required: true,
        },
        stageNumber: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed", "passed", "failed"],
          default: "pending",
        },
        // For interview rounds
        interviewRound: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InterviewRound",
        },
        interviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        interviewFeedback: String,
        scheduledDate: Date,
        completedDate: Date,

        
        backgroundCheckStatus: String,
        backgroundCheckReport: String,

        // For training
        trainingDetails: {
          startDate: Date,
          endDate: Date,
          trainer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          skillsCovered: [String],
          evaluationScore: Number,
        },

        // For final approval
        approvalDetails: {
          approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          approvedAt: Date,
          designation: String,
          salary: Number,
          joiningDate: Date,
        },
      },
    ],
    currentStage: {
      type: Number,
      default: 1,
    },
    overallStatus: {
      type: String,
      enum: ["in_progress", "completed", "terminated"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);
const Onboarding = mongoose.model("Onboarding", onboardingSchema);
module.exports = Onboarding;



// const mongoose = require("mongoose");

// const onboardingSchema = new mongoose.Schema(
//   {
//     candidate: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Application",
//       required: true,
//       unique: true,
//     },
//     stages: [
//       {
//         stageType: {
//           type: String,
//           enum: [
//             "interview",
//             "document_verification",
//             "background_check",
//             "training",
//             "final_approval",
//             "asset_allocation",
//             "joining_process"
//           ],
//           required: true,
//         },
//         stageNumber: {
//           type: Number,
//           required: true,
//         },
//         status: {
//           type: String,
//           enum: ["pending", "in_progress", "completed", "passed", "failed"],
//           default: "pending",
//         },
        
//         // For interview rounds
//         interviewRound: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "InterviewRound",
//         },
//         interviewer: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//         },
//         interviewFeedback: String,
//         scheduledDate: Date,
//         completedDate: Date,

//         // Document verification
//         documents: [{
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Document",
//         }],
//         documentsVerified: {
//           type: Boolean,
//           default: false,
//         },

//         // Background check
//         backgroundCheckStatus: String,
//         backgroundCheckReport: String,

//         // Training details
//         trainingDetails: {
//           startDate: Date,
//           endDate: Date,
//           trainer: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//           },
//           skillsCovered: [String],
//           evaluationScore: Number,
//           completed: Boolean,
//           certificate: String, // URL to certificate
//         },

//         // Asset allocation
//         assets: [{
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Asset",
//         }],
//         assetsAllocated: Boolean,

//         // Joining process
//         joiningDetails: {
//           offerLetter: {
//             received: Boolean,
//             url: String,
//             receivedDate: Date,
//           },
//           joiningLetter: {
//             received: Boolean,
//             url: String,
//             receivedDate: Date,
//           },
//           appointmentLetter: {
//             received: Boolean,
//             url: String,
//             receivedDate: Date,
//           },
//           joiningKit: {
//             received: Boolean,
//             items: [String],
//             receivedDate: Date,
//           },
//           joiningDate: Date,
//         },

//         // Final approval
//         approvalDetails: {
//           approvedBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//           },
//           approvedAt: Date,
//           designation: String,
//           salary: Number,
//           joiningDate: Date,
//         },
//       },
//     ],
//     currentStage: {
//       type: Number,
//       default: 1,
//     },
//     overallStatus: {
//       type: String,
//       enum: ["in_progress", "completed", "terminated"],
//       default: "in_progress",
//     },
//   },
//   { 
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true } 
//   }
// );

// // Add documents and assets directly to onboarding for easy access
// onboardingSchema.virtual("allDocuments", {
//   ref: "Document",
//   localField: "stages.documents",
//   foreignField: "_id",
//   justOne: false,
// });

// onboardingSchema.virtual("allAssets", {
//   ref: "Asset",
//   localField: "stages.assets",
//   foreignField: "_id",
//   justOne: false,
// });

// const Onboarding = mongoose.model("Onboarding", onboardingSchema);
// module.exports = Onboarding;