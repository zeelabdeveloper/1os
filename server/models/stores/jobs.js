// User Schema
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employer', 'candidate', 'admin'], required: true },
  profile: {
    name: String,
    avatar: String,
    contact: String,
    bio: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      year: String
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

// Job Schema
const JobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  location: String,
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
  salaryRange: {
    min: Number,
    max: Number,
    currency: String
  },
  skillsRequired: [String],
  experienceRequired: String,
  postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  postedAt: { type: Date, default: Date.now },
  deadline: Date,
  isActive: { type: Boolean, default: true },
  customQuestions: [{
    question: String,
    type: { type: String, enum: ['text', 'multiple-choice', 'file'] },
    options: [String],
    required: Boolean
  }]
});

// Application Schema
const ApplicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['applied', 'reviewed', 'interviewed', 'offered', 'hired', 'rejected'],
    default: 'applied'
  },
  appliedAt: { type: Date, default: Date.now },
  resume: String,
  coverLetter: String,
  answers: [{
    question: String,
    answer: String
  }],
  interviews: [{
    scheduledAt: Date,
    type: { type: String, enum: ['phone', 'video', 'in-person'] },
    feedback: String,
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'] }
  }],
  onboarding: {
    status: { type: String, enum: ['pending', 'in-progress', 'completed'] },
    documents: [{
      name: String,
      url: String,
      status: String
    }],
    tasks: [{
      name: String,
      description: String,
      dueDate: Date,
      status: String
    }]
  }
});

// Company Schema
const CompanySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  logo: String,
  website: String,
  industry: String,
  employees: String,
  founded: Number,
  locations: [String]
});