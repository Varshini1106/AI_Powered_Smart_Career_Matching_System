const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

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

/* ================= GET ALL JOBS ================= */

router.get("/posts", async (req, res) => {
  try {
    const database = await getDB();

    const jobs = await database
      .collection("posts")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(jobs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});


/* ================= GET SINGLE JOB ================= */

router.get("/posts/:id", async (req, res) => {
  try {
    const database = await getDB();

    const job = await database.collection("posts").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch job" });
  }
});


/* ================= CREATE JOB ================= */

router.post("/posts", async (req, res) => {
  try {
    const database = await getDB();

    const job = {
      ...req.body,
      createdAt: new Date(),
      status: "Active"
    };

    const result = await database.collection("posts").insertOne(job);

    res.status(201).json({
      message: "Job created successfully",
      jobId: result.insertedId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create job" });
  }
});


/* ================= UPDATE JOB ================= */

router.put("/posts/:id", async (req, res) => {
  try {
    const database = await getDB();

    const jobId = req.params.id;

    const updateData = { ...req.body };
    delete updateData._id;

    const result = await database.collection("posts").updateOne(
      { _id: new ObjectId(jobId) },
      { $set: updateData }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update job" });
  }
});


/* ================= DELETE JOB ================= */

router.delete("/posts/:id", async (req, res) => {
  try {
    const database = await getDB();

    const jobId = req.params.id;

    const result = await database
      .collection("posts")
      .deleteOne({ _id: new ObjectId(jobId) });

    if (!result.deletedCount) {
      return res.status(404).json({ message: "Job not found" });
    }

    // delete related applications
    await database.collection("applications").deleteMany({
      jobId: new ObjectId(jobId)
    });

    res.json({ message: "Job deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete job" });
  }
});


module.exports = router;