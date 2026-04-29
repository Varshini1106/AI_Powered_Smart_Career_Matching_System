// routes/admin.js
const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
let usersCollection;

// Initialize MongoDB connection once
async function initDB() {
    try {
        await client.connect();
        const db = client.db('CareerMatcherDB');
        usersCollection = db.collection('users');
        console.log("Admin routes connected to DB ✅");
    } catch (err) {
        console.error("Failed to connect admin routes to DB ❌", err);
    }
}
initDB();

// GET admin profile
router.get('/profile', async (req, res) => {
    try {
        if (!usersCollection) {
            return res.status(500).json({ message: "Database not initialized" });
        }

        const admin = await usersCollection.findOne({ role: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json(admin);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;