const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();

// MongoDB setup
const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);
let db;

// Helper: reuse DB connection
async function getDb() {
    if (!db) {
        await client.connect();
        db = client.db("CareerMatcherDB");
    }
    return db;
}

// ===== ROUTES =====

// 1. GET the total post count (for admin dashboard box)
router.get("/count", async (req, res) => {
    try {
        const database = await getDb();
        const count = await database.collection("posts").countDocuments();
        res.json({ count });
    } catch (err) {
        console.error("Count Error:", err);
        res.status(500).json({ error: "Failed to count posts" });
    }
});

// 2. GET all posts (for users)
router.get("/", async (req, res) => {
    try {
        const database = await getDb();
        const posts = await database.collection("posts")
            .find()
            .sort({ createdAt: -1 })
            .toArray();
        res.json(posts);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});

// 3. GET single post by ID
router.get("/:id", async (req, res) => {
    try {
        const database = await getDb();
        const post = await database.collection("posts").findOne({ _id: new ObjectId(req.params.id) });
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json(post);
    } catch (err) {
        console.error("Get Post Error:", err);
        res.status(500).json({ error: "Failed to fetch post" });
    }
});

// 4. CREATE a new post (Admin)
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
            skillsRequired: Array.isArray(skillsRequired) 
                ? skillsRequired 
                : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []),
            createdAt: new Date()
        };

        const result = await database.collection("posts").insertOne(newPost);
        res.json({ message: "Job posted successfully ✅", postId: result.insertedId });
    } catch (err) {
        console.error("Post Error:", err);
        res.status(500).json({ error: "Failed to create post" });
    }
});

// 5. UPDATE post by ID (Admin)
router.put("/:id", async (req, res) => {
    try {
        const database = await getDb();
        const { title, company, description, location, salary, skillsRequired } = req.body;

        const updatedPost = {
            title,
            company,
            description,
            location,
            salary,
            skillsRequired: Array.isArray(skillsRequired) 
                ? skillsRequired 
                : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []),
        };

        const result = await database.collection("posts").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updatedPost }
        );

        if (result.matchedCount === 0) return res.status(404).json({ error: "Post not found" });

        res.json({ message: "Post updated successfully ✅" });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: "Failed to update post" });
    }
});

module.exports = router;