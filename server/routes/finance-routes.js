const express = require("express");
const { getAllCompanyAccount, createCompanyAccount, updateCompanyAccount, deleteCompanyAccount } = require("../controllers/financeControllers");

const router = express.Router();

router.get("/company/accounts", getAllCompanyAccount);
router.post("/company/accounts", createCompanyAccount);
router.put("/company/accounts/:id", updateCompanyAccount);
router.delete("/company/accounts/:id", deleteCompanyAccount);

module.exports = router;
