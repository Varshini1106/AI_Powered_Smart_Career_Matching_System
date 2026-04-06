require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());



// Routes
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applications');
const postRoutes = require("./routes/postRoutes");
const jobRoutes = require("./routes/jobRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/applications', applicationRoutes);
app.use("/api/jobs", jobRoutes);
app.use(express.json());



// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));