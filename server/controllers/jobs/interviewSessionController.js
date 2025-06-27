const Application = require("../../models/jobs/applicationSchema");
const InterViewRound = require("../../models/jobs/InterviewRound");
const InterviewSession = require("../../models/jobs/InterviewSession");
const Onboarding = require("../../models/jobs/Onboarding");
const mongoose=require('mongoose')
// @desc    Get single interview session
// @route   GET /api/v1/interview/interviewSessions/:id
// @access  Private
exports.getInterviewSession = async (req, res, next) => {
  try {
    const interviewSessions = await InterviewSession.find({
      applicationId: req.params.id,
    })
      .populate("applicationId") // basic populate for Application
      .populate({
        path: "interviewRoundId", // from InterviewSession
        populate: {
          path: "interviewer", // from InterviewRound
          model: "User", // adjust if you named the model differently
        },
      });

    if (!interviewSessions || interviewSessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No interview sessions found for that application ID",
      });
    }

    res.status(200).json(interviewSessions);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};


exports.getInterviewRoundsByInterviewer = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const interviewRounds = await InterViewRound.find({ interviewer: userId })
      .populate('interviewer', 'name email')
      .sort({ roundNumber: 1 }); 

    res.status(200).json({
      success: true,
      data: interviewRounds,
      message: interviewRounds.length > 0 
        ? 'Interview rounds fetched successfully' 
        : 'No interview rounds found for this user'
    });
  } catch (error) {
    console.error('Error fetching interview rounds:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interview rounds'
    });
  }
};


// @desc    Create new interview session
// @route   POST /api/v1/interview/interviewSessions
// @access  Private
exports.createInterviewSession = async (req, res, next) => {
  try {
    const { interviewRoundId, applicationId, timeRange, meetingLink, notes } =
      req.body;

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

    // Push interview session to existing onboarding or create new
    const existingOnboarding = await Onboarding.findOne({ applicationId });

    if (existingOnboarding) {
      existingOnboarding.InterviewSession.push(interviewSession._id);
      await existingOnboarding.save();
    } else {
      const newOnboarding = new Onboarding({
        applicationId,
        InterviewSession: [interviewSession._id],
      });
      await newOnboarding.save();
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
      message: err.message,
    });
  }
};

// @desc    Update interview session
// @route   PUT /api/v1/interview/interviewSessions/:id
// @access  Private
exports.updateInterviewSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle timeRange if provided
    if (updateData.timeRange) {
      if (!Array.isArray(updateData.timeRange)) {
        return res.status(400).json({
          success: false,
          message: "timeRange must be an array [startTime, endTime]",
        });
      }
      if (updateData.timeRange.length !== 2) {
        return res.status(400).json({
          success: false,
          message:
            "timeRange must contain exactly 2 elements [startTime, endTime]",
        });
      }
      updateData.startTime = updateData.timeRange[0];
      updateData.endTime = updateData.timeRange[1];
      delete updateData.timeRange;
    }

    const session = await InterviewSession.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No interview session found with that ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: session,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateInterviewSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isOutCome } = req.body;

    const session = await InterviewSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No interview session found with that ID",
      });
    }

    // Outcome update has priority if isOutCome is true
    if (isOutCome) {
      const validOutcome = ["selected", "rejected", "hold"];
      if (!validOutcome.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid outcome value. Allowed: selected, rejected, hold",
        });
      }
      session.outcome = status;
    }
    // Status update
    else if (status) {
      const validStatus = [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
      ];
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      // Additional validation for completed status
      if (status === "completed" && session.outcome === "pending") {
        return res.status(400).json({
          success: false,
          message:
            "Cannot mark as completed when outcome is pending. Please set outcome first.",
        });
      }

      session.status = status;
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide either 'status' or set 'isOutCome' to true",
      });
    }

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Interview session updated successfully",
      data: session,
    });
  } catch (err) {
    return res.status(400).json({
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

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "No interview session found with that ID",
      });
    }
    await Onboarding.findOneAndUpdate(
      { applicationId: session.applicationId },
      { $pull: { InterviewSession: session._id } }
    );

    await session.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
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
      .populate({
        path: "interviewRoundId", // correct field name in InterviewSession
        populate: {
          path: "interviewer", // nested field inside InterviewRound
          model: "User", // make sure 'User' is the correct model name
        },
      })
      .populate("applicationId") // optional: if you want full application details
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
