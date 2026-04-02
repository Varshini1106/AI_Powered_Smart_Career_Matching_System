// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient } = require("mongodb");

// Import route files
const authRoutes = require("./routes/authRoutes");
const postsRoutes = require("./routes/posts");
const applicationsRoutes = require("./routes/applications");
const adminRoutes = require("./routes/admin-profile"); // ✅ Admin route

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/admin", adminRoutes); // ✅ Use admin route

// MongoDB connection
//const uri = "mongodb://127.0.0.1:27017";
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB Connected ✅");
    } catch (error) {
        console.error("MongoDB Connection Error ❌:", error);
    }
}

connectDB();

// Test route
app.get("/", (req, res) => {
    res.send("Backend running successfully 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});