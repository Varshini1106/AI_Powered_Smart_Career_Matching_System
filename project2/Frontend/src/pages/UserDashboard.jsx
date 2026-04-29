// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./UserDashboard.css";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

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
      if (!postsRes.ok) {
        throw new Error("Failed to fetch post count");
      }
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

  async function loadSuggestions() {
    setSuggestionsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const profileRes = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
      const profile = await profileRes.json();
      const userSkills = (profile.skills || []).map(s => s.toLowerCase().trim());

      if (userSkills.length === 0) {
        setSuggestions([]);
        setSuggestionsLoading(false);
        return;
      }

      const jobsRes = await fetch("http://localhost:5000/api/posts");
      const jobs = await jobsRes.json();

      const matched = jobs
  .map(job => {
    const jobSkills = Array.isArray(job.skills)
      ? job.skills.map(s => s.toLowerCase().trim())
      : (job.skills || "")
          .split(",")
          .map(s => s.toLowerCase().trim())
          .filter(Boolean);

    const matchedSkills = jobSkills.filter(skill =>
      userSkills.some(us => us.includes(skill) || skill.includes(us))
    );

    const missingSkills = jobSkills.filter(
      skill => !matchedSkills.includes(skill)
    );

    const matchPercent = jobSkills.length
      ? Math.round((matchedSkills.length / jobSkills.length) * 100)
      : 0;

    return {
      ...job,
      jobSkills, // IMPORTANT (debug + safety)
      matchPercent,
      matchedSkills,
      missingSkills
    };
  })
  .sort((a, b) => b.matchPercent - a.matchPercent);

      setSuggestions(matched);
    } catch (err) {
      console.error("Error loading suggestions:", err);
    }
    setSuggestionsLoading(false);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "suggestions" && suggestions.length === 0) {
      loadSuggestions();
    }
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  const getMatchColor = (percent) => {
    if (percent >= 70) return "high-match";
    if (percent >= 40) return "medium-match";
    return "low-match";
  };

  const getMatchText = (percent) => {
    if (percent >= 70) return "Excellent Match";
    if (percent >= 40) return "Good Match";
    return "Potential Match";
  };

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
            <a className={activeTab === "dashboard" ? "active" : ""} onClick={() => handleTabChange("dashboard")} style={{ cursor: "pointer" }}>
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
            <a className={activeTab === "suggestions" ? "active" : ""} onClick={() => handleTabChange("suggestions")} style={{ cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Suggestions</span>
            </a>
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

        {/* ===================== DASHBOARD TAB ===================== */}
        {activeTab === "dashboard" && (
          <>
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
          </>
        )}

        {/* ===================== SUGGESTIONS TAB - NAVY BLUE THEME ===================== */}
        {activeTab === "suggestions" && (
          <div className="suggestions-container">
            <div className="suggestions-header">
              <div>
                <h1>✨ Job Suggestions</h1>
                <p>Jobs matched to your skills from your profile</p>
              </div>
              <button className="refresh-suggestions-btn" onClick={loadSuggestions}>
                🔄 Refresh Suggestions
              </button>
            </div>

            {suggestionsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Finding jobs that match your skills...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="empty-suggestions">
                <div className="empty-suggestions-content">
                  <span className="empty-icon">🔍</span>
                  <h3>No Suggestions Yet</h3>
                  <p>Add skills to your profile to get personalized job suggestions.</p>
                  <Link to="/profile" className="add-skills-btn">
                    ✏️ Add Skills to Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="suggestions-grid">
                {suggestions.map(job => (
                  <div key={job._id} className="suggestion-card">
                    <div className={`match-badge ${getMatchColor(job.matchPercent)}`}>
                      <span className="match-percent">{job.matchPercent}%</span>
                      <span className="match-label">{getMatchText(job.matchPercent)}</span>
                    </div>

                    <div className="suggestion-header">
                      <div className="job-icon">💼</div>
                      <div className="job-info-suggestion">
                        <h3>{job.title}</h3>
                        <p className="company-suggestion">
                          🏢 {job.company || "Company"} &nbsp;|&nbsp; 📍 {job.location || "Remote"} &nbsp;|&nbsp; 📅 {job.type || "Full-time"}
                        </p>
                      </div>
                    </div>

                    <p className="suggestion-description">
                      {job.description ? job.description.slice(0, 120) + "..." : "No description available"}
                    </p>

                    {job.skills && (
                      <div className="suggestion-skills">
                        <span className="skills-label">Required Skills:</span>
                        <div className="skills-list-suggestion">
                          {(Array.isArray(job.skills) ? job.skills : job.skills.split(","))
                            .slice(0, 5)
                            .map((skill, idx) => (
                              <span key={idx} className="suggestion-skill">
                                {skill.trim()}
                              </span>
                            ))}
                          {(Array.isArray(job.skills) ? job.skills : job.skills.split(",")).length > 5 && (
                            <span className="more-skills">+{(Array.isArray(job.skills) ? job.skills : job.skills.split(",")).length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="match-details">
                      {job.matchedSkills && job.matchedSkills.length > 0 && (
                        <div className="matched-skills">
                          <span className="match-icon">✅</span>
                          <span className="match-text">You have: <strong>{job.matchedSkills.slice(0, 3).join(", ")}</strong></span>
                          {job.matchedSkills.length > 3 && <span className="more-count"> +{job.matchedSkills.length - 3} more</span>}
                        </div>
                      )}
                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <div className="missing-skills">
                          <span className="match-icon">⚠️</span>
                          <span className="match-text">Missing: <strong>{job.missingSkills.slice(0, 3).join(", ")}</strong></span>
                          {job.missingSkills.length > 3 && <span className="more-count"> +{job.missingSkills.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserDashboard;
