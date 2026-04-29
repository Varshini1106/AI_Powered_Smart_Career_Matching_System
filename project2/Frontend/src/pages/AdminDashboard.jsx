// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminProfile from "../components/AdminProfile";
import PostJob from "../components/PostJobs";
import ManageJobs from "../components/ManageJobs";
import "./AdminDashboard.css";

function AdminDashboard() {

  const [section, setSection] = useState("dashboard");

  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    activeJobs: 0
  });

  const [aiInsights, setAiInsights] = useState({
    topSkills: [],
    suggestion: ""
  });

  // Fetch dashboard stats from backend
  useEffect(() => {
    fetchStats();
    fetchAIInsights();
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

  const fetchAIInsights = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/posts");
      const jobs = await res.json();

      let skills = [];

      jobs.forEach(job => {
        if (Array.isArray(job.skills)) {
          skills.push(...job.skills);
        } else if (job.skills) {
          skills.push(...job.skills.split(","));
        }
      });

      const skillCount = {};

      skills.forEach(skill => {
        const s = skill.trim().toLowerCase();
        skillCount[s] = (skillCount[s] || 0) + 1;
      });

      const sortedSkills = Object.entries(skillCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(s => s[0]);

      setAiInsights({
        topSkills: sortedSkills,
        suggestion: sortedSkills.includes("react")
          ? "🎯 Frontend roles are highly demanded. Consider posting more backend roles to balance your hiring."
          : "📈 Backend and data roles appear to be trending. Focus on hiring for these skill sets."
      });

    } catch (err) {
      console.error("AI insight error", err);
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
              <h1>Dashboard Overview</h1>
              <p>Welcome back! Here's what's happening with your jobs today.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                  <span className="stat-icon">📊</span>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalJobs}</div>
                  <div className="stat-label">Total Jobs Posted</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper green">
                  <span className="stat-icon">📝</span>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalApplications}</div>
                  <div className="stat-label">Active Applications</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper purple">
                  <span className="stat-icon">👥</span>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper orange">
                  <span className="stat-icon">✅</span>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.activeJobs}</div>
                  <div className="stat-label">Active Jobs</div>
                </div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="ai-insights-card">
              <div className="ai-header">
                <div className="ai-icon">🤖</div>
                <div>
                  <h3>AI Hiring Insights</h3>
                  <p>Data-driven recommendations to improve your hiring strategy</p>
                </div>
              </div>
              
              <div className="ai-top-skills">
                <h4>📊 Top Skills in Job Market</h4>
                <div className="skills-chips">
                  {aiInsights.topSkills.length > 0 ? (
                    aiInsights.topSkills.map((skill, i) => (
                      <span key={i} className="ai-skill-chip">{skill}</span>
                    ))
                  ) : (
                    <span className="no-data">Loading skills data...</span>
                  )}
                </div>
              </div>

              <div className="ai-suggestion">
                <h4>💡 Recommendation</h4>
                <p>{aiInsights.suggestion}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-section">
              <h3>
                <span className="section-icon">🕒</span>
                Recent Activity
              </h3>

              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-dot blue-dot"></div>
                  <div className="activity-content">
                    <div className="activity-title">
                      Dashboard data is now connected to live database
                    </div>
                    <div className="activity-time">Just now</div>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-dot green-dot"></div>
                  <div className="activity-content">
                    <div className="activity-title">
                      Job postings and applications update automatically
                    </div>
                    <div className="activity-time">Real-time</div>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-dot purple-dot"></div>
                  <div className="activity-content">
                    <div className="activity-title">
                      Users and jobs statistics pulled from MongoDB
                    </div>
                    <div className="activity-time">Live data</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard">
      <AdminSidebar setSection={setSection} activeSection={section} />
      <div className="main-content">
        {renderSection()}
      </div>
    </div>
  );
}

export default AdminDashboard;