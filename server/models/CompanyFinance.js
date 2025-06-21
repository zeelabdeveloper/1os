const mongoose=require('mongoose');

const accountSchema = new mongoose.Schema({
  accountHolder: { type: String, required: true },
  accountNumber: { 
    type: String, 
    required: true,
    unique: true,
    default: () => Math.floor(100000000 + Math.random() * 900000000).toString()
  },
  balance: { type: Number, required: true, min: 0 },
  accountType: { 
    type: String, 
    required: true,
    enum: ['Savings', 'Current', 'Fixed Deposit', 'Recurring Deposit']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Dormant', 'Closed'],
    default: 'Active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CompanyAccount = mongoose.model('CompBankAccount', accountSchema);

module.exports = {CompanyAccount};












// const mongoose = require('mongoose');

// const BankSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },

 
    
 
//   accountNumber: {
//     type: String,
//     required: true


//   },
//   accountHolderName: {
//     type: String,
//     required: true
//   },
//   bankName: {
//     type: String,
//     required: true
//   },
//   branchName: String,
//   branchCode: String,
//   accountType: {
//     type: String,
//     enum: ['savings', 'current', 'salary', 'fixed-deposit'],
//     required: true
//   },
//   ifscCode: {
//     type: String,
//     required: true
//   },
//   panNumber: {
//     type: String,
//     uppercase: true,
//     match: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
//     required: true
//   },
//   taxDeductionDetails: {
//     section80C: Number,
//     section80D: Number,
//     otherDeductions: Number
//   },
//   isPrimary: {
//     type: Boolean,
//     default: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// BankSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model('Bank', BankSchema); 