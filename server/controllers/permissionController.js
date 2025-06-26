const Permission = require("../models/Permission");
const AllRoute = require("../models/developer/AllRoute");
const ChildRoute = require("../models/developer/ChildRoute");
const { ErrorResponse, SuccessResponse } = require("../utils/response");

// Get all routes with children for permission management
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await AllRoute.find().populate('child');
    return new SuccessResponse(res, "Routes fetched successfully", routes);
  } catch (error) {
    return new ErrorResponse(res, error.message);
  }
};

// Get permissions for a specific role
exports.getRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const permission = await Permission.findOne({ role: roleId }).populate('childRoutes.route');
    
    if (!permission) {
      return new SuccessResponse(res, "No permissions found for this role", { childRoutes: [] });
    }
    
    return new SuccessResponse(res, "Permissions fetched successfully", permission);
  } catch (error) {
    return new ErrorResponse(res, error.message);
  }
};

// Create or update permissions for a role
exports.updatePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { childRoutes } = req.body;
    
    // Validate input
    if (!Array.isArray(childRoutes)) {
      return new ErrorResponse(res, "childRoutes must be an array", 400);
    }
    
    // Check if permission exists
    let permission = await Permission.findOne({ role: roleId });
    
    if (!permission) {
      // Create new permission
      permission = new Permission({
        role: roleId,
        childRoutes: childRoutes.map(route => ({
          route: route._id,
          access: true
        }))
      });
    } else {
      // Update existing permission
      permission.childRoutes = childRoutes.map(route => ({
        route: route._id,
        access: true
      }));
    }
    
    await permission.save();
    await permission.populate('childRoutes.route');
    
    return new SuccessResponse(res, "Permissions updated successfully", permission);
  } catch (error) {
    return new ErrorResponse(res, error.message);
  }
};

// Delete permissions for a role
exports.deletePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const result = await Permission.deleteOne({ role: roleId });
    
    if (result.deletedCount === 0) {
      return new ErrorResponse(res, "No permissions found for this role", 404);
    }
    
    return new SuccessResponse(res, "Permissions deleted successfully");
  } catch (error) {
    return new ErrorResponse(res, error.message);
  }
};