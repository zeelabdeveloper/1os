const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
  createApplication,
  getApplicationsForJob,
  updateApplicationStatus,
  deleteApplicationStatus,
  fetchApplicationById,
} = require("../controllers/jobs/jobsController.js");

const router = express.Router();

router.post("/", createJob);
router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);
router.get("/stats/all", getJobStats);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/resumes");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "resume-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

router.post("/applications", upload.single("resume"), createApplication);
router.get("/applications/status", getApplicationsForJob);
router.get("/application/:id", fetchApplicationById);


router.patch("/application/:id/status", updateApplicationStatus);
router.delete("/application/:id/status", deleteApplicationStatus);

module.exports = router;
