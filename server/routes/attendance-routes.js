const express = require("express");
const router = express.Router();
const {
  getTodayAttendance,
  checkIn,
  checkOut,
  getHistory,
  updateAttendance,
  requestLeave,
  getLeaves,
  cancelLeave,
  getReport,
  getHistoryByMonthly,
  getAttendanceRecords,
} = require("../controllers/atttendanceController");
 
router.get("/monthly",   getHistoryByMonthly);
router.get("/today",  getTodayAttendance);
router.post("/checkin",   checkIn);
router.post("/checkout",   checkOut);
router.get("/history",   getHistory);
router.get("/getAttendanceRecords",   getAttendanceRecords);

router.put("/:id",   updateAttendance);
router.post("/leave",  requestLeave);
router.get("/leave", getLeaves);
router.delete("/leave/:id", cancelLeave);
router.get("/report", getReport);

module.exports = router;
