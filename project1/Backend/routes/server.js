require("dotenv").config(); // Loads your MONGO_URI from .env
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json()); // Essential for reading the 'body' of your POST/PUT requests

// Routes - Ensure these files exist in your './routes/' folder
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/posts');
const applicationRoutes = require('./routes/applications');

// Endpoint Definitions
app.use('/api/auth', authRoutes);           // For Login, Signup, and Profile Updates
app.use('/api/posts', postRoutes);          // For Browsing and Creating Job Posts
app.use('/api/applications', applicationRoutes); // For Submitting and Viewing Job Applications

// Start server
// Uses the PORT from .env if available, otherwise defaults to 5000
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
    console.log(`🚀 Server is officially running on port ${PORT}`);
    console.log(`📂 Connected to Database: CareerMatcherDB`); // Matches your Atlas screenshot
});