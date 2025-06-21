const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompBankAccount'
  },
  month: {
    type: Number,
   
  },
  year: {
    type: Number,
    
    
  },
  // Earnings
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  hra: {
    type: Number,
    default: 0,
    min: 0
  },
  conveyance: {
    type: Number,
    default: 0,
    min: 0
  },
  medical: {
    type: Number,
    default: 0,
    min: 0
  },
  otherAllow: {
    type: Number,
    default: 0,
    min: 0
  },
  // Deductions
  pf: {
    type: Number,
    default: 0,
    min: 0
  },
  vpf: {
    type: Number,
    default: 0,
    min: 0
  },
  tds: {
    type: Number,
    default: 0,
    min: 0
  },
  esi: {
    type: Number,
    default: 0,
    min: 0
  },
  lwf: {
    type: Number,
    default: 0,
    min: 0
  },
  lpd: {
    type: Number,
    default: 0,
    min: 0
  },
  otherDeduction: {
    type: Number,
    default: 0,
    min: 0
  },
  // Special Cases
  advancePay: {
    type: Number,
    default: 0,
    min: 0
  },
  // Meta
  paymentFrequency: {
    type: String,
    enum: ['monthly',   'weekly',  ],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['draft', 'processed', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentDate: {
    type: Date
  },
  remarks: String,
  
  grossSalary: {
    type: Number,
    min: 0
  },
  totalDeductions: {
    type: Number,
    min: 0
  },
  netSalary: {
    type: Number,
    min: 0
  }
}, { timestamps: true });

// Calculate totals before saving
SalarySchema.pre('save', function(next) {
  // Calculate earnings
  const earnings = this.basicSalary + this.hra + this.conveyance + 
                  this.medical + this.otherAllow;
  
  // Calculate deductions
  const deductions = this.pf + this.vpf + this.tds + this.esi + 
                   this.lwf + this.lpd + this.otherDeduction + this.advancePay;
  
  // Set calculated fields
  this.grossSalary = earnings;
  this.totalDeductions = deductions;
  this.netSalary = earnings - deductions;
  
  next();
});

// Compound index to prevent duplicate salary records
SalarySchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', SalarySchema);