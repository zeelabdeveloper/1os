const express = require("express");
const router = express.Router();
 
const {
  getAllDocuments,
  createOrUpdateDocument,
  getUserDocuments,
  deleteDocument,
 
} = require("../controllers/jobs/documentController");
 
// User routes
router.post("/", createOrUpdateDocument);
router.get("/my-documents/:applicationId", getUserDocuments);
router.delete("/:id", deleteDocument);

// Admin routes
router.get("/", getAllDocuments);
 

module.exports = router;
