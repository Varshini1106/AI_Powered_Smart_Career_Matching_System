// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./UserDashboard.css";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      window.location.href = "/";
      return;
    }
    setUser(storedUser);
    loadMyApplications();
    updateDashboardStats();
  }, []);

  async function updateDashboardStats() {
    try {
      const postsRes = await fetch("http://localhost:5000/api/posts/count");
      const postsData = await postsRes.json();
      setPostCount(postsData.count || 0);
    } catch (err) {
      console.error("Error updating stats:", err);
    }
  }

  async function loadMyApplications() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/applications/my-applications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const apps = await response.json();
      setApplications(apps);
    } catch (err) {
      console.error("Error loading applications:", err);
    }
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <div className="user-dashboard">
      {/* Sidebar */}
      <nav className="user-sidebar">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Career<span>Matcher</span></span>
        </div>

        <ul className="nav-links">
          <li>
            <a className="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 10.5V17.5L12 21.5L19 17.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="/browse-jobs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Browse Jobs</span>
            </a>
          </li>
          <li>
            <Link to="/my-applications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M16 21V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V21" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Applied Jobs</span>
            </Link>
          </li>
          <li>
            <Link to="/profile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>My Profile</span>
            </Link>
          </li>
          <li className="logout-li">
            <a onClick={logout} className="logout-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="user-main">
        <header>
          <div>
            <h1>Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
            <p>Monitor your job search progress in real-time.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">
              {user?.name?.charAt(0)}
            </div>
            <span>{user?.name}</span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M16 21V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V21" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{applications.length}</h3>
              <p>Total Applied</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{postCount}</h3>
              <p>Active Posts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>85%</h3>
              <p>Profile Score</p>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="applications-section">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16 21V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V21" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Application Tracking
          </h2>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Job Position</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-state-cell">
                      <div className="table-empty-state">
                        <span>📭</span>
                        <p>No applications found</p>
                        <small>Start applying to jobs to see them here</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app, index) => (
                    <tr key={index}>
                      <td className="job-title-cell">
                        <strong>{app.jobTitle || "Job Application"}</strong>
                      </td>
                      <td>
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span className={`status-badge status-${app.status || "pending"}`}>
                          {app.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;