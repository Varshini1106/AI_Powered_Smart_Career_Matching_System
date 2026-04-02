// routes/posts.js
const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

// GET all posts
router.get("/", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("CareerMatcherDB");
    const posts = await db.collection("posts").find().toArray();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a post
router.post("/", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("CareerMatcherDB");

    const newPost = req.body;

    const result = await db.collection("posts").insertOne(newPost);

    res.json({
      message: "Post created successfully ✅",
      postId: result.insertedId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;