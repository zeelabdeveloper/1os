const Role = require("../models/Role");

exports.getAllRoleList = async (req, res) => {
  try {
const roleList = await Role.find();
console.log(roleList)
  } catch (error) {
    console.log(error);
  } 
};  