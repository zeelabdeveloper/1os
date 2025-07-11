const express = require("express");
const {
  getInterviewSession,
  createInterviewSession,
  updateInterviewSession,
  deleteInterviewSession,
  getSessionsForApplication,
  getSessionsForInterviewer,
  updateInterviewSessionStatus,
  getInterviewRoundsByInterviewer,
  getInterviewByInterviewer,
} = require("../controllers/jobs/interviewSessionController");
const router = express.Router();

router.route("/").post(createInterviewSession);

router
  .route("/:id")
  .get(getInterviewSession)
  .put(updateInterviewSession)
  .patch(updateInterviewSessionStatus)
  .delete(deleteInterviewSession);

router.route("/:applicationId").get(getSessionsForApplication);
router
  .route("/interview-rounds/by-interviewer/:userId")
  .get(getInterviewRoundsByInterviewer);
router
  .route("/by-interviewer/:userId")
  .get(getInterviewByInterviewer);
router.route("/:interviewerId").get(getSessionsForInterviewer);

module.exports = router;
