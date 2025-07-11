const express = require("express");
const router = express.Router();
const {
  fetchBranches,
  addBranch,
  updateBranch,
  deleteBranch,
 
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getHeadOfDepartments,
  getAllDepartments,
  getDepartmentsByBranch,
  createRole,
  fetchRole,
  deleteRole,
  updateRole,
  getRoleByDepartment,
  getDepartmentOfHead,
  getAllZones,
  createZone,
  updateZone,
  deleteZone,
} = require("../controllers/componyOperation");



router.get("/companyBranch", fetchBranches);
router.post("/companyBranch", addBranch);
router.put("/companyBranch/:id", updateBranch);
router.delete("/companyBranch/:id", deleteBranch);



router.get("/departments", getAllDepartments);
router.get("/departments/head", getHeadOfDepartments);
router.get("/branch/department/:branchId", getDepartmentsByBranch);
router.get("/branch/department/role/:departmentId", getRoleByDepartment);
router.get("/Head/department/:Head", getDepartmentOfHead);


router.get("/departments", getAllDepartments);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);


router.get("/zones", getAllZones);
router.post("/zones", createZone);
router.put("/zones/:id", updateZone);
router.delete("/zones/:id", deleteZone);



// roles
router.post("/roles", createRole);
router.get("/roles", fetchRole);
router.delete("/roles/:id", deleteRole);
router.put("/roles/:id", updateRole);

module.exports = router;