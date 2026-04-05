const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

router.post("/signup", registerUser);
router.post("/login", loginUser);

// THE SAVE ROUTE (This makes the 'Save' button work for Atlas)
router.put("/profile/update", async (req, res) => {
    try {
        await client.connect();
        const db = client.db("CareerMatcherDB");
        const { userId, name, email, skills, bio } = req.body;

        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { 
                $set: { 
                    name: name, 
                    email: email, 
                    skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()), 
                    bio: bio 
                } 
            }
        );

        res.json({ message: "Profile updated in Atlas! ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update Atlas" });
    }
});

module.exports = router;