const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

// MongoDB
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function getDB() {
  if (!db) {
    await client.connect();
    db = client.db("CareerMatcherDB");
    console.log("MongoDB Connected ✅");
  }
  return db;
}

// -----------------------
// Get all posts
// -----------------------
router.get("/posts", async (req, res) => {
  try {
    const database = await getDB();
    const jobs = await database.collection("posts").find().toArray();
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Fetch Jobs Error:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// -----------------------
// Get single post by ID
// -----------------------
router.get("/posts/:id", async (req, res) => {
  try {
    const database = await getDB();
    const jobId = req.params.id;
    const job = await database.collection("posts").findOne({ _id: new ObjectId(jobId) });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (err) {
    console.error("Fetch Job Error:", err);
    res.status(500).json({ message: "Failed to fetch job" });
  }
});

// -----------------------
// Create job post
// -----------------------
router.post("/posts", verifyToken, async (req, res) => {
  try {
    const database = await getDB();
    const job = { ...req.body, createdAt: new Date(), status: "Active" };
    const result = await database.collection("posts").insertOne(job);
    res.status(201).json({ message: "Job created", jobId: result.insertedId });
  } catch (err) {
    console.error("Create Job Error:", err);
    res.status(500).json({ message: "Failed to create job" });
  }
});

// -----------------------
// Update job post
// -----------------------
router.put("/posts/:id", verifyToken, async (req, res) => {
  try {
    const database = await getDB();
    const jobId = req.params.id;
    const updateData = { ...req.body };

    // Prevent updating _id
    delete updateData._id;

    const result = await database
      .collection("posts")
      .updateOne({ _id: new ObjectId(jobId) }, { $set: updateData });

    if (result.matchedCount === 0) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ message: "Job updated successfully!" });
  } catch (err) {
    console.error("Update Job Error:", err);
    res.status(500).json({ message: "Failed to update job" });
  }
});

// -----------------------
// Delete job post + related applications
// -----------------------
router.delete("/posts/:id", verifyToken, async (req, res) => {
  try {
    const database = await getDB();
    const jobId = req.params.id;

    // Delete job
    const result = await database.collection("posts").deleteOne({ _id: new ObjectId(jobId) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Job not found" });

    // Delete related applications
    await database.collection("applications").deleteMany({ jobId: new ObjectId(jobId) });

    res.status(200).json({ message: "Job and related applications deleted successfully!" });
  } catch (err) {
    console.error("Delete Job Error:", err);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

module.exports = router;