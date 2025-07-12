const Attendance = require("../models/Attendance");
const Organization = require("../models/Organization");
const Regularization = require("../models/Regularization");
const { startOfDay, endOfDay } = require("date-fns");

// Create regularization request
exports.createRegularization = async (req, res) => {
  try {
    const { userId, date, checkInTime, checkOutTime, remarks } = req.body;

    // Check if request already exists for this date
    const existingRequest = await Regularization.findOne({
      userId,
      date: startOfDay(new Date(date)),
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a regularization request for this date",
      });
    }

    const regularization = await Regularization.create({
      userId,
      date: startOfDay(new Date(date)),
      checkInTime,
      checkOutTime,
      remarks,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: regularization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating regularization request",
      error: error.message,
    });
  }
};

// Get user's regularization requests
exports.getUserRegularizations = async (req, res) => {
  try {
    const { userId } = req.params;

    const regularizations = await Regularization.find({ userId })
      .sort({ date: -1 })
      .populate("approvedBy", "name");

    res.json(regularizations);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching regularization requests",
      error: error.message,
    });
  }
};

// Cancel regularization request
exports.cancelRegularization = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const regularization = await Regularization.findOneAndDelete({
      _id: id,
      userId,
      status: "pending", // Only allow cancel if status is pending
    });

    if (!regularization) {
      return res.status(404).json({
        success: false,
        message: "Request not found or cannot be cancelled",
      });
    }

    res.json({
      success: true,
      message: "Regularization request cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling regularization request",
      error: error.message,
    });
  }
};

// Admin approval/rejection
// Get all regularization requests (for admin)
exports.getAllRegularizations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      branchId,
      userId,
      startDate,
      endDate,
    } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;



  if (branchId) {
  filter.userId = {
    $in: await Organization.distinct("user", { branch: branchId })
  };
}



    if (startDate && endDate) {
      filter.date = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate)),
      };
    }

    const [regularizations, total] = await Promise.all([
      Regularization.find(filter)
        .populate({
          path: "userId",
          populate: {
            path: "EmployeeId",
            model: "EmployeeId", // optional if Mongoose can auto-detect
          },
        })
        .populate("approvedBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Regularization.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: regularizations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching regularization requests",
      error: error.message,
    });
  }
};

// Update regularization status (admin)
exports.updateRegularizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    const updateData = {
      status,
      approvedBy,
    };

    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedRequest = await Regularization.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

      .populate("userId")
      .populate("approvedBy");

    if (status === "approved") {
      // Check if attendance already exists for this date
      const existingAttendance = await Attendance.findOne({
        userId: updatedRequest.userId._id,
        date: startOfDay(updatedRequest.date),
      });

      if (existingAttendance) {
        // Update existing attendance
        existingAttendance.checkInTime = updatedRequest.checkInTime;
        existingAttendance.checkOutTime = updatedRequest.checkOutTime;
        existingAttendance.status = "present";
        existingAttendance.isApproved = true;
        existingAttendance.approvedBy = approvedBy;
        existingAttendance.remarks = `Regularized: ${updatedRequest.remarks}`;

        // Calculate hours worked if both times exist
        if (updatedRequest.checkInTime && updatedRequest.checkOutTime) {
          const diffMs =
            new Date(updatedRequest.checkOutTime) -
            new Date(updatedRequest.checkInTime);
          existingAttendance.hoursWorked = diffMs / (1000 * 60 * 60); // Convert to hours
        }

        await existingAttendance.save();
      } else {
        // Create new attendance record
        const newAttendance = new Attendance({
          userId: updatedRequest.userId._id,
          date: startOfDay(updatedRequest.date),
          checkInTime: updatedRequest.checkInTime,
          checkOutTime: updatedRequest.checkOutTime,
          status: "present",
          isApproved: true,
          approvedBy: approvedBy,
          remarks: `Regularized: ${updatedRequest.remarks}`,
          ...(updatedRequest.checkInTime &&
            updatedRequest.checkOutTime && {
              hoursWorked:
                (new Date(updatedRequest.checkOutTime) -
                  new Date(updatedRequest.checkInTime)) /
                (1000 * 60 * 60),
            }),
        });

        await newAttendance.save();
      }
    }

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Regularization request not found",
      });
    }

    res.json({
      success: true,
      data: updatedRequest,
      message: `Regularization request ${status} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating regularization status",
      error: error.message,
    });
  }
};
