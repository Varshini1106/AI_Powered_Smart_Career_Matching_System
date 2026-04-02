const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection
const uri = "mongodb://127.0.0.1:27017"; // or your Atlas URI
const client = new MongoClient(uri);
const dbName = "CareerMatcherDB"; // Explicit database name

// Helper function to get DB instance
async function getDB() {
    if (!client.isConnected()) await client.connect();
    return client.db(dbName);
}

// =======================
// ADD NEW POST
// =======================
async function addPost(req, res) {
    try {
        const db = await getDB();
        const { title, description, skillsRequired, createdBy, endDate } = req.body;

        const post = {
            title,
            description,
            skillsRequired,
            createdBy,
            createdAt: new Date(),
            endDate: new Date(endDate),
            updatedAt: new Date(),
            status: "open" // default status
        };

        const result = await db.collection("posts").insertOne(post);
        res.json({ message: "Post added successfully ✅", postId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// =======================
// GET ALL POSTS
// =======================
async function getAllPosts(req, res) {
    try {
        const db = await getDB();
        const posts = await db.collection("posts").find().toArray();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// =======================
// GET SINGLE POST BY ID
// =======================
async function getPostById(req, res) {
    try {
        const db = await getDB();
        const post = await db.collection("posts").findOne({ _id: ObjectId(req.params.id) });

        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// =======================
// UPDATE POST
// =======================
async function updatePost(req, res) {
    try {
        const db = await getDB();
        const { title, description, skillsRequired, endDate, status } = req.body;

        const updated = await db.collection("posts").updateOne(
            { _id: ObjectId(req.params.id) },
            { 
                $set: { 
                    title,
                    description,
                    skillsRequired,
                    endDate: new Date(endDate),
                    status,
                    updatedAt: new Date()
                } 
            }
        );

        if (updated.matchedCount === 0) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post updated successfully ✅" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addPost, getAllPosts, getPostById, updatePost };