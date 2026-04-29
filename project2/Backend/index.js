require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads/resumes", express.static(path.join(__dirname, "uploads/resumes")));

// ROUTES
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applications');
const postRoutes = require('./routes/postRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminStatsRoutes = require('./routes/adminStats');

// ROUTE CONNECTIONS
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminStatsRoutes);

// TEST ROUTE
app.get("/test", (req,res)=>{
  res.send("Backend working");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});