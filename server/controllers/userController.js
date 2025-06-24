const mongoose = require("mongoose");
const User = require("../models/User");
const Profile = require("../models/Profile");

const Bank = require("../models/Bank");
const EmployeeId = require("../models/EmployeeId");
const Salary = require("../models/Salary");
const Organization = require("../models/Organization");
const Experience = require("../models/Experience");
const Asset = require("../models/Assets");
const Document = require("../models/Document");

module.exports = {
  createStaff: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userCount = await EmployeeId.countDocuments();
      const newEmployeeId = `EMP${userCount + 1}`;

      const data = { ...req.body.user };

      if (req?.body?.user?.reportingto) {
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

      // 7. Handle assets (if needed)
      if (req.body.assets && req.body.assets.length > 0) {
        // Assuming you have an Experience model
        const assets = req.body.assets.map((exp) => ({
          user: savedUser._id,
          ...exp,
        }));
        const savedAssets = await Asset.insertMany(assets, {
          session,
        });
        const AssetIds = savedAssets.map((exp) => exp._id);
        await savedUser.updateOne({ $set: { Asset: AssetIds } }, { session });
      }

      // 7. Handle document (if needed)
      if (req.body.documents && req.body.documents.length > 0) {
        // Assuming you have an Experience model
        const documents = req.body.documents.map((exp) => ({
          user: savedUser._id,

          ...exp,
        }));
        const savedAssets = await Document.insertMany(documents, {
          session,
        });
        const AssetIds = savedAssets.map((exp) => exp._id);
        await savedUser.updateOne(
          { $set: { Document: AssetIds } },
          { session }
        );
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Return success response
      return res.status(201).json({
        success: true,
        data: savedUser,
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

      if (!mongoose.Types.ObjectId.isValid(empId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid employee ID format" });
      }

      const result = await User.aggregate([
        // Stage 1: Match the user
        { $match: { _id: new mongoose.Types.ObjectId(empId) } },

        // Stage 2: Lookup all related data in parallel
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
            from: "profiles",
            localField: "Profile",
            foreignField: "_id",
            as: "Profile",
          },
        },
        {
          $lookup: {
            from: "banks",
            localField: "Bank",
            foreignField: "_id",
            as: "Bank",
          },
        },
        {
          $lookup: {
            from: "organizations",
            localField: "Organization",
            foreignField: "_id",
            as: "Organization",
            pipeline: [
              // Nested lookup for organization relations
              {
                $lookup: {
                  from: "companybranches",
                  localField: "branch",
                  foreignField: "_id",
                  as: "branch",
                },
              },
              {
                $lookup: {
                  from: "departments",
                  localField: "department",
                  foreignField: "_id",
                  as: "department",
                },
              },
              {
                $lookup: {
                  from: "roles",
                  localField: "role",
                  foreignField: "_id",
                  as: "role",
                },
              },
              {
                $unwind: { path: "$branch", preserveNullAndEmptyArrays: true },
              },
              {
                $unwind: {
                  path: "$department",
                  preserveNullAndEmptyArrays: true,
                },
              },
              { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
            ],
          },
        },
        {
          $lookup: {
            from: "salaries",
            localField: "Salary",
            foreignField: "_id",
            as: "Salary",
          },
        },
        {
          $lookup: {
            from: "experiences",
            localField: "Experience",
            foreignField: "_id",
            as: "Experience",
          },
        },
        {
          $lookup: {
            from: "assets",
            localField: "Asset",
            foreignField: "_id",
            as: "Asset",
          },
        },
        {
          $lookup: {
            from: "documents",
            localField: "Document",
            foreignField: "_id",
            as: "Document",
          },
        },

        // Stage 3: Unwind single-reference fields
        { $unwind: { path: "$EmployeeId", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$Profile", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$Bank", preserveNullAndEmptyArrays: true } },
        {
          $unwind: { path: "$Organization", preserveNullAndEmptyArrays: true },
        },
        { $unwind: { path: "$Salary", preserveNullAndEmptyArrays: true } },

        // Stage 4: Projection (remove sensitive/unwanted fields)
        {
          $project: {
            password: 0,
            __v: 0,
            "EmployeeId.__v": 0,
            "Profile.__v": 0,
            "Bank.__v": 0,
            "Organization.__v": 0,
            "Salary.__v": 0,
            "Experience.__v": 0,
            "Asset.__v": 0,
            "Document.__v": 0,
            "Organization.branch.__v": 0,
            "Organization.department.__v": 0,
            "Organization.role.__v": 0,
          },
        },
      ]);

      if (!result.length) {
        return res
          .status(404)
          .json({ success: false, message: "No user found with that ID" });
      }

      res.status(200).json({
        success: true,
        data: result[0],
        message: "Staff fetched successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching staff",
        error: error.message,
      });
    }
  },

  fetchStaffByRole: async (req, res) => {
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
      const { empId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(empId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid employee ID format" });
      }

      const user = await User.findById(empId);
      // console.log(user);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User Not Found",
        });
      }

      if (req.body?.personal) {
        await User.findByIdAndUpdate(req.params.empId, req.body.personal);
      }
      if (req.body?.profile) {
        await Profile.findByIdAndUpdate(
          user.Profile,

          {
            ...req.body.profile,
          }
        );
      }
      if (req.body?.organization) {
        await Organization.findByIdAndUpdate(
          user.Organization,

          {
            ...req.body.organization,
          }
        );
      }
      if (req.body?.bank) {
        await Bank.findByIdAndUpdate(
          user.Bank,

          {
            ...req.body.bank,
          }
        );
      }
      if (req.body?.salary) {
        await Salary.findByIdAndUpdate(
          user.Salary,

          {
            ...req.body.salary,
          }
        );
      }

      if (req.body?.document?.length > 0) {
        const docsToUpdate = req.body.document.filter((doc) => doc._id);
        const docsToCreate = req.body.document.filter((doc) => !doc._id);

        // Update existing docs
        if (docsToUpdate.length > 0) {
          await Promise.all(
            docsToUpdate.map((doc) => Document.findByIdAndUpdate(doc._id, doc))
          );
        }

        // Create new docs & add their IDs to user.Document
        if (docsToCreate.length > 0) {
          const newDocs = docsToCreate.map((doc) => ({
            ...doc,
            user: empId, // Link to the user
          }));

          const createdDocs = await Document.insertMany(newDocs);

          // Add new document IDs to user.Document array
          user.Document.push(...createdDocs.map((doc) => doc._id));
          await user.save();
        }
      }

      return res.status(200).json({ message: "Data Updated!" });
    } catch (error) {
      console.log(error);
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
