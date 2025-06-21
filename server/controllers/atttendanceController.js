// controllers/attendanceController.js
const Attendance = require("../models/Attendance.js");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
exports.getTodayAttendance = async (req, res) => {
  const { userId } = req.query;
  console.log("TODAY");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    res.json(attendance || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkIn = async (req, res) => {
  console.log("CHECKIN");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      userId: req.body.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const attendance = new Attendance({
      userId: req.body.userId,
      date: today,
      status: "present",
      checkInTime: req.body.checkInTime || new Date(),
      location: req.body.location,
      remarks: ` CheckIn Remark:${req.body.remarks}
  `,
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    console.log("CHECKOUT");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.body.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return res.status(400).json({ message: "Not checked in today" });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const checkOutTime = req.body.checkOutTime || new Date();
    attendance.checkOutTime = checkOutTime;
    attendance.remarks += ` , CheckOut Remark:${req.body.remarks}`;

    if (
      attendance.checkInTime &&
      !isNaN(new Date(attendance.checkInTime)) &&
      !isNaN(new Date(checkOutTime))
    ) {
      const checkIn = new Date(attendance.checkInTime);
      const checkOut = new Date(checkOutTime);
      const diffMs = checkOut - checkIn;

      if (!isNaN(diffMs)) {
        attendance.hoursWorked = diffMs / (1000 * 60 * 60); // Convert ms to hours
      } else {
        attendance.hoursWorked = 0;
      }
    } else {
      attendance.hoursWorked = 0;
    }

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { startDate, userId, endDate } = req.query;
    console.log(startDate, userId, endDate);
    const attendances = await Attendance.find({
      userId: userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: -1 });

    res.json(attendances);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
exports.getHistoryByMonthly = async (req, res) => {
  try {
    const { userId, month } = req.query;
    console.log("MONTHLY");
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!dayjs(month, "YYYY-MM", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Use YYYY-MM",
      });
    }

    // Calculate start and end of month in UTC
    const startDate = dayjs.utc(month).startOf("month");
    const endDate = dayjs.utc(month).endOf("month");

    // Get all attendance records for the month
    const attendances = await Attendance.find({
      userId,
      date: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    }).sort({ date: 1 });

    // Format response for calendar view
    const formattedAttendances = attendances.map((attendance) => ({
      _id: attendance._id,
      date: attendance.date,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      hoursWorked: attendance.hoursWorked,
      location: attendance.location,
      remarks: attendance.remarks,
      isApproved: attendance.isApproved,
      leaveType: attendance.leaveType,
    }));

    res.json({
      success: true,
      data: formattedAttendances,
    });
  } catch (err) {
    console.error("Error fetching monthly attendance:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching monthly attendance",
      error: err.message,
    });
  }
};
exports.getMonthlySummary = async (req, res) => {
  try {
    const { userId, month } = req.query;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!dayjs(month, "YYYY-MM", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Use YYYY-MM",
      });
    }

    // Calculate date range
    const startDate = dayjs.utc(month).startOf("month");
    const endDate = dayjs.utc(month).endOf("month");
    const daysInMonth = endDate.date();
    const timezone = "Asia/Kolkata"; // Set your preferred timezone

    // Get all attendance records
    const attendances = await Attendance.find({
      userId,
      date: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    });

    // Initialize counters
    const summary = {
      present: 0,
      absent: 0,
      leave: 0,
      casualLeave: 0,
      halfDay: 0,
      holidays: 0,
      workingDays: 0,
      totalHours: 0,
      averageHours: 0,
    };

    // Process each day of the month
    const dailyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = startDate.date(day);
      const isWeekend = [0, 6].includes(currentDate.day());

      const attendanceRecord = attendances.find((record) =>
        dayjs(record.date).isSame(currentDate, "day")
      );

      const dayData = {
        date: currentDate.toDate(),
        dayOfWeek: currentDate.format("dddd"),
        isWeekend,
        status: isWeekend ? "weekend" : attendanceRecord?.status || "absent",
        checkInTime: attendanceRecord?.checkInTime || null,
        checkOutTime: attendanceRecord?.checkOutTime || null,
        hoursWorked: attendanceRecord?.hoursWorked || 0,
        location: attendanceRecord?.location || null,
        remarks: attendanceRecord?.remarks || null,
        isApproved: attendanceRecord?.isApproved || false,
        leaveType: attendanceRecord?.leaveType || null,
      };

      // Update summary counters
      if (isWeekend) {
        summary.holidays++;
      } else {
        switch (dayData.status) {
          case "present":
            summary.present++;
            summary.workingDays++;
            summary.totalHours += dayData.hoursWorked;
            break;
          case "half-day":
            summary.halfDay++;
            summary.workingDays += 0.5;
            summary.totalHours += dayData.hoursWorked;
            break;
          case "Casual Leave":
            summary.casualLeave++;
            summary.leave++;
            break;
          case "leave":
            summary.leave++;
            break;
          case "absent":
            summary.absent++;
            break;
        }
      }

      dailyData.push(dayData);
    }

    // Calculate averages
    if (summary.workingDays > 0) {
      summary.averageHours = summary.totalHours / summary.workingDays;
    }

    // Calculate attendance percentage (excluding weekends)
    const totalWorkingDays = daysInMonth - summary.holidays;
    const attendancePercentage =
      totalWorkingDays > 0
        ? ((summary.present + summary.halfDay * 0.5) / totalWorkingDays) * 100
        : 0;

    res.json({
      success: true,
      data: {
        month: startDate.format("MMMM YYYY"),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timezone,
        summary: {
          ...summary,
          attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
          totalWorkingDays,
        },
        dailyData,
      },
    });
  } catch (err) {
    console.error("Error generating monthly summary:", err);
    res.status(500).json({
      success: false,
      message: "Server error while generating monthly summary",
      error: err.message,
    });
  }
};
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.requestLeave = async (req, res) => {
  try {
    const { date, userId, leaveType, remarks } = req.body;
    console.log(date, userId, leaveType, remarks);
    const existing = await Attendance.findOne({
      userId,
      date: new Date(date),
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Attendance already exists for this date" });
    }

    const attendance = new Attendance({
      userId,
      date: new Date(date),
      status: "pending",
      leaveType,
      remarks,
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Attendance.find({
      userId: req.query.userId,
      status: { $in: ["pending", "approved", "rejected"] },
    }).sort({ date: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelLeave = async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndDelete({
      _id: req.params.id,
      userId: req.query.userId,
      status: "pending",
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "Pending leave request not found" });
    }

    res.json({ message: "Leave request cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { startDate, userId, endDate } = req.query;
    console.log(startDate, userId, endDate);

    // Get all attendances in the date range
    const attendances = await Attendance.find({
      userId: userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    // Calculate summary for the entire period
    const summary = {
      present: 0,
      absent: 0,
      leave: 0,
      workingDays: 0,
      attendancePercentage: 0,
    };

    attendances.forEach((att) => {
      if (att.status === "present") summary.present++;
      else if (att.status === "absent") summary.absent++;
      else if (att.status === "leave") summary.leave++;
    });

    summary.workingDays = summary.present + summary.absent + summary.leave;
    if (summary.workingDays > 0) {
      summary.attendancePercentage =
        (summary.present / summary.workingDays) * 100;
    }

    // Calculate monthly breakdown
    const monthlyReports = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Group attendances by month
    const attendancesByMonth = {};
    attendances.forEach((att) => {
      const monthYear = new Date(att.date).toISOString().slice(0, 7); // Format: YYYY-MM
      if (!attendancesByMonth[monthYear]) {
        attendancesByMonth[monthYear] = [];
      }
      attendancesByMonth[monthYear].push(att);
    });

    // Process each month
    for (const [monthYear, monthlyAttendances] of Object.entries(
      attendancesByMonth
    )) {
      const monthSummary = {
        month: new Date(`${monthYear}-01`), // First day of the month
        present: 0,
        absent: 0,
        leave: 0,
        workingDays: 0,
        attendancePercentage: 0,
      };

      monthlyAttendances.forEach((att) => {
        if (att.status === "present") monthSummary.present++;
        else if (att.status === "absent") monthSummary.absent++;
        else if (att.status === "leave") monthSummary.leave++;
      });

      monthSummary.workingDays =
        monthSummary.present + monthSummary.absent + monthSummary.leave;
      if (monthSummary.workingDays > 0) {
        monthSummary.attendancePercentage =
          (monthSummary.present / monthSummary.workingDays) * 100;
      }

      monthlyReports.push(monthSummary);
    }

    // Sort monthly reports chronologically
    monthlyReports.sort((a, b) => a.month - b.month);

    res.json({ summary, monthlyReports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
