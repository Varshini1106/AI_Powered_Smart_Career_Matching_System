// src/components/ManageJobs.jsx
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


  // ================= FETCH JOBS =================

  const fetchJobs = async () => {

    setLoading(true);

    try {

      const res = await fetch("http://localhost:5000/api/posts/posts");
      const data = await res.json();

      const formattedJobs = data.map(job => ({
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
        applications: job.applicationsCount || 0
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

  const filteredJobs = jobs.filter(job =>
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

    const response = await fetch(
      `http://localhost:5000/api/posts/posts/${jobId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

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

    const job = jobs.find(j => j.id === id);

    setEditJob({
      ...job,
      skills: job.skills || []
    });

    setShowEditModal(true);
  };


  const handleSaveEdit = async () => {

    try {

      await fetch(`http://localhost:5000/api/posts/posts/${editJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editJob)
      });

      setShowEditModal(false);
      fetchJobs();

    } catch (err) {

      console.error("Update error:", err);

    }
  };


  // ================= VIEW APPLICATIONS =================

  const handleViewApplications = async (jobId, jobTitle) => {

    setSelectedJob({ id: jobId, title: jobTitle });
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
        body: JSON.stringify({ status })
      });

      setApplications(
        applications.map(app =>
          app._id === appId ? { ...app, status } : app
        )
      );

    } catch (err) {

      console.error("Status update error:", err);

    }

    setUpdatingStatus(null);
  };


  const getStatusColor = (status) => {

    switch (status?.toLowerCase()) {
      case "accepted":
        return "status-accepted";
      case "declined":
        return "status-rejected";
      default:
        return "status-pending";
    }

  };


  return (

    <div className="manage-jobs-container">

      <div className="page-header">
        <h1>📋 Manage Jobs</h1>
        <p>View, edit, and manage all your job postings</p>
      </div>

      {/* SEARCH */}
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
              {filteredJobs.map(job => (
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
                      <button className="edit-btn" onClick={() => handleEdit(job.id)}>✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(job.id)}>🗑️</button>
                    </div>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= CLEAN APPLICATION MODAL ================= */}
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
                  <p>No applications received for this job yet</p>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map(app => (
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
                          {app.status || "Pending"}
                        </span>
                      </div>

                      <div className="app-details">
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

                      {app.status === "pending" && (
                        <div className="app-actions">
                          <button 
                            className="accept-btn"
                            onClick={() => handleUpdateStatus(app._id, "accepted")}
                            disabled={updatingStatus === app._id}
                          >
                            {updatingStatus === app._id ? "Processing..." : "✓ Accept"}
                          </button>
                          <button 
                            className="decline-btn"
                            onClick={() => handleUpdateStatus(app._id, "declined")}
                            disabled={updatingStatus === app._id}
                          >
                            {updatingStatus === app._id ? "Processing..." : "✗ Decline"}
                          </button>
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

      {/* ================= EDIT MODAL ================= */}
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
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageJobs;