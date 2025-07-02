const express = require("express");
const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsByRole,
} = require("../controllers/newsController");

const router = express.Router();

router.route("/").get(getNews).post(createNews);
router.get("/notifications", getNewsByRole);

router.route("/:id").get(getNewsById).put(updateNews).delete(deleteNews);

module.exports = router;
