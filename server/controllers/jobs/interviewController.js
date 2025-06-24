const InterViewRound = require("../../models/jobs/InterviewRound");
 

exports.fetchInterviewRounds = async (req, res) => {
  try {
    const rounds = await InterViewRound.find().populate('interviewer')
    .sort({ roundNumber: 1 });
console.log( rounds)
    res.json(rounds);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};

exports.addInterviewRound = async (req, res) => {
  try {
    const { name, roundNumber, interviewer, description } = req.body;

    // Check if round number already exists
    const existingRound = await InterViewRound.findOne({ roundNumber });
    if (existingRound) {
      return res.status(400).json({ message: "Round number already exists" });
    }

    const round = new InterViewRound({
      name,
      roundNumber,
      interviewer,
      description,
    });
    await round.save();

    res.status(201).json({ data: round, message: "Added new interview round" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateInterviewRound = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roundNumber, interviewer, description } = req.body;

    const round = await InterViewRound.findByIdAndUpdate(
      id,
      { name, roundNumber, interviewer, description },
      { new: true, runValidators: true }
    );

    if (!round) {
      return res.status(404).json({ message: "Interview round not found" });
    }

    res.json({ message: "Interview round updated!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInterviewRound = async (req, res) => {
  try {
    const { id } = req.params;
    const round = await InterViewRound.findByIdAndDelete(id);

    if (!round) {
      return res.status(404).json({ message: "Interview round not found" });
    }

    res.json({ message: "Interview round deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.fetchInterviewersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const interviewers = await InterViewRound.find({ department: departmentId });

    res.json(interviewers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
