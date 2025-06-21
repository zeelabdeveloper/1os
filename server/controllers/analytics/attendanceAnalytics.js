const Attendance = require('../../models/Attendance');
const User = require('../../models/User');
const moment = require('moment');

// Premium Feature 1: Comprehensive dashboard stats
exports.getAttendanceDashboard = async (req, res) => {
    console.log("dfgdgdgfd")
  try {
    const { startDate, endDate, department, branch } = req.query;
    
    const matchQuery = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (department) {
      const users = await User.find({ department }).select('_id');
      matchQuery.userId = { $in: users.map(u => u._id) };
    }

    if (branch) {
      const users = await User.find({ branch }).select('_id');
      matchQuery.userId = { $in: users.map(u => u._id) };
    }

    const [
      totalRecords,
      presentCount,
      absentCount,
      leaveCount,
      halfDayCount,
      averageHours,
      lateArrivals,
      earlyDepartures,
      attendanceTrend,
      departmentStats,
      branchStats,
      leaveTypeStats,
      topPresentEmployees,
      topAbsentEmployees,
      locationStats,
      approvalStats
    ] = await Promise.all([
      // Premium Feature 2: Total records count
      Attendance.countDocuments(matchQuery),
      
      // Premium Feature 3: Present count
      Attendance.countDocuments({ ...matchQuery, status: 'present' }),
      
      // Premium Feature 4: Absent count
      Attendance.countDocuments({ ...matchQuery, status: 'absent' }),
      
      // Premium Feature 5: Leave count
      Attendance.countDocuments({ 
        ...matchQuery, 
        status: { $in: ['Casual Leave', 'leave'] } 
      }),
      
      // Premium Feature 6: Half-day count
      Attendance.countDocuments({ ...matchQuery, status: 'half-day' }),
      
      // Premium Feature 7: Average hours worked
      Attendance.aggregate([
        { $match: { ...matchQuery, status: 'present' } },
        { $group: { _id: null, avgHours: { $avg: "$hoursWorked" } } }
      ]),
      
      // Premium Feature 8: Late arrivals
      Attendance.countDocuments({
        ...matchQuery,
        status: 'present',
        checkInTime: { $gt: new Date().setHours(10, 30, 0, 0) }
      }),
      
      // Premium Feature 9: Early departures
      Attendance.countDocuments({
        ...matchQuery,
        status: 'present',
        checkOutTime: { $lt: new Date().setHours(17, 0, 0, 0) }
      }),
      
      // Premium Feature 10: Attendance trend (last 12 months)
      Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: moment().subtract(12, 'months').toDate(),
              $lte: new Date()
            }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: "$date" },
              year: { $year: "$date" },
              status: "$status"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      
      // Premium Feature 11: Department-wise stats
      Attendance.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "departments",
            localField: "user.department",
            foreignField: "_id",
            as: "department"
          }
        },
        { $unwind: "$department" },
        {
          $group: {
            _id: "$department.name",
            present: {
              $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
            },
            leave: {
              $sum: { $cond: [{ $in: ["$status", ["leave", "Casual Leave"]] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Premium Feature 12: Branch-wise stats
      Attendance.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "companybranches",
            localField: "user.branch",
            foreignField: "_id",
            as: "branch"
          }
        },
        { $unwind: "$branch" },
        {
          $group: {
            _id: "$branch.name",
            present: {
              $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Premium Feature 13: Leave type breakdown
      Attendance.aggregate([
        { $match: { status: { $in: ["leave", "Casual Leave"] } } },
        { $group: { _id: "$leaveType", count: { $sum: 1 } } }
      ]),
      
      // Premium Feature 14: Top present employees
      Attendance.aggregate([
        { $match: { status: "present" } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
            presentDays: "$count"
          }
        }
      ]),
      
      // Premium Feature 15: Top absent employees
      Attendance.aggregate([
        { $match: { status: "absent" } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
            absentDays: "$count"
          }
        }
      ]),
      
      // Premium Feature 16: Location stats
      Attendance.aggregate([
        { $match: { location: { $exists: true, $ne: null } } },
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Premium Feature 17: Approval stats
      Attendance.aggregate([
        { 
          $group: {
            _id: null,
            approved: { $sum: { $cond: ["$isApproved", 1, 0] } },
            pending: { 
              $sum: { 
                $cond: [
                  { $and: [
                    { $in: ["$status", ["leave", "Casual Leave"]] },
                    { $eq: ["$isApproved", false] }
                  ]}, 
                  1, 
                  0 
                ] 
              } 
            },
            rejected: { $sum: { $cond: ["$rejectionReason", 1, 0] } }
          }
        }
      ])
    ]);

    res.json({
      totalRecords,
      presentCount,
      absentCount,
      leaveCount,
      halfDayCount,
      averageHours: averageHours[0]?.avgHours || 0,
      lateArrivals,
      earlyDepartures,
      attendanceTrend: formatTrendData(attendanceTrend),
      departmentStats,
      branchStats,
      leaveTypeStats,
      topPresentEmployees,
      topAbsentEmployees,
      locationStats,
      approvalStats: approvalStats[0] || { approved: 0, pending: 0, rejected: 0 }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function formatTrendData(data) {
  const months = moment.monthsShort();
  const result = [];
  
  for (let i = 0; i < 12; i++) {
    const date = moment().subtract(11 - i, 'months');
    const month = date.month() + 1;
    const year = date.year();
    
    const monthData = {
      month: months[date.month()],
      year: year,
      present: 0,
      absent: 0,
      leave: 0
    };
    
    data.forEach(item => {
      if (item._id.month === month && item._id.year === year) {
        if (item._id.status === 'present') monthData.present = item.count;
        if (item._id.status === 'absent') monthData.absent = item.count;
        if (['leave', 'Casual Leave'].includes(item._id.status)) {
          monthData.leave += item.count;
        }
      }
    });
    
    result.push(monthData);
  }
  
  return result;
}