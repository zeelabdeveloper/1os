const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

 
const Branch = mongoose.model('CompanyBranch', branchSchema);
module.exports = Branch
