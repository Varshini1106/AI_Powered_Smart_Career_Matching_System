const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection
const uri = "mongodb://127.0.0.1:27017"; // Local MongoDB URI
const client = new MongoClient(uri);
const dbName = "CareerMatcherDB"; // Explicit database name

// Helper function to get DB instance
async function getDB() {
    if (!client.isConnected()) await client.connect();
    return client.db(dbName);
}

// =======================
// GET ALL APPLICATIONS
// Optional filter by postId
// =======================
async function getApplications(req, res) {
    try {
        const db = await getDB();
        const filter = req.query.postId ? { postId: req.query.postId } : {};
        const applications = await db.collection("applications").find(filter).toArray();
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// =======================
// UPDATE APPLICATION STATUS
// Accept or reject an application
// =======================
async function updateApplicationStatus(req, res) {
    try {
        const db = await getDB();
        const { status } = req.body; // expected: "accepted" or "rejected"

        const updated = await db.collection("applications").updateOne(
            { _id: ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date() } } // track update time
        );

        if (updated.matchedCount === 0)
            return res.status(404).json({ message: "Application not found" });

        res.json({ message: `Application ${status} ✅` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getApplications, updateApplicationStatus };