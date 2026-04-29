const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware"); // JWT middleware
const router = express.Router();

// --------------------
// MongoDB Setup
// --------------------
const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
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

// --------------------
// Multer Setup for Resume Upload
// --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/resumes"),
  filename: (req, file, cb) => cb(Date.now() + "-" + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only PDF, DOC, DOCX allowed"));
};

const upload = multer({ storage, fileFilter });

// --------------------
// Apply to a Job
// --------------------
router.post("/apply", verifyToken, upload.single("resume"), async (req, res) => {
  try {
    const database = await getDB();
    const userId = req.user.id; // from JWT
    const { jobId, userName, experience, currentRole, education, skills, reason } = req.body;

    if (!jobId || !userName || !experience || !education || !skills || !reason) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check if already applied
    const exists = await database.collection("applications").findOne({
      jobId: new ObjectId(jobId),
      userId: new ObjectId(userId)
    });

    if (exists) return res.status(400).json({ message: "Already applied for this job" });

    const application = {
      jobId: new ObjectId(jobId),
      userId: new ObjectId(userId),
      userName,
      experience,
      currentRole: currentRole || "",
      education,
      skills,
      reason,
      resume: req.file ? req.file.filename : null,
      status: "pending",
      appliedAt: new Date()
    };

    const result = await database.collection("applications").insertOne(application);
    res.status(201).json({ message: "Application submitted successfully ✅", applicationId: result.insertedId });

  } catch (err) {
    console.error("Apply Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// Get My Applications
// --------------------
router.get("/my-applications/:userId", verifyToken, async (req, res) => {
  try {
    const database = await getDB();
    const userId = req.params.userId;

    const userApps = await database.collection("applications").aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: "posts",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      { $unwind: { path: "$jobDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userName: 1,
          experience: 1,
          currentRole: 1,
          education: 1,
          skills: 1,
          reason: 1,
          resume: 1,
          status: 1,
          appliedAt: 1,
          jobTitle: "$jobDetails.title",
          company: "$jobDetails.company",
          location: "$jobDetails.location"
        }
      }
    ]).toArray();

    res.status(200).json(userApps);

  } catch (err) {
    console.error("Fetch User Apps Error:", err);
    res.status(500).json({ message: "Could not retrieve applications." });
  }
});

// --------------------
// Update Application Status (Accept/Reject)
// --------------------
router.patch("/status/:id", verifyToken, async (req, res) => {
  try {
    const database = await getDB();
    const { status } = req.body; // expected: "accepted" or "rejected"

    const updated = await database.collection("applications").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (updated.matchedCount === 0)
      return res.status(404).json({ message: "Application not found" });

    res.json({ message: `Application ${status} ✅` });

  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;