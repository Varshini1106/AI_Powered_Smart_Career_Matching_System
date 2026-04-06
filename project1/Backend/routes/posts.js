const express = require("express");
const router = express.Router();

const {
  addPost,
  getAllPosts,
  getPostById,
  updatePost
} = require("../controllers/postController");

// GET all posts
router.get("/", getAllPosts);

// GET single post
router.get("/:id", getPostById);

// CREATE post
router.post("/", addPost);

// UPDATE post
router.put("/:id", updatePost);

module.exports = router;