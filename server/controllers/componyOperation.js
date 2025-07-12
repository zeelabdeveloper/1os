const Branch = require("../models/Branch");
const User = require("../models/User");
const Department = require("../models/Department");
const mongoose = require("mongoose");
const {
  validateDepartment,
} = require("../validations/departmentValidation.js");
const Role = require("../models/Role.js");
const Zone = require("../models/Zone.js");

exports.fetchBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });

    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.fetchRole = async (req, res) => {
  try {
    const roles = await Role.find().populate("departmentId branchId");
    res.json(roles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching roles", error });
  }
};

exports.addBranch = async (req, res) => {
  try {
    const { code, name } = req.body;

    const existingBranch = await Branch.findOne({ code });
    if (existingBranch) {
      return res.status(400).json({ message: "Branch code already exists" });
    }

    const branch = new Branch({ code, name });
    await branch.save();
    res.status(201).json({ data: branch, message: "Added New Branch" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const branch = await Branch.findByIdAndUpdate(
      id,
      { code, name },
      { new: true, runValidators: true }
    );
    console.log(branch);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json({ message: "Branch Updated!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndDelete(id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json({ message: "Branch deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate("branch head");

    res.json({
      success: true,
      data: departments,
      message: "Departments fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};
exports.getHeadOfDepartments = async (req, res) => {
  try {
    const { isCocoStaff } = req.query;
    let user;
    if (!isCocoStaff) {
      user = await User.find({ isCocoEmployee: true })
        .select("firstName employeeId")
        .populate("EmployeeId");
    } else {
      user = await User.find()
        .select("firstName employeeId")
        .populate("EmployeeId");
    }

    res.json({
      success: true,
      data: user,
      message: "Departments fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

exports.getDepartmentsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const departments = await Department.find({ branch: branchId }).select(
      "_id name code isActive"
    );

    res.json({
      success: true,
      data: departments,
      message: "Departments fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};
exports.getZonesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const departments = await Zone.find({ branch: branchId }).select(
      "_id name code isActive"
    );

    res.json({
      success: true,
      data: departments,
      message: "Departments fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};
exports.getDepartmentOfHead = async (req, res) => {
  try {
    const { Head } = req.params;
    const departments = await Department.find({ head: Head }).select(
      "_id name code isActive"
    );

    res.json({
      success: true,
      data: departments,
      message: "Departments fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

exports.getRoleByDepartment = async (req, res) => {
  console.log("hjjkhkjhk");
  try {
    const { departmentId } = req.params;
    const role = await Role.find({ departmentId: departmentId }).select(
      "_id name isActive"
    );

    res.json({
      success: true,
      data: role,
      message: "role fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch role",
      error: error.message,
    });
  }
};

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { error } = validateDepartment(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    console.log(req.body);
    // Check if branch exists
    const branch = await Branch.findById(req.body.branch);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Check if department code is unique within the branch
    const existingDept = await Department.findOne({
      code: req.body.code,
      branch: req.body.branch,
    });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: "Department code must be unique within a branch",
      });
    }

    const department = new Department(req.body);
    await department.save();

    res.status(201).json({
      success: true,
      data: department,
      message: "Department created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create department",
      error: error.message,
    });
  }
};
exports.createRole = async (req, res) => {
  try {
    const { name, description, departmentId, branchId, status } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        message: "Role name is required and must be a non-empty string",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({ message: "Description must be a string" });
    }
    if (!departmentId || !mongoose.isValidObjectId(departmentId)) {
      return res
        .status(400)
        .json({ message: "Valid departmentId is required" });
    }
    if (!branchId || !mongoose.isValidObjectId(branchId)) {
      return res.status(400).json({ message: "Valid branchId is required" });
    }

    if (!status) {
      return res
        .status(400)
        .json({ message: "Status must be either active or inactive" });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name, departmentId, branchId });
    if (existingRole) {
      return res.status(400).json({
        message:
          "Role with this name already exists in the specified department and branch",
      });
    }

    // Create and save role
    const role = new Role({
      name: name.trim(),
      description: description?.trim(),
      departmentId,
      branchId,
      status: status || "active",
    });

    await role.save();

    res.status(201).json({
      message: "Role added successfully!!",
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      message: error.message || "Error adding role",
      error: error.message,
    });
  }
};
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await Role.findByIdAndDelete(id);
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting role", error });
  }
};
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, departmentId, branchId, status } = req.body;
    await Role.findByIdAndUpdate(id, {
      name,
      description,
      department: departmentId,
      branch: branchId,
      status,
    });
    res.json({ message: "Role updated successfully!!" });
  } catch (error) {
    res.status(400).json({ message: "Error updating role", error });
  }
};

// Update a department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validateDepartment(req.body, true);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check if branch exists if being updated
    if (req.body.branch) {
      const branch = await Branch.findById(req.body.branch);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }
    }

    const department = await Department.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({
      success: true,
      data: department,
      message: "Department updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update department",
      error: error.message,
    });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete department",
      error: error.message,
    });
  }
};

exports.getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find().populate("branch head");
    res.json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createZone = async (req, res) => {
  try {
    const { name, code, branch, head, isActive } = req.body;

    // Basic validation
    if (!name || !code || !branch) {
      return res.status(400).json({
        success: false,
        message: "Name, code and branch are required",
      });
    }

    // Check branch exists
    const branchExists = await Branch.findById(branch);
    if (!branchExists) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Check unique code per branch
    const existingZone = await Zone.findOne({ code, branch });
    if (existingZone) {
      return res.status(400).json({
        success: false,
        message: "Zone code must be unique within a branch",
      });
    }

    const zone = new Zone({ name, code, branch, head, isActive });
    await zone.save();

    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, branch, head, isActive } = req.body;

    // Check if zone exists
    const existingZone = await Zone.findById(id);
    if (!existingZone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found",
      });
    }

    // If branch is being updated, verify it exists
    if (branch && branch !== existingZone.branch.toString()) {
      const branchExists = await Branch.findById(branch);
      if (!branchExists) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      // Check if new code is unique in new branch
      const codeExists = await Zone.findOne({ code, branch });
      if (codeExists && codeExists._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: "Zone code must be unique within a branch",
        });
      }
    }

    const updatedZone = await Zone.findByIdAndUpdate(
      id,
      { name, code, branch, head, isActive },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedZone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await Zone.findByIdAndDelete(id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone not found",
      });
    }

    res.json({ success: true, message: "Zone deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/userController.js

const Attendance = require("../models/Attendance");
const moment = require("moment");

exports.analyticsByBranch = async (req, res) => {
  try {
    const { id: branchId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    // Base match conditions
    const matchConditions = {
      "Organization.branch": new mongoose.Types.ObjectId(branchId)
    };

    // Status filter
    if (status !== undefined) {
      matchConditions.isActive = status === "true";
    }

    // Search functionality (by name or employee ID)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      matchConditions.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { 'EmployeeId.employeeId': searchRegex } 
      ];
    }

    // Aggregation Pipeline
    const aggregationPipeline = [
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
          from: "employeeids",
          localField: "EmployeeId",
          foreignField: "_id",
          as: "EmployeeId",
        },
      },
      { $unwind: { path: "$EmployeeId", preserveNullAndEmptyArrays: true } },
      { $match: matchConditions },
      {
        $facet: {
          employees: [
            { $sort: { isActive: -1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                isActive: 1,
                dateOfJoining: 1,
                Profile: 1,
                EmployeeId: 1,
                Organization: {
                  department: 1,
                  role: 1,
                  employmentType: 1
                }
              }
            }
          ],
          pagination: [
            { $count: "total" }
          ]
        }
      },
      {
        $project: {
          employees: 1,
          pagination: {
            current: parseInt(page),
            pageSize: parseInt(limit),
            total: { $ifNull: [{ $arrayElemAt: ["$pagination.total", 0] }, 0] }
          }
        }
      }
    ];

    const result = await User.aggregate(aggregationPipeline);

    res.status(200).json({
      success: true,
      data: result[0] || {
        employees: [],
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total: 0
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};