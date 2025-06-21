const { CompanyAccount } = require("../models/CompanyFinance");

// Get all company accounts
exports.getAllCompanyAccount = async (req, res) => {
  try {
    const accounts = await CompanyAccount.find().sort({ createdAt: -1 });
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch company accounts",
      error: err.message,
    });
  }
};

// Create new company account
exports.createCompanyAccount = async (req, res) => {
  try {
    if (req.body.accountNumber) {
      const existingAccount = await CompanyAccount.findOne({
        accountNumber: req.body.accountNumber,
      });

      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: "Account number already exists",
        });
      }
    }

    const account = new CompanyAccount({
      accountHolder: req.body.accountHolder,
      accountNumber:
        req.body.accountNumber ||
        Math.floor(100000000 + Math.random() * 900000000).toString(),
      balance: req.body.balance,
      accountType: req.body.accountType,
      status: req.body.status || "Active",
    });

    const newAccount = await account.save();

    res.status(201).json({
      success: true,
      message: "Company account created successfully",
      data: newAccount,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create company account",
      error: err.message,
    });
  }
};

// Update a company account
exports.updateCompanyAccount = async (req, res) => {
 
  try {
    const account = await CompanyAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (
      req.body.accountNumber &&
      req.body.accountNumber !== account.accountNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Account number cannot be changed",
      });
    }

    account.accountHolder = req.body.accountHolder || account.accountHolder;
    account.balance = req.body.balance || account.balance;
    account.accountType = req.body.accountType || account.accountType;
    account.status = req.body.status || account.status;
    account.updatedAt = Date.now();

    const updatedAccount = await account.save();

    res.status(200).json({
      success: true,
      message: "Company account updated successfully",
      data: updatedAccount,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update company account",
      error: err.message,
    });
  }
};

// Delete a company account
exports.deleteCompanyAccount = async (req, res) => {
    
  try {
    const account = await CompanyAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    await account.deleteOne();

    res.status(200).json({
      success: true,
      message: "Company account deleted successfully",
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Failed to delete company account",
      error: err.message,
    });
  }
};
