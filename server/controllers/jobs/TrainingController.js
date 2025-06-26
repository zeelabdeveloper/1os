 
const Application = require("../../models/jobs/applicationSchema");
const Onboarding = require("../../models/jobs/Onboarding");
const Training = require("../../models/TrainingAndDevelopment");

// Create or Update Training
exports.createOrUpdateTraining = async (req, res) => {
  try {
    const { trainingType, id, applicationId, trainingStartDate, trainingEndDate, description, notes, status } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found with that ID",
      });
    }

    if (id) {
      await Training.findByIdAndUpdate(id, req.body);
      return res.status(200).json({ message: "Training Updated!" });
    }

    let training = await Training.findOne({
      trainingType,
      applicationId,
      trainingStartDate,
    });

    if (training) {
      // Update existing training
      training.trainingEndDate = trainingEndDate;
      training.description = description;
      training.notes = notes;
      training.status = status;
      await training.save();
    } else {
      // Create new training
      training = new Training({
        applicationId,
        trainingType,
        trainingStartDate,
        trainingEndDate,
        description,
        notes,
        status,
      });
      await training.save();

      const onboarding = await Onboarding.findOne({ applicationId });

      if (onboarding) {
        onboarding.Trainings.push(training._id);
        await onboarding.save();
      } else {
        const newOnboarding = new Onboarding({
          applicationId,
          Trainings: [training._id],
        });
        await newOnboarding.save();
      }
    }

    res.status(200).json({
      success: true,
      data: training,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Trainings for User
exports.getUserTrainings = async (req, res) => {
  const { applicationId } = req.params;
  try {
    const trainings = await Training.find({ applicationId });

    res.status(200).json({
      success: true,
      data: trainings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete Training
exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findOneAndDelete({
      _id: req.params.id,
    });

    if (!training) {
      return res.status(404).json({
        success: false,
        error: "Training not found",
      });
    }

    // Remove the training reference from Onboarding
    await Onboarding.findOneAndUpdate(
      { applicationId: training.applicationId },
      { $pull: { Trainings: training._id } }
    );

    res.status(200).json({
      success: true,
      message: "Training deleted successfully and removed from onboarding",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Get All Trainings
exports.getAllTrainings = async (req, res) => {
  try {
    const trainings = await Training.find().populate("user", "name email");
    res.status(200).json({
      success: true,
      data: trainings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};