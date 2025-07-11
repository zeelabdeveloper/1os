const express = require("express");
const router = express.Router();
const User = require("../models/User");

const mongoose = require("mongoose");
const Department = require("../models/Department");

// ✅ Create User

// ✅ Get All Users

router.get("/allusers/:userId", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "head",
          as: "managedDepartments",
        },
      },
      {
        $match: {
          "managedDepartments.0": { $exists: true },
          _id: new mongoose.Types.ObjectId(req.params.userId),
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "managedDepartments._id",
          foreignField: "department",
          as: "orgs",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "orgs.user",
          foreignField: "_id",
          as: "teamUsers",
        },
      },
      { $unwind: "$teamUsers" },
      {
        $replaceRoot: { newRoot: "$teamUsers" },
      },
      {
        $lookup: {
          from: "employeeids",
          localField: "EmployeeId",
          foreignField: "_id",
          as: "EmployeeId",
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "Store",
          foreignField: "_id",
          as: "Store",
        },
      },
      {
        $unwind: {
          path: "$EmployeeId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$Store",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});






















router.get("/myteam/analytics/:id", async (req, res) => {
  try {
    const headId = req.params.id;

    // Step 1: Find all departments where this user is the head
    const departments = await Department.find({ head: headId }).select('_id');
    const departmentIds = departments.map(dept => dept._id);

    if (departmentIds.length === 0) {
      return res.status(200).json({ 
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0 
      });
    }

    // Step 2: Aggregate to count total, active, and inactive members
    const result = await User.aggregate([
      // Lookup organization data
      {
        $lookup: {
          from: "organizations",
          localField: "Organization",
          foreignField: "_id",
          as: "orgData",
        },
      },
      { $unwind: "$orgData" },

      // Match users in the departments where head is the given ID
      {
        $match: {
          "orgData.department": { $in: departmentIds }
        }
      },

      // Group to count active and inactive members
      {
        $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          activeMembers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
          },
          inactiveMembers: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
          }
        }
      }
    ]);

    // Default response if no members found
    const response = result[0] || {
      totalMembers: 0,
      activeMembers: 0,
      inactiveMembers: 0
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});
































// router.get("/allusers/:userId", async (req, res) => {
//   try {
//     // Step 1: Find all departments where this user is the head
//     const departments = await Department.find({ head: req.params.userId });

//     if (!departments || departments.length === 0) {
//       return res.status(404).json({ message: "No departments found where user is head" });
//     }

//     // Get department IDs
//     const departmentIds = departments.map(dept => dept._id);

//     // Step 2: Find all organizations that belong to these departments
//     const organizations = await Organization.find({
//       department: { $in: departmentIds }
//     });

//     // Get user IDs from these organizations
//     const userIds = organizations.map(org => org.user);

//     // Step 3: Find all users from these organizations
//     const users = await User.find({
//       _id: { $in: userIds }
//     }).populate([
//       {
//         path: "EmployeeId",
//         strictPopulate: false,
//       },
//       {
//         path: "Store",
//         strictPopulate: false,
//       },
//       {
//         path: "Organization",
//         populate: {
//           path: "department",
//           model: "Department"
//         }
//       }
//     ]);

//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// ✅ Get Single User by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update User
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated document
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Delete User
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
