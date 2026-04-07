const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);

let db;

// Connection helper to reuse the database connection
async function getDb() {
    if (!db) {
        await client.connect();
        db = client.db("CareerMatcherDB");
    }
    return db;
}

// 1. GET THE REAL POST COUNT (For your Dashboard Box)
// Important: Place this ABOVE the "GET /:id" routes if you add them later
router.get("/count", async (req, res) => {
    try {
        const database = await getDb();
        // This dynamically counts documents in your 'posts' collection
        const count = await database.collection("posts").countDocuments();
        res.json({ count });
    } catch (err) {
        console.error("Count Error:", err);
        res.status(500).json({ error: "Failed to count posts" });
    }
});

// 2. GET ALL AVAILABLE JOBS
router.get("/", async (req, res) => {
    try {
        const database = await getDb();
        // Sorts by newest first
        const posts = await database.collection("posts")
            .find()
            .sort({ createdAt: -1 }) 
            .toArray();
        res.json(posts);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch jobs from Atlas" });
    }
});

// 3. CREATE A NEW JOB POST (Admin Action)
router.post("/", async (req, res) => {
    try {
        const database = await getDb();
        const { title, company, description, location, salary, skillsRequired } = req.body;

        const newPost = {
            title,
            company,
            description,
            location,
            salary,
            // Standardize skills as an array
            skillsRequired: Array.isArray(skillsRequired) 
                ? skillsRequired 
                : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []),
            createdAt: new Date()
        };

        const result = await database.collection("posts").insertOne(newPost);
        res.json({ 
            message: "Job posted to Atlas successfully ✅", 
            postId: result.insertedId 
        });
    } catch (err) {
        console.error("Post Error:", err);
        res.status(500).json({ error: "Failed to create post in Atlas" });
    }
});

module.exports = router;