const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// --- Signup & Login ---
router.post("/signup", registerUser);
router.post("/login", loginUser);

// --- GET PROFILE ---
router.get("/profile/:id", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("CareerMatcherDB");
    const userId = req.params.id;

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only send necessary fields
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills || [],
      bio: user.bio || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- UPDATE PROFILE ---
router.put("/profile/update", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("CareerMatcherDB");
    const { userId, skills, bio } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const updateData = {
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
      bio: bio || "",
    };

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "User not found or no changes made" });
    }

    res.json({ message: "Profile updated successfully ✅", updatedProfile: updateData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;