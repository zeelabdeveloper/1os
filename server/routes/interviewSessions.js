const express = require("express");
const {
  
  getInterviewSession,
  createInterviewSession,
  updateInterviewSession,
  deleteInterviewSession,
  getSessionsForApplication,
  getSessionsForInterviewer,
  updateInterviewSessionStatus,
} = require("../controllers/jobs/interviewSessionController");
const router = express.Router();

router.route("/").post(createInterviewSession);

router
  .route("/:id")
  .get(getInterviewSession)
  .put(updateInterviewSession)
  .patch(updateInterviewSessionStatus)
  .delete(deleteInterviewSession);

router.route("/:applicationId").get( getSessionsForApplication);

router.route("/:interviewerId").get( getSessionsForInterviewer);

module.exports = router;
