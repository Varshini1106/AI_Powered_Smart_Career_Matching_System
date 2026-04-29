const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function getDB() {
  if (!db) {
    await client.connect();
    db = client.db("CareerMatcherDB");
    console.log("MongoDB Connected for Stats ✅");
  }
  return db;
}

// GET DASHBOARD STATS
router.get("/stats", async (req, res) => {
  try {
    const database = await getDB();

    const totalJobs = await database.collection("posts").countDocuments();

    const activeJobs = await database.collection("posts").countDocuments({
      status: "Active"
    });

    const totalApplications = await database
      .collection("applications")
      .countDocuments();

    const totalUsers = await database.collection("users").countDocuments();

    res.json({
      totalJobs,
      activeJobs,
      totalApplications,
      totalUsers
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;