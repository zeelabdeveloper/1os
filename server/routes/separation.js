const express = require("express");
const router = express.Router();
const Separation = require("../models/Separation");
const User = require("../models/User");

// Apply for separation








router.post("/", async (req, res) => {
  try {
    console.log( req.body)
    // Check if user already has a pending request
    const existingRequest = await Separation.findOne({
      user: req.body.user,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ error: "You already have a pending separation request" });
    }
    const existingRequestt = await Separation.findOne({
      user: req.body.user,
      status: "approved",
    });

    if (existingRequestt) {
      return res
        .status(400)
        .json({ error: "You already have a approved separation request" });
    }
    console.log(req.body.user);
    const separation = new Separation({
      ...req.body,
    });

    await separation.save();
    res.status(201).json(separation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});















// Get user's separation requests
router.get("/my-requests/:id", async (req, res) => {
  try {
    const requests = await Separation.find({ user: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin get all separation requests
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Base query without population
    let query = Separation.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Try to populate if possible, but don't fail if it doesn't work
    try {
      query = query.populate({
        path: 'user',
        select: 'firstName lastName email EmployeeId profilePicture',
        options: { strict: false }
      });
    } catch (populateError) {
      console.warn('Population failed:', populateError.message);
      // Continue without population
    }

    const [requests, totalCount] = await Promise.all([
      query.exec(),
      Separation.countDocuments(filter)
    ]);

    res.json({
      requests,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin update separation request
router.put("/:id", async (req, res) => {
  try {
    const separation = await Separation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("user", "firstName lastName email EmployeeId");

    if (!separation) {
      return res.status(404).json({ error: "Separation request not found" });
    }

    // If approved, update user status
    if (req.body.status === "approved") {
      await User.findByIdAndUpdate(separation.user._id, { isActive: false });
    }

    res.json(separation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single separation request
router.get("/:id", async (req, res) => {
  try {
    const separation = await Separation.findById(req.params.id).populate(
      "user",
      "firstName lastName email EmployeeId"
    );

    if (!separation) {
      return res.status(404).json({ error: "Separation request not found" });
    }

    // Check if user is authorized to view this request
    if (
      separation.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(separation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
