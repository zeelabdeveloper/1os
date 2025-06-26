const Permission = require("../models/developer/Permission");
const AllRoute = require("../models/developer/CreateRoute");
const ChildRoute = require("../models/developer/ChildRoute");

exports.getPermissionTree = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const routeHeaders = await AllRoute.find().populate({
      path: 'child',
      select: 'url label'
    }).lean();
    
    let existingPermissions = [];
    if (roleId) {
      const permissionDoc = await Permission.findOne({ role: roleId });
      if (permissionDoc) {
        existingPermissions = permissionDoc.permissions
          .filter(p => p.access)
          .map(p => p.route.toString());
      }
    }
    
    const tree = routeHeaders.map(header => ({
      key: `header-${header._id}`,
      title: header.header,
      children: header.child.map(child => ({
        key: child._id.toString(),
        title: child.label,
        path: child.url,
        isLeaf: true,
        disabled: false,
        selected: roleId ? existingPermissions.includes(child._id.toString()) : false
      }))
    }));
    
    return res.status(200).json({
      success: true,
      message: "Permission tree fetched successfully",
      data: tree
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { selectedRoutes } = req.body;
    
    if (!Array.isArray(selectedRoutes)) {
      return res.status(400).json({
        success: false,
        message: "selectedRoutes must be an array"
      });
    }
    
    const allChildRoutes = await ChildRoute.find({ 
      _id: { $in: selectedRoutes } 
    });
    
    if (allChildRoutes.length !== selectedRoutes.length) {
      return res.status(400).json({
        success: false,
        message: "One or more route IDs are invalid"
      });
    }
    
    let permission = await Permission.findOne({ role: roleId });
    
    if (!permission) {
      permission = new Permission({
        role: roleId,
        permissions: selectedRoutes.map(routeId => ({
          route: routeId,
          access: true
        }))
      });
    } else {
      const existingPermissions = new Map();
      permission.permissions.forEach(p => {
        existingPermissions.set(p.route.toString(), p.access);
      });
      
      const allRouteIds = allChildRoutes.map(r => r._id.toString());
      
      permission.permissions = allRouteIds.map(routeId => ({
        route: routeId,
        access: selectedRoutes.includes(routeId),
        createdAt: existingPermissions.has(routeId) 
          ? existingPermissions.get(routeId).createdAt 
          : new Date()
      }));
    }
    
    await permission.save();
    
    return res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      data: await Permission.findById(permission._id)
        .populate('permissions.route')
    });
  } catch (error) {console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRolePermissionsSummary = async (req, res) => {
  try {
    const permissions = await Permission.find()
      .populate('role', 'name')
      .populate('permissions.route', 'label url');
    
    const summary = permissions.map(perm => ({
      roleId: perm.role._id,
      roleName: perm.role.name,
      totalRoutes: perm.permissions.length,
      allowedRoutes: perm.permissions.filter(p => p.access).length,
      lastUpdated: perm.updatedAt
    }));
    
    return res.status(200).json({
      success: true,
      message: "Permissions summary fetched successfully",
      data: summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};