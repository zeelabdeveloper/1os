const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  period: {
    type: String,
    required: true,
    enum: ["quarterly", "half-yearly", "annual", "adhoc"]
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["draft", "in-progress", "completed", "approved", "rejected"],
    default: "draft"
  },
  goals: [{
    description: {
      type: String,
      required: true
    },
    weightage: {
      type: Number,
      min: 1,
      max: 100
    },
    selfRating: {
      type: Number,
      min: 1,
      max: 5
    },
    reviewerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String
  }],
  skills: [{
    skillName: {
      type: String,
      required: true
    },
    selfRating: {
      type: Number,
      min: 1,
      max: 5
    },
    reviewerRating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  },
  strengths: [String],
  areasForImprovement: [String],
  feedback: String,
  attendanceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate overall rating before save
performanceSchema.pre('save', function(next) {
  if (this.isModified('goals') || this.isModified('skills')) {
    const goalRatings = this.goals.filter(g => g.reviewerRating).map(g => g.reviewerRating);
    const skillRatings = this.skills.filter(s => s.reviewerRating).map(s => s.reviewerRating);
    const allRatings = [...goalRatings, ...skillRatings];
    
    if (allRatings.length > 0) {
      this.overallRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
    }
  }
  next();
});

// Virtual for performance period display
performanceSchema.virtual('periodDisplay').get(function() {
  const periodMap = {
    quarterly: 'Quarterly',
    "half-yearly": 'Half Yearly',
    annual: 'Annual',
    adhoc: 'Adhoc'
  };
  return periodMap[this.period] || this.period;
});

const Performance = mongoose.model("Performance", performanceSchema);

module.exports = Performance;