import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

// Admin Components
import PostJob from "./components/PostJobs";
import ManageJobs from "./components/ManageJobs";

// User Components
import BrowseJobs from "./pages/BrowseJobs";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />

        {/* Admin Routes */}
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/manage-jobs" element={<ManageJobs />} />

        {/* User Routes */}
        <Route path="/browse-jobs" element={<BrowseJobs />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;