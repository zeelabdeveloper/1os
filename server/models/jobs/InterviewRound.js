const mongoose=require('mongoose')

const interviewRoundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);
const InterViewRound = mongoose.model("InterviewRound", interviewRoundSchema);
module.exports = InterViewRound;
