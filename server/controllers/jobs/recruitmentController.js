// controllers/recruitmentController.js

const Application = require("../../models/jobs/applicationSchema");
const Onboarding = require("../../models/jobs/Onboarding");

exports.initiateOnboarding = async (req, res) => {
  console.log(req.body);
  try {
    const {
      applicationId,

      jobId,
      joiningDate,
      status,
      salary,
      bonus = 0,
      workLocation,
      equipmentNeeded = false,
      notes = "",
    } = req.body;

    // Validate required fields
    if (
      !applicationId ||
      !jobId ||
      !joiningDate ||
      !status ||
      !salary ||
      !workLocation
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

  
    const onboarding = new Onboarding({
      application: applicationId,

      job: jobId,
      joiningDate: new Date(joiningDate),
      status,
      salary,
      bonus,
      workLocation,
      equipmentNeeded,
      notes,
      initiatedBy: req?.user?.id     || "683fed6e4171723fde1cba1a"    ,
    });

    await onboarding.save();

   
    application.status = "onboarding";
    
    await application.save();

    res.status(201).json({
      message: "Onboarding initiated successfully",
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Server error during onboarding" });
  }
};
