// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminProfile from "../components/AdminProfile";
import PostJob from "../components/PostJobs";
import ManageJobs from "../components/ManageJobs";

function AdminDashboard() {

  const [section, setSection] = useState("dashboard");

  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    activeJobs: 0
  });

  // Fetch dashboard stats from backend
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  const renderSection = () => {

    switch (section) {

      case "profile":
        return <AdminProfile />;

      case "postjob":
        return <PostJob />;

      case "managejobs":
        return <ManageJobs setSection={setSection} />;

      default:
        return (
          <>
            <div className="page-header">
              <h1>📊 Dashboard Overview</h1>
              <p>Welcome back! Here's what's happening with your jobs today.</p>
            </div>

            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-value">{stats.totalJobs}</div>
                <div className="stat-label">Total Jobs Posted</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">{stats.totalApplications}</div>
                <div className="stat-label">Active Applications</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">{stats.activeJobs}</div>
                <div className="stat-label">Active Jobs</div>
              </div>

            </div>

            <div className="recent-section">

              <h3>Recent Activity</h3>

              <div className="activity-item">
                <div className="activity-title">
                  Dashboard data is now connected to live database
                </div>
                <div className="activity-time">
                  Just now
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-title">
                  Job postings and applications update automatically
                </div>
                <div className="activity-time">
                  Real-time
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-title">
                  Users and jobs statistics pulled from MongoDB
                </div>
                <div className="activity-time">
                  Live data
                </div>
              </div>

            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard">

      <AdminSidebar
        setSection={setSection}
        activeSection={section}
      />

      <div className="main-content">
        {renderSection()}
      </div>

    </div>
  );
}

export default AdminDashboard;