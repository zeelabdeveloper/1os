const express = require("express");
const {
  getInterviewSessions,
  getInterviewSession,
  createInterviewSession,
  updateInterviewSession,
  deleteInterviewSession,
  getSessionsForApplication,
  getSessionsForInterviewer,
} = require("../controllers/jobs/interviewSessionController");
const router = express.Router();

router.route("/").post(createInterviewSession);

router
  .route("/:id")
  .get(getInterviewSession)
  .put(updateInterviewSession)
  .delete(deleteInterviewSession);

router.route("/:applicationId").get( getSessionsForApplication);

router.route("/:interviewerId").get( getSessionsForInterviewer);

module.exports = router;
