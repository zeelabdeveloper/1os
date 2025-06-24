// const InterviewSession = require('../models/InterviewSession');
// const InterviewRound = require('../models/InterviewRound');
// const Application = require('../models/Application');
// const { sendInterviewScheduledEmail } = require('../services/emailService');

const Application = require("../../models/jobs/applicationSchema");
const InterViewRound = require("../../models/jobs/InterviewRound");
const InterviewSession = require("../../models/jobs/InterviewSession");

// @desc    Get single interview session
// @route   GET /api/v1/interview/interviewSessions/:id
// @access  Private
exports.getInterviewSession = async (req, res, next) => {
  try {
    const interviewSessions = await InterviewSession.find({
      applicationId: req.params.id,
    }).populate("interviewRoundId applicationId")

    if (!interviewSessions || interviewSessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No interview sessions found for that application ID",
      });
    }

    res.status(200).json(interviewSessions);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
// @desc    Create new interview session
// @route   POST /api/v1/interview/interviewSessions
// @access  Private
exports.createInterviewSession = async (req, res, next) => {
  try {
    const {
      interviewRoundId,
      applicationId,
      timeRange, // [startTime, endTime]
      meetingLink,
      notes,
    } = req.body;
    console.log(req.body);
    // Validate required fields
    if (
      !interviewRoundId ||
      !applicationId ||
      !timeRange ||
      !Array.isArray(timeRange) ||
      timeRange.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: interviewRoundId, applicationId, and timeRange are required",
      });
    }

    const [startTime, endTime] = timeRange;

    // Check if application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found with that ID",
      });
    }

    // Get interview round with interviewer
    const interviewRound = await InterViewRound.findById(
      interviewRoundId
    ).populate("interviewer");
    if (!interviewRound) {
      return res.status(404).json({
        success: false,
        message: "No interview round found with that ID",
      });
    }

    // Check for scheduling conflicts (both for interviewer and candidate)
    const conflictingSession = await InterviewSession.findOne({
      $or: [
        {
          interviewerId: interviewRound.interviewer._id,
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
          ],
        },
        {
          applicationId,
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
          ],
        },
      ],
    });

    if (conflictingSession) {
      return res.status(400).json({
        success: false,
        message: "Scheduling conflict detected",
        conflictWith: conflictingSession._id,
      });
    }

    // Create new session
    const interviewSession = await InterviewSession.create({
      applicationId,
      interviewRoundId,
      interviewerId: interviewRound.interviewer._id,
      startTime,
      endTime,
      meetingLink: meetingLink || "",
      notes: notes || "",
      status: "scheduled",
    });

    // Update application status if needed
    if (
      application.status === "applied" ||
      application.status === "phone_screen"
    ) {
      application.status = "interview";
      await application.save();
    }

    // Send email notifications
    // try {
    // //   await sendInterviewScheduledEmail({
    // //     candidateEmail: application.email,
    // //     candidateName: application.name,
    // //     interviewerName: interviewRound.interviewer.name,
    // //     startTime,
    // //     endTime,
    // //     meetingLink,
    // //     position: application.jobId.title
    // //   });
    // } catch (emailError) {
    //   console.error('Failed to send email notification:', emailError);
    // }

    res.status(201).json({
      success: true,
      message: "Interview created",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Update interview session
// @route   PUT /api/v1/interview/interviewSessions/:id
// @access  Private
exports.updateInterviewSession = async (req, res, next) => {
  try {
    let session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "No interview session found with that ID",
      });
    }

    // Handle time updates separately
    if (req.body.timeRange) {
      const [startTime, endTime] = req.body.timeRange;
      req.body.startTime = startTime;
      req.body.endTime = endTime;
      delete req.body.timeRange;

      // Check for scheduling conflicts when time is updated
      const conflictingSession = await InterviewSession.findOne({
        _id: { $ne: session._id }, // Exclude current session
        $or: [
          {
            interviewerId: session.interviewerId,
            $or: [
              { startTime: { $lt: endTime, $gte: startTime } },
              { endTime: { $gt: startTime, $lte: endTime } },
              { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
            ],
          },
          {
            applicationId: session.applicationId,
            $or: [
              { startTime: { $lt: endTime, $gte: startTime } },
              { endTime: { $gt: startTime, $lte: endTime } },
              { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
            ],
          },
        ],
      });

      if (conflictingSession) {
        return res.status(400).json({
          success: false,
          error: "Scheduling conflict detected",
          conflictWith: conflictingSession._id,
        });
      }
    }

    // Update session
    session = await InterviewSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("interviewRound")
      .populate("application")
      .populate("interviewer");

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Delete interview session
// @route   DELETE /api/v1/interview/interviewSessions/:id
// @access  Private
exports.deleteInterviewSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
console.log(session)
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "No interview session found with that ID",
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Get interview sessions for a specific application
// @route   GET /api/v1/interview/interviewSessions/application/:applicationId
// @access  Private
exports.getSessionsForApplication = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({
      applicationId: req.params.applicationId,
    })
      .populate("interviewRound")
      .populate("interviewer")
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Get interview sessions for a specific interviewer
// @route   GET /api/v1/interview/interviewSessions/interviewer/:interviewerId
// @access  Private
exports.getSessionsForInterviewer = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    let query = InterviewSession.find({
      interviewerId: req.params.interviewerId,
    })
      .populate("application")
      .populate("interviewRound");

    if (from && to) {
      query = query
        .where("startTime")
        .gte(new Date(from))
        .where("endTime")
        .lte(new Date(to));
    }

    const sessions = await query.sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
