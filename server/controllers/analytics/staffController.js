// controllers/staffController.js
const User = require("../../models/User");

const Bank = require("../..//models/Bank");
const Department = require("../../models/Department");
const Branch = require("../../models/Branch");
const Organization = require("../../models/Organization");
const Salary = require("../../models/Salary");
const moment = require("moment");

exports.getStaffAnalytics = async (req, res) => {
 
  try {
    // Total staff count
    const totalStaff = await User.countDocuments();

    // COCO staff count
    const cocoStaff = await User.countDocuments({ isCocoEmployee: true });

    // Active vs inactive staff
    const activeStaff = await User.countDocuments({ isActive: true });
    const inactiveStaff = totalStaff - activeStaff;

    // Joining statistics
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );

    // This month joining
    const thisMonthJoining = await User.countDocuments({
      dateOfJoining: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1),
      },
    });

    // Last month joining
    const lastMonthJoining = await User.countDocuments({
      dateOfJoining: {
        $gte: lastMonth,
        $lt: new Date(currentYear, currentMonth, 1),
      },
    });

    // This year joining
    const thisYearJoining = await User.countDocuments({
      dateOfJoining: {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1),
      },
    });

    // Last year joining
    const lastYearJoining = await User.countDocuments({
      dateOfJoining: {
        $gte: new Date(currentYear - 1, 0, 1),
        $lt: new Date(currentYear, 0, 1),
      },
    });

    // Staff by tenure
    const longTermStaff = await User.countDocuments({
      dateOfJoining: {
        $lt: new Date(currentYear - 5, 0, 1), // More than 5 years
      },
    });

    const midTermStaff = await User.countDocuments({
      dateOfJoining: {
        $gte: new Date(currentYear - 5, 0, 1),
        $lt: new Date(currentYear - 1, 0, 1),
      },
    });

    const newStaff = await User.countDocuments({
      dateOfJoining: {
        $gte: new Date(currentYear - 1, 0, 1),
      },
    });

    // Last login activity
    const recentlyActive = await User.countDocuments({
      lastLogin: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    });

    // Suspended accounts
    const suspendedAccounts = await User.countDocuments({
      accountSuspended: true,
    });
     
    res.json({
      totalStaff,
      cocoStaff,
      activeStaff,
      inactiveStaff,
      thisMonthJoining,
      lastMonthJoining,
      thisYearJoining,
      lastYearJoining,
      longTermStaff,
      midTermStaff,
      newStaff,
      recentlyActive,
      suspendedAccounts,
      joiningTrends: await getJoiningTrends(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function getJoiningTrends() {
  const trends = [];
  const currentDate = new Date();

  for (let i = 11; i >= 0; i--) {
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i + 1,
      1
    );

    const count = await User.countDocuments({
      dateOfJoining: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    trends.push({
      month: startDate.toLocaleString("default", { month: "short" }),
      year: startDate.getFullYear(),
      count,
    });
  }

  return trends;
}

// Main analytics dashboard data
exports.getStaffAnalyticsNew = async (req, res) => {
  try {
    const [
      totalStaff,
      cocoStaff,
      activeStaff,
      verifiedBankAccounts,
      branches,
      departments,
      recentJoinings,
      salaryStats,
      experienceStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isCocoEmployee: true }),
      User.countDocuments({ isActive: true }),
      Bank.countDocuments({ verified: true }),
      Branch.countDocuments(),
      Department.countDocuments(),
      User.find().sort({ dateOfJoining: -1 }).limit(5),
      Salary.aggregate([
        {
          $group: {
            _id: null,
            avgSalary: { $avg: "$netSalary" },
            maxSalary: { $max: "$netSalary" },
            minSalary: { $min: "$netSalary" },
            totalPaid: { $sum: "$netSalary" },
          },
        },
      ]),
      User.aggregate([
        {
          $lookup: {
            from: "experiences",
            localField: "_id",
            foreignField: "user",
            as: "experiences",
          },
        },
        {
          $project: {
            experienceCount: { $size: "$experiences" },
          },
        },
        {
          $group: {
            _id: null,
            avgExperience: { $avg: "$experienceCount" },
            maxExperience: { $max: "$experienceCount" },
          },
        },
      ]),
    ]);

    res.json({
      totalStaff,
      cocoStaff,
      activeStaff,
      inactiveStaff: totalStaff - activeStaff,
      verifiedBankAccounts,
      branchCount: branches,
      departmentCount: departments,
      recentJoinings,
      avgSalary: salaryStats[0]?.avgSalary || 0,
      maxSalary: salaryStats[0]?.maxSalary || 0,
      minSalary: salaryStats[0]?.minSalary || 0,
      totalSalaryPaid: salaryStats[0]?.totalPaid || 0,
      avgExperience: experienceStats[0]?.avgExperience || 0,
      maxExperience: experienceStats[0]?.maxExperience || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Branch-wise analytics
exports.getBranchAnalytics = async (req, res) => {
  try {
    const branchStats = await Organization.aggregate([
      {
        $group: {
          _id: "$branch",
          staffCount: { $sum: 1 },
          activeStaff: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "companybranches",
          localField: "_id",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $unwind: "$branchDetails",
      },
      {
        $project: {
          branchName: "$branchDetails.name",
          branchCode: "$branchDetails.code",
          staffCount: 1,
          activeStaff: 1,
          inactiveStaff: { $subtract: ["$staffCount", "$activeStaff"] },
        },
      },
    ]);
 
    res.json(branchStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Department-wise analytics
exports.getDepartmentAnalytics = async (req, res) => {
  console.log( "hh")
  try {
    const departmentStats = await Organization.aggregate([
      {
        $group: {
          _id: "$department",
          staffCount: { $sum: 1 },
          activeStaff: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "departmentDetails",
        },
      },
      {
        $unwind: "$departmentDetails",
      },
      {
        $project: {
          departmentName: "$departmentDetails.name",
          departmentCode: "$departmentDetails.code",
          staffCount: 1,
          activeStaff: 1,
          inactiveStaff: { $subtract: ["$staffCount", "$activeStaff"] },
        },
      },
    ]);

    res.json(departmentStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
// Salary distribution analytics
exports.getSalaryAnalytics = async (req, res) => {
  try {
    const salaryRanges = [
      { min: 0, max: 300000, label: "0-3 LPA" },
      { min: 300001, max: 600000, label: "3-6 LPA" },
      { min: 600001, max: 1000000, label: "6-10 LPA" },
      { min: 1000001, max: 1500000, label: "10-15 LPA" },
      { min: 1500001, max: Infinity, label: "15+ LPA" },
    ];

    const salaryStats = await Salary.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: "$user",
          netSalary: { $first: "$netSalary" },
        },
      },
      {
        $bucket: {
          groupBy: "$netSalary",
          boundaries: salaryRanges.map((range) => range.min),
          default: "Other",
          output: {
            count: { $sum: 1 },
            minSalary: { $min: "$netSalary" },
            maxSalary: { $max: "$netSalary" },
          },
        },
      },
    ]);

    // Map to include labels
    const result = salaryStats.map((stat, index) => ({
      ...stat,
      range: salaryRanges[index]?.label || "Other",
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Experience analytics
exports.getExperienceAnalytics = async (req, res) => {
  try {
    const experienceStats = await User.aggregate([
      {
        $lookup: {
          from: "experiences",
          localField: "_id",
          foreignField: "user",
          as: "experiences",
        },
      },
      {
        $project: {
          experienceCount: { $size: "$experiences" },
          currentCompanyExperience: {
            $divide: [
              {
                $subtract: [new Date(), "$dateOfJoining"],
              },
              1000 * 60 * 60 * 24 * 365, // Convert to years
            ],
          },
        },
      },
      {
        $bucket: {
          groupBy: "$currentCompanyExperience",
          boundaries: [0, 1, 3, 5, 10, Infinity],
          default: "Other",
          output: {
            count: { $sum: 1 },
            avgExperience: { $avg: "$experienceCount" },
          },
        },
      },
    ]);

    res.json(experienceStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
