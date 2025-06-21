const mongoose = require("mongoose");
const User = require("../models/User");
const Profile = require("../models/Profile");

const Bank = require("../models/Bank");
const EmployeeId = require("../models/EmployeeId");
const Salary = require("../models/Salary");
const Organization = require("../models/Organization");
const Experience = require("../models/Experience");

module.exports = {
  createStaff: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userCount = await User.countDocuments();
      const newEmployeeId = `EMP${userCount + 1}`;

      const data = { ...req.body.user };
      if (req.body.user.reportingto) {
        data.reportingto = req.body.user.reportingto;
        data.isCocoEmployee = true;
      }
      const newUser = new User(data);
      const savedUser = await newUser.save({ session });

      // Save EmployeeId record
      const employeeIdDoc = new EmployeeId({
        employeeId: newEmployeeId,
        user: savedUser._id,
      });
      await employeeIdDoc.save({ session });

      // You can optionally assign this if you still want a ref
      await savedUser.updateOne(
        { $set: { EmployeeId: employeeIdDoc._id } },
        { session }
      );

      const newProfile = new Profile({
        ...req.body.profile,
        photo: "",
        user: savedUser._id,
        family: {
          ...req.body.family,
        },
      });
      await newProfile.save({ session });

      await savedUser.updateOne(
        { $set: { Profile: newProfile._id } },
        { session }
      );

      const newBank = new Bank({
        ...req.body.bank,
        user: savedUser._id,
      });
      await newBank.save({ session });
      await savedUser.updateOne({ $set: { Bank: newBank._id } }, { session });

      const newOrg = new Organization({
        ...req.body.organization,
        user: savedUser._id,
      });
      await newOrg.save({ session });
      await savedUser.updateOne(
        { $set: { Organization: newOrg._id } },
        { session }
      );

      const newSalary = new Salary({
        ...req.body.salary,
        user: savedUser._id,
      });
      await savedUser.updateOne(
        { $set: { Salary: newSalary._id } },
        { session }
      );
      await newSalary.save({ session });

      // 7. Handle Experiences (if needed)
      if (req.body.experiences && req.body.experiences.length > 0) {
        // Assuming you have an Experience model
        const experiences = req.body.experiences.map((exp) => ({
          user: savedUser._id,
          ...exp,
        }));
        const savedExperiences = await Experience.insertMany(experiences, {
          session,
        });
        const experienceIds = savedExperiences.map((exp) => exp._id);
        await savedUser.updateOne(
          { $set: { Experience: experienceIds } },
          { session }
        );
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Return success response
      return res.status(201).json({
        success: true,
        message: "Staff created successfully!!!",
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();

      console.error("Error creating staff:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create staff",
        error: error.message,
      });
    }
  },

  getStaffByEmpId: async (req, res) => {
    try {
      const { empId } = req.params;

      const user = await User.aggregate([
        {
          $lookup: {
            from: "employeeids",
            localField: "EmployeeId",
            foreignField: "_id",
            as: "EmployeeId",
          },
        },
        { $unwind: "$EmployeeId" },
        { $match: { "EmployeeId.employeeId": empId?.toUpperCase() } },
        {
          $lookup: {
            from: "profiles",
            localField: "Profile",
            foreignField: "_id",
            as: "Profile",
          },
        },
        { $unwind: { path: "$Profile", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "banks",
            localField: "Bank",
            foreignField: "_id",
            as: "Bank",
          },
        },
        { $unwind: "$Bank" },
        {
          $lookup: {
            from: "organizations",
            localField: "Organization",
            foreignField: "_id",
            as: "Organization",
          },
        },
        { $unwind: "$Organization" },

        {
          $lookup: {
            from: "companybranches",
            localField: "Organization.branch",
            foreignField: "_id",
            as: "Branch",
          },
        },
        { $unwind: { path: "$Branch", preserveNullAndEmptyArrays: true } },

        // 7. Populate Organization.department
        {
          $lookup: {
            from: "departments",
            localField: "Organization.department",
            foreignField: "_id",
            as: "Department",
          },
        },
        { $unwind: { path: "$Department", preserveNullAndEmptyArrays: true } },

        // 8. Populate Organization.role
        {
          $lookup: {
            from: "roles",
            localField: "Organization.role",
            foreignField: "_id",
            as: "Role",
          },
        },
        { $unwind: { path: "$Role", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "salaries",
            localField: "Salary",
            foreignField: "_id",
            as: "Salary",
          },
        },
        { $unwind: "$Salary" },
        {
          $lookup: {
            from: "experiences",
            localField: "Experience",
            foreignField: "_id",
            as: "Experience",
          },
        },
      ]);

      if (!user || user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No user found with that employee ID",
        });
      }

      res.status(200).json({
        success: true,
        data: user[0],
        message: "Staff fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Server error while fetching staff",
        error: error.message,
      });
    }
  },
  fetchStaffByRole: async (req, res) => {
    console.log("fgfg")
    try {
      const { roleID } = req.params;

      const users = await User.aggregate([
        {
          // Lookup organization data
          $lookup: {
            from: "organizations", // collection name in MongoDB (lowercase, plural)
            localField: "Organization",
            foreignField: "_id",
            as: "organizationData",
          },
        },
        {
          // Flatten the organizationData array
          $unwind: "$organizationData",
        },
        {
          // Match users by roleID inside organization
          $match: {
            "organizationData.role": new mongoose.Types.ObjectId(roleID),
          },
        },
        {
          // Optionally populate/report only selected fields
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            contactNumber: 1,
            fullName: { $concat: ["$firstName", " ", "$lastName"] },
            role: "$organizationData.role",
            branch: "$organizationData.branch",
            department: "$organizationData.department",
          },
        },
      ]);

      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found for the given role ID",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Staff fetched successfully",
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error while fetching staff",
        error: error.message,
      });
    }
  },
  editStaffByEmpId: async (req, res) => {
    console.log(req.body);
    try {
      id;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Server error while edit staff",
        error: error.message,
      });
    }
  },

  getStaff: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      console.log(req.query);

      // Build search query
      const query = {};
      if (search) {
        const searchRegex = { $regex: search, $options: "i" };

        query.$or = [
          { email: searchRegex },
          { _id: { $in: profileIds } },
          { _id: { $in: bankIds } },
        ];
      }

      // Get data with pagination
      const [totalCount, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
          .populate("Profile Bank")
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit))
          .lean(),
      ]);

      res.status(200).json({
        success: true,
        data: users,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching staff",
        error: error.message,
      });
    }
  },

  deleteStaff: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({
        success: true,
        message: "Staff deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting staff",
        error: error.message,
      });
    }
  },
};
