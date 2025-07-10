const express = require("express");
const router = express.Router();
const Separation = require("../models/Separation");

// Apply for separation

router.post("/", async (req, res) => {
  try {
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

// In your separation routes file
router.get("/analytics", async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const matchQuery = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (type) matchQuery.separationType = type;

    // Total separations count
    const totalSeparations = await Separation.countDocuments(matchQuery);

    // Status breakdown
    const statusBreakdown = await Separation.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Type breakdown
    const typeBreakdown = await Separation.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$separationType", count: { $sum: 1 } } },
    ]);

    // Previous period comparison
    const prevPeriodStart = new Date(startDate);
    const prevPeriodEnd = new Date(endDate);
    const periodLength =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - periodLength);
    prevPeriodEnd.setDate(prevPeriodEnd.getDate() - periodLength);

    const prevPeriodCount = await Separation.countDocuments({
      createdAt: {
        $gte: prevPeriodStart,
        $lte: prevPeriodEnd,
      },
    });

    const percentageChange =
      prevPeriodCount > 0
        ? ((totalSeparations - prevPeriodCount) / prevPeriodCount) * 100
        : totalSeparations > 0
        ? 100
        : 0;

    // Recent separations
    const recentSeparations = await Separation.find(matchQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "firstName lastName");

    res.json({
      totalSeparations,
      approvedCount:
        statusBreakdown.find((s) => s._id === "approved")?.count || 0,
      pendingCount:
        statusBreakdown.find((s) => s._id === "pending")?.count || 0,
      rejectedCount:
        statusBreakdown.find((s) => s._id === "rejected")?.count || 0,
      approvalRate:
        totalSeparations > 0
          ? ((statusBreakdown.find((s) => s._id === "approved")?.count || 0) /
              totalSeparations) *
            100
          : 0,
      typeBreakdown,
      percentageChange,
      recentSeparations,
    });
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
        path: "user",
        select: "firstName lastName email EmployeeId profilePicture",
        options: { strict: false },
      });
    } catch (populateError) {
      console.warn("Population failed:", populateError.message);
      // Continue without population
    }

    const [requests, totalCount] = await Promise.all([
      query.exec(),
      Separation.countDocuments(filter),
    ]);

    res.json({
      requests,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
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
