const express = require("express");
const router = express.Router();

const { getJobs } = require("../controllers/postController");

router.get("/", getJobs);

module.exports = router;