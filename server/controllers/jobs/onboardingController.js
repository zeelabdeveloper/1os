 
const Application = require("../../models/jobs/applicationSchema");
const Onboarding = require("../../models/jobs/Onboarding");

 
// Start onboarding with 5 predefined stages
exports.startOnboarding = async (req, res) => {
  try {
    const { applicationId, interviewRounds } = req.body;

    const application = await Application.findById(applicationId);
    if (!application || application.status !== 'hired') {
      return res.status(400).json({ message: "Invalid application status" });
    }

    // Create onboarding with 5 stages
    const onboarding = new Onboarding({
      candidate: applicationId,
      stages: [
        {
          stageType: 'interview',
          stageNumber: 1,
          status: 'in_progress',
          interviewRound: interviewRounds[0]?.round,
          interviewer: interviewRounds[0]?.interviewer,
          scheduledDate: interviewRounds[0]?.scheduledDate
        },
        {
          stageType: 'document_verification',
          stageNumber: 2,
          status: 'pending'
        },
        {
          stageType: 'background_check',
          stageNumber: 3,
          status: 'pending'
        },
        {
          stageType: 'training',
          stageNumber: 4,
          status: 'pending'
        },
        {
          stageType: 'final_approval',
          stageNumber: 5,
          status: 'pending'
        }
      ],
      currentStage: 1,
      overallStatus: 'in_progress'
    });

    await onboarding.save();
    res.status(201).json(onboarding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update interview stage
exports.updateInterviewStage = async (req, res) => {
  try { 
    const { onboardingId, stageId } = req.params;
    const { feedback, status } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding not found" });
    }

    const stage = onboarding.stages.id(stageId);
    if (!stage || stage.stageType !== 'interview') {
      return res.status(400).json({ message: "Invalid interview stage" });
    }

    stage.interviewFeedback = feedback;
    stage.status = status;
    stage.completedDate = new Date();

    // Move to next stage if passed
    if (status === 'passed' && onboarding.currentStage === stage.stageNumber) {
      onboarding.currentStage = stage.stageNumber + 1;
      const nextStage = onboarding.stages.find(s => s.stageNumber === onboarding.currentStage);
      if (nextStage) {
        nextStage.status = 'in_progress';
      }
    }

    await onboarding.save();
    res.json(onboarding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update document verification
exports.updateDocumentStage = async (req, res) => {
  try {
    const { onboardingId, stageId } = req.params;
    const { documents, status } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding not found" });
    }

    const stage = onboarding.stages.id(stageId);
    if (!stage || stage.stageType !== 'document_verification') {
      return res.status(400).json({ message: "Invalid document stage" });
    }

    stage.documents = documents;
    stage.status = status;
    stage.completedDate = new Date();

    if (status === 'completed' && onboarding.currentStage === stage.stageNumber) {
      onboarding.currentStage = stage.stageNumber + 1;
      const nextStage = onboarding.stages.find(s => s.stageNumber === onboarding.currentStage);
      if (nextStage) {
        nextStage.status = 'in_progress';
      }
    }

    await onboarding.save();
    res.json(onboarding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update training stage
exports.updateTrainingStage = async (req, res) => {
  try {
    const { onboardingId, stageId } = req.params;
    const { trainingDetails, status } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding not found" });
    }

    const stage = onboarding.stages.id(stageId);
    if (!stage || stage.stageType !== 'training') {
      return res.status(400).json({ message: "Invalid training stage" });
    }

    stage.trainingDetails = trainingDetails;
    stage.status = status;
    stage.completedDate = new Date();

    if (status === 'passed' && onboarding.currentStage === stage.stageNumber) {
      onboarding.currentStage = stage.stageNumber + 1;
      const nextStage = onboarding.stages.find(s => s.stageNumber === onboarding.currentStage);
      if (nextStage) {
        nextStage.status = 'in_progress';
      }
    }

    await onboarding.save();
    res.json(onboarding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Complete final approval
exports.completeOnboarding = async (req, res) => {
  try {
    const { onboardingId, stageId } = req.params;
    const { approvalDetails } = req.body;

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding not found" });
    }

    const stage = onboarding.stages.id(stageId);
    if (!stage || stage.stageType !== 'final_approval') {
      return res.status(400).json({ message: "Invalid final stage" });
    }

    stage.approvalDetails = approvalDetails;
    stage.status = 'completed';
    stage.completedDate = new Date();
    onboarding.overallStatus = 'completed';
    onboarding.currentStage = 5;

    // Update application status to onboarded
    await Application.findByIdAndUpdate(
      onboarding.candidate,
      { status: 'onboarded' }
    );

    await onboarding.save();
    res.json(onboarding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get onboarding details
exports.getOnboardingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const onboarding = await Onboarding.findById(id)
      .populate('candidate')
      .populate('stages.interviewRound')
      .populate('stages.interviewer')
      .populate('stages.trainingDetails.trainer')
      .populate('stages.approvalDetails.approvedBy');

    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding not found" });
    }

    res.json(onboarding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};