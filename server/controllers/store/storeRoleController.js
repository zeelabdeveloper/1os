const { validationResult } = require("express-validator");
const Role = require("../../models/stores/Roles");
 
exports.createRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const role = new Role({ 
      name: name.toUpperCase() // Convert to uppercase before saving
    });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Role name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const role = await Role.findByIdAndUpdate(
      id,
      { 
        name: name.toUpperCase(), // Convert to uppercase before updating
        updatedAt: Date.now() 
      },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Role name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};