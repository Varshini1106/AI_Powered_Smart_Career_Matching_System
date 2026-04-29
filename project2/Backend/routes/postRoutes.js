const express = require("express");
console.log("postRoutes loaded");
const { MongoClient, ObjectId } = require("mongodb");

const router = express.Router();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

// Connect once
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("CareerMatcherDB");
    console.log("MongoDB Connected ✅");
  }
}

connectDB();

/* ================= COUNT JOB POSTS ================= */

router.get("/count", async (req, res) => {
  try {
    const count = await db.collection("posts").countDocuments();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get post count" });
  }
});

/* ================= GET ALL JOBS ================= */

router.get("/", async (req, res) => {
  try {
    const jobs = await db.collection("posts").aggregate([
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "jobId",
          as: "applications"
        }
      },
      {
        $addFields: {
          applicationsCount: { $size: "$applications" }
        }
      },
      {
        $project: {
          applications: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

/* ================= GET SINGLE JOB ================= */

router.get("/:id", async (req, res) => {
  try {
    const job = await db.collection("posts").findOne({
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

router.post("/", async (req, res) => {
  try {
    const job = {
      ...req.body,
      createdAt: new Date(),
      status: "Active"
    };

    const result = await db.collection("posts").insertOne(job);

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

router.put("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    const updateData = { ...req.body };
    delete updateData._id;

    const result = await db.collection("posts").updateOne(
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

router.delete("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    const result = await db.collection("posts").deleteOne({
      _id: new ObjectId(jobId)
    });

    if (!result.deletedCount) {
      return res.status(404).json({ message: "Job not found" });
    }

    await db.collection("applications").deleteMany({
      jobId: new ObjectId(jobId)
    });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

module.exports = router;