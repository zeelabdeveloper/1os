const express = require("express");
const router = express.Router();

const {
  createStore,
  updateStore,
  getAllStores,
  deleteStore,
  getStoreGroups,
  createStaff,
  getStaff,
  getStaffByEmpId,
  editStaffByEmpId,
  deleteStaff,
} = require("../../controllers/store/storeController");

router.post("/", createStore);
router.get("/", getAllStores);
router.put("/:id", updateStore);
router.delete("/:id", deleteStore);
router.get("/store-groups", getStoreGroups);





 






module.exports = router;