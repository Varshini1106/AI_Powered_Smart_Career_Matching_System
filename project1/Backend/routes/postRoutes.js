const express = require("express");
const router = express.Router();

const {
  addPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} = require("../controllers/postController");

// Create job post
router.post("/posts", addPost);

// Get all jobs
router.get("/posts", getAllPosts);

// Get job by ID
router.get("/posts/:id", getPostById);

// Update job
router.put("/posts/:id", updatePost);

// Delete job
router.delete("/posts/:id", deletePost);

module.exports = router;