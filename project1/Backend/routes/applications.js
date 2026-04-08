const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const verifyToken = require("../middleware/authMiddleware"); 
const multer = require("multer");
const path = require("path");
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
// Multer setup for resume uploads
// -----------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // make sure this folder exists
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + Date.now() + ext);
    }
});
const upload = multer({ storage });

// -----------------------
// Apply to a Job (with resume upload)
// -----------------------
router.post("/apply", verifyToken, upload.single("resume"), async (req, res) => {
    try {
        const database = await getDB();
        const userId = req.user.id; // from JWT middleware

        const { postId, userName, experience, currentRole, education, skills, reason } = req.body;
        const resumeFile = req.file ? req.file.filename : null;

        if (!postId) return res.status(400).json({ message: "Job ID is required" });

        // Check if already applied
        const exists = await database.collection("applications").findOne({
            jobId: new ObjectId(postId),
            userId: new ObjectId(userId)
        });

        if (exists) return res.status(400).json({ message: "Already applied for this job" });

        const application = {
            jobId: new ObjectId(postId),
            userId: new ObjectId(userId),
            userName,
            experience,
            currentRole,
            education,
            skills,
            reason,
            resume: resumeFile, // store filename in DB
            status: "pending",
            appliedAt: new Date()
        };

        const result = await database.collection("applications").insertOne(application);
        res.status(201).json({ message: "Applied successfully ✅", applicationId: result.insertedId });
    } catch (err) {
        console.error("Apply Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// -----------------------
// Get My Applications
// -----------------------
router.get("/my-applications/:userId", async (req, res) => {
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
                    status: 1,
                    appliedAt: 1,
                    userName: 1,
                    experience: 1,
                    currentRole: 1,
                    education: 1,
                    skills: 1,
                    reason: 1,
                    resume: 1,
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
// -----------------------
// Update Application
// -----------------------
router.put("/update/:id", async (req, res) => {
    try {
        const database = await getDB();
        const appId = req.params.id;
        const updateData = { ...req.body };

        // Prevent updating _id, userId, jobId, appliedAt directly
        delete updateData._id;
        delete updateData.userId;
        delete updateData.jobId;
        delete updateData.appliedAt;

        const result = await database
            .collection("applications")
            .updateOne(
                { _id: new ObjectId(appId) },
                { $set: updateData }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({ message: "Application updated successfully!" });
    } catch (err) {
        console.error("Update Application Error:", err);
        res.status(500).json({ message: "Failed to update application" });
    }
});
// -----------------------
// Delete Application
// -----------------------
router.delete("/delete/:id", async (req, res) => {
    try {
        const database = await getDB();
        const appId = req.params.id;

        const result = await database.collection("applications").deleteOne({ _id: new ObjectId(appId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({ message: "Application deleted successfully!" });
    } catch (err) {
        console.error("Delete Application Error:", err);
        res.status(500).json({ message: "Failed to delete application" });
    }
});

module.exports = router;