const express = require("express");
const router = express.Router();
 
const {
  getAllDocuments,
  createOrUpdateDocument,
  getUserDocuments,
  deleteDocument,
  updateVerificationStatus,
} = require("../controllers/jobs/documentController");
 
// User routes
router.post("/", createOrUpdateDocument);
router.get("/my-documents", getUserDocuments);
router.delete("/:id", deleteDocument);

// Admin routes
router.get("/", getAllDocuments);
router.put("/:id/verify", updateVerificationStatus);

module.exports = router;
