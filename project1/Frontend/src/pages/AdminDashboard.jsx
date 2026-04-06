// src/pages/AdminDashboard.jsx

import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminProfile from "../components/AdminProfile";
import PostJob from "../components/PostJobs";
import ManageJobs from "../components/ManageJobs";

function AdminDashboard() {

  const [section, setSection] = useState("dashboard");

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
                <div className="stat-value">24</div>
                <div className="stat-label">Total Jobs Posted</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">156</div>
                <div className="stat-label">Active Applications</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">2847</div>
                <div className="stat-label">Views This Month</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">68%</div>
                <div className="stat-label">Hiring Rate</div>
              </div>

            </div>

            <div className="recent-section">

              <h3>Recent Activity</h3>

              <div className="activity-item">
                <div className="activity-title">
                  New job posted: Senior React Developer
                </div>
                <div className="activity-time">
                  2 hours ago
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-title">
                  12 new applications received
                </div>
                <div className="activity-time">
                  Yesterday
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-title">
                  Profile viewed by 45 candidates
                </div>
                <div className="activity-time">
                  2 days ago
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