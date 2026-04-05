const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const verifyToken = require("../middleware/authMiddleware");

// Using the URI from your .env
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Helper to get the database
const getDB = () => client.db("CareerMatcherCluster");

// 1. SUBMIT APPLICATION (User Action)
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    // Expecting: { postId, userId, status: "pending", appliedAt: new Date() }
    const result = await db.collection("Applications").insertOne(req.body);
    res.json({
      message: "Application submitted successfully ✅",
      applicationId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET ALL APPLICATIONS (Admin View)
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const applications = await db.collection("Applications").find().toArray();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET MY APPLICATIONS (User Dashboard View)
// This is the "Phase 1" route we just built!
router.get("/my-applications", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id; // Extracted from the JWT by verifyToken

    // Find only applications matching this user's ID
    const myApps = await db.collection("Applications")
      .find({ userId: userId }) 
      .toArray();

    res.json(myApps);
  } catch (error) {
    res.status(500).json({ error: "Error fetching your applications" });
  }
});

// 4. UPDATE STATUS (Admin Action: Accept/Reject)
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;
    await db.collection("Applications").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: status } }
    );
    res.json({ message: "Status updated to " + status + " ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;