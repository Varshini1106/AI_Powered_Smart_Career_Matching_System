const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const verifyToken = require("../middleware/authMiddleware");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Better Performance: Connect once and reuse the DB object
let db;
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("CareerMatcherDB");
    console.log("Connected to MongoDB: CareerMatcherDB");
  }
  return db;
}

// 1. SUBMIT APPLICATION (User Action)
router.post("/", async (req, res) => {
  try {
    const database = await connectDB();
    const { postId, userId, status, ...otherData } = req.body;

    const applicationEntry = {
      ...otherData,
      postId: new ObjectId(postId),
      userId: new ObjectId(userId),
      status: status || "pending",
      appliedAt: new Date()
    };

    const result = await database.collection("applications").insertOne(applicationEntry);
    res.json({
      message: "Application submitted successfully ✅",
      applicationId: result.insertedId
    });
  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ error: "Check if IDs are valid 24-character hex strings" });
  }
});

// 2. GET ALL APPLICATIONS (Admin View)
router.get("/", async (req, res) => {
  try {
    const database = await connectDB();
    const applications = await database.collection("applications").find().toArray();
    res.json(applications);
  } catch (error) {
    console.error("Fetch All Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. GET MY APPLICATIONS (User Dashboard View)
// CRITICAL: This pulls the "title" from the "posts" collection so you aren't confused!
router.get("/my-applications/:userId", async (req, res) => {
  try {
    const database = await connectDB();
    const userId = req.params.userId;

    const userApps = await database.collection("applications").aggregate([
      {
        $match: { userId: new ObjectId(userId) }
      },
      {
        $lookup: {
          from: "posts",           // Joins with the posts collection
          localField: "postId",    // Field in 'applications'
          foreignField: "_id",     // Field in 'posts'
          as: "jobDetails"
        }
      },
      {
        $unwind: { path: "$jobDetails", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          status: 1,
          education: 1,
          skills: 1,
          experience: 1,
          currentRole: 1,
          reason: 1,
          appliedAt: 1,
          jobTitle: "$jobDetails.title" // This is what shows "Full Stack Developer" etc.
        }
      }
    ]).toArray();

    res.status(200).json(userApps);
  } catch (error) {
    console.error("Fetch User Apps Error:", error);
    res.status(500).json({ error: "Could not retrieve applications." });
  }
});

// 4. UPDATE STATUS (Admin Action)
router.put("/:id", async (req, res) => {
  try {
    const database = await connectDB();
    const { status } = req.body;

    const result = await database.collection("applications").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Application not found in Atlas" });
    }

    res.json({ message: "Status updated to " + status + " ✅" });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. EDIT/UPDATE APPLICATION (User Action)
router.put("/update/:id", async (req, res) => {
  try {
    const database = await connectDB();
    const appId = req.params.id;

    const {
      userName,
      experience,
      currentRole,
      education,
      skills,
      reason
    } = req.body;

    const result = await database.collection("applications").updateOne(
      { _id: new ObjectId(appId) },
      {
        $set: {
          userName,
          experience,
          currentRole,
          education,
          skills,
          reason,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application details updated successfully ✅" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update application. Ensure ID is valid." });
  }
});

// 6. DELETE APPLICATION (User Action)
router.delete("/delete/:id", async (req, res) => {
  try {
    const database = await connectDB();
    const appId = req.params.id;

    const result = await database.collection("applications").deleteOne({
      _id: new ObjectId(appId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Application not found or already deleted" });
    }

    res.json({ message: "Application deleted successfully 🗑️" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete application. Ensure ID is valid." });
  }
});

module.exports = router;