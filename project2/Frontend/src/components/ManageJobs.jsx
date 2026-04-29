import React, { useState, useEffect } from "react";
import "./ManageJobs.css";

function ManageJobs({ setSection }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [showApplications, setShowApplications] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editJob, setEditJob] = useState(null);

  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [scanningResume, setScanningResume] = useState(null);
  const [scanResults, setScanResults] = useState({});

  // ================= FETCH JOBS =================
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/posts");
      const data = await res.json();

      const formattedJobs = data.map((job) => ({
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.jobType || job.type || "Full-time",
        skills: Array.isArray(job.skills)
          ? job.skills
          : job.skills
          ? job.skills.split(",")
          : [],
        status: job.status || "Active",
        applications: job.applicationsCount || 0,
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ================= SEARCH =================
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= DELETE JOB =================
  const handleDelete = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/posts/${jobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      alert("Job deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  // ================= EDIT JOB =================
  const handleEdit = (id) => {
    const job = jobs.find((j) => j.id === id);
    setEditJob({
      ...job,
      skills: job.skills || [],
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await fetch(`http://localhost:5000/api/posts/${editJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editJob),
      });
      setShowEditModal(false);
      fetchJobs();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // ================= VIEW APPLICATIONS =================
  const handleViewApplications = async (jobId, jobTitle) => {
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob({
      id: jobId,
      title: jobTitle,
      skills: job?.skills || []
    });
    setShowApplications(true);
    try {
      const res = await fetch(`http://localhost:5000/api/applications/job/${jobId}`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setApplications([]);
    }
  };

  // ================= UPDATE STATUS =================
  const handleUpdateStatus = async (appId, status) => {
    setUpdatingStatus(appId);
    try {
      await fetch(`http://localhost:5000/api/applications/update/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setApplications(
        applications.map((app) =>
          app._id === appId ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
    setUpdatingStatus(null);
  };

  // ================= AI SCAN =================
  const handleScanResume = async (app) => {
    setScanningResume(app._id);

    try {
      const jobSkills = selectedJob?.skills || [];
      const resumeText = ((app.resume || "") + " " + (app.skills || "")).toLowerCase();

      const matchedSkills = jobSkills.filter((skill) =>
        resumeText.includes(skill.toLowerCase())
      );

      const missingSkills = jobSkills.filter(
        (skill) => !resumeText.includes(skill.toLowerCase())
      );

      const score = Math.round((matchedSkills.length / (jobSkills.length || 1)) * 100);

      let verdict = "Average candidate";
      let verdictColor = "average";

      if (score >= 80) {
        verdict = "Excellent match";
        verdictColor = "excellent";
      } else if (score >= 60) {
        verdict = "Good candidate";
        verdictColor = "good";
      } else if (score >= 40) {
        verdict = "Moderate match";
        verdictColor = "moderate";
      } else {
        verdict = "Low match";
        verdictColor = "low";
      }

      const result = {
        rating: score,
        strengths: matchedSkills,
        improvements: missingSkills,
        verdict,
        verdictColor,
      };

      setScanResults((prev) => ({
        ...prev,
        [app._id]: result,
      }));
    } catch (err) {
      console.error("Resume scan error:", err);
      setScanResults((prev) => ({
        ...prev,
        [app._id]: { error: "Failed to scan resume." },
      }));
    }

    setScanningResume(null);
  };

  const getStatusColor = (status) => {
    if (status === "accepted") return "accepted";
    if (status === "declined") return "declined";
    return "pending";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="manage-jobs-container">
      <div className="page-header">
        <h1>📋 Manage Jobs</h1>
        <p>View, edit, and manage all your job postings</p>
      </div>

      <div className="search-section">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : (
        <div className="jobs-table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job Title & Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Skills</th>
                <th>Applications</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="job-title-cell">
                      <strong>{job.title}</strong>
                      <span className="company-name">{job.company}</span>
                    </div>
                  </td>
                  <td>{job.location}</td>
                  <td><span className="job-type">{job.type}</span></td>
                  <td>
                    <div className="skills-preview-expanded">
                      {job.skills.length > 0 ? (
                        job.skills.map((skill, i) => (
                          <span key={i} className="skill-tag">
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="no-skills">No skills listed</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="applications-count"
                      onClick={() => handleViewApplications(job.id, job.title)}
                    >
                      📧 {job.applications}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(job.id)}>
                        ✏️
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(job.id)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPLICATIONS MODAL */}
      {showApplications && (
        <div className="modal-overlay" onClick={() => setShowApplications(false)}>
          <div className="applications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Applications for {selectedJob?.title}</h2>
              <button className="modal-close" onClick={() => setShowApplications(false)}>×</button>
            </div>
            <div className="modal-body">
              {applications.length === 0 ? (
                <div className="no-applications">
                  <span>📭</span>
                  <p>No applications received yet</p>
                  <small>Applications will appear here when candidates apply</small>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map((app) => (
                    <div key={app._id} className="application-card-modal">
                      <div className="app-header">
                        <div className="app-avatar">
                          <span>{app.userName?.charAt(0) || "A"}</span>
                        </div>
                        <div className="app-info">
                          <h4>{app.userName}</h4>
                          <p>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recently"}</p>
                        </div>
                        <span className={`status-badge ${getStatusColor(app.status)}`}>
                          {app.status === "accepted" ? "✓ Accepted" : 
                           app.status === "declined" ? "✗ Declined" : 
                           "⏳ Pending"}
                        </span>
                      </div>

                      <div className="app-details">
                        <div className="detail-row">
                          <span className="detail-label">📧 Email:</span>
                          <span className="detail-value">{app.email || "Not provided"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">💼 Experience:</span>
                          <span className="detail-value">{app.experience || "Not specified"} years</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">🎯 Current Role:</span>
                          <span className="detail-value">{app.currentRole || "Not specified"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">🎓 Education:</span>
                          <span className="detail-value">{app.education || "Not specified"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">⚡ Skills:</span>
                          <span className="detail-value">
                            {Array.isArray(app.skills) 
                              ? app.skills.join(", ") 
                              : app.skills || "Not specified"}
                          </span>
                        </div>
                        <div className="detail-row full-width">
                          <span className="detail-label">💬 Statement:</span>
                          <span className="detail-value reason-text">{app.reason || "No reason provided"}</span>
                        </div>
                      </div>

                      <div className="app-actions">
                        {app.status !== "accepted" && app.status !== "declined" && (
                          <>
                            <button
                              className="accept-btn"
                              disabled={updatingStatus === app._id}
                              onClick={() => handleUpdateStatus(app._id, "accepted")}
                            >
                              {updatingStatus === app._id ? "..." : "✓ Accept"}
                            </button>
                            <button
                              className="decline-btn"
                              disabled={updatingStatus === app._id}
                              onClick={() => handleUpdateStatus(app._id, "declined")}
                            >
                              {updatingStatus === app._id ? "..." : "✗ Decline"}
                            </button>
                          </>
                        )}

                        <button
                          className="ai-scan-btn"
                          onClick={() => handleScanResume(app)}
                          disabled={scanningResume === app._id}
                        >
                          {scanningResume === app._id ? (
                            <>
                              <span className="scan-spinner"></span>
                              Scanning...
                            </>
                          ) : (
                            "🤖 AI Scan Resume"
                          )}
                        </button>
                      </div>

                      {/* AI Scan Results - Modern UI */}
                      {scanResults[app._id] && (
                        <div className="ai-scan-result">
                          {scanResults[app._id].error ? (
                            <div className="ai-scan-error">
                              <span>⚠️</span>
                              <p>{scanResults[app._id].error}</p>
                            </div>
                          ) : (
                            <div className="ai-scan-content">
                              <div className="ai-scan-header">
                                <div className="ai-score-circle">
                                  <svg className="ai-score-progress" viewBox="0 0 36 36">
                                    <path
                                      className="progress-bg"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none"
                                      stroke="#E2E8F0"
                                      strokeWidth="3"
                                    />
                                    <path
                                      className="progress-fill"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none"
                                      stroke={getScoreColor(scanResults[app._id].rating)}
                                      strokeWidth="3"
                                      strokeDasharray={`${scanResults[app._id].rating}, 100`}
                                      strokeLinecap="round"
                                    />
                                    <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill="#1A3A5F" fontWeight="bold">
                                      {scanResults[app._id].rating}%
                                    </text>
                                  </svg>
                                </div>
                                <div className="ai-verdict">
                                  <div className={`verdict-badge ${scanResults[app._id].verdictColor}`}>
                                    {scanResults[app._id].verdict}
                                  </div>
                                </div>
                              </div>

                              <div className="ai-scan-details">
                                <div className="ai-strengths">
                                  <div className="ai-label">✅ Strengths</div>
                                  <div className="ai-tags">
                                    {scanResults[app._id].strengths.length > 0 ? (
                                      scanResults[app._id].strengths.map((skill, idx) => (
                                        <span key={idx} className="ai-strength-tag">{skill}</span>
                                      ))
                                    ) : (
                                      <span className="ai-no-data">None detected</span>
                                    )}
                                  </div>
                                </div>

                                <div className="ai-missing">
                                  <div className="ai-label">⚠️ Missing Skills</div>
                                  <div className="ai-tags">
                                    {scanResults[app._id].improvements.length > 0 ? (
                                      scanResults[app._id].improvements.map((skill, idx) => (
                                        <span key={idx} className="ai-missing-tag">{skill}</span>
                                      ))
                                    ) : (
                                      <span className="ai-no-data">None</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setShowApplications(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editJob && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Job</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={editJob.title}
                  onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={editJob.company}
                  onChange={(e) => setEditJob({ ...editJob, company: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editJob.location}
                  onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input
                  type="text"
                  value={editJob.skills.join(", ")}
                  onChange={(e) => setEditJob({
                    ...editJob,
                    skills: e.target.value.split(",").map(s => s.trim())
                  })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageJobs;