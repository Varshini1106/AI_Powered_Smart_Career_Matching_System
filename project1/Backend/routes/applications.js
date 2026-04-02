const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

// Submit application
router.post("/", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("CareerMatcherDB");

    const result = await db.collection("applications").insertOne(req.body);

    res.json({
      message: "Application submitted successfully ✅",
      applicationId: result.insertedId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all applications
router.get("/", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("CareerMatcherDB");

    const applications = await db.collection("applications").find().toArray();

    res.json(applications);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update application status (Accept / Reject)
router.put("/:id", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("CareerMatcherDB");

    const { status } = req.body;

    const result = await db.collection("applications").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: status } }
    );

    res.json({
      message: "Application status updated ✅"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;