const Application = require("../../models/jobs/applicationSchema");
const Onboarding = require("../../models/jobs/Onboarding");
const Employee = require("../../models/User");

// Get all onboardings
exports.getAllOnboardings = async (req, res) => {
  try {
    const onboardings = await Onboarding.find()
      .populate("application", "name _id email")
      .populate("job", "title department");

    const formatted = onboardings.map((item) => ({
      _id: item._id,
      candidateName: item.application.name,
      jobTitle: item.job.title,
      candidateId: item.application._id,
      joiningDate: item.joiningDate,
      status: item.status,
      salary: item.salary,
      bonus: item.bonus,
      workLocation: item.workLocation,
      equipmentNeeded: item.equipmentNeeded,
      notes: item.notes,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching onboardings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete onboarding
exports.deleteOnboarding = async (req, res) => {
  try {
    const Onboard = await Onboarding.findByIdAndDelete(req.params.id);
    if (Onboard) {
      await Application.findByIdAndUpdate(Onboard.application, {
        status: "hired",
      });
    }

    res.json({ message: "Onboarding deleted successfully" });
  } catch (error) {
    console.error("Error deleting onboarding:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Convert to employee
exports.convertToEmployee = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate("candidate")
      .populate("job");

    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding not found" });
    }

    // Create employee record
    const employee = new Employee({
      user: onboarding.candidate._id,
      employeeId: `EMP-${Date.now()}`,
      position: onboarding.job.title,
      department: onboarding.job.department,
      salary: onboarding.salary,
      joiningDate: onboarding.joiningDate,
      status: "active",
    });

    await employee.save();

    // Update onboarding status
    onboarding.status = "completed";
    await onboarding.save();

    res.json({
      message: "Converted to employee successfully",
      employee,
    });
  } catch (error) {
    console.error("Error converting to employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};
