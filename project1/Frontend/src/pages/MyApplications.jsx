// src/pages/MyApplications.jsx
import React, { useEffect, useState } from "react";
import "./MyApplications.css";
import UserSidebar from "../components/UserSidebar";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/my-applications/${userId}`
      );
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyApplications();
    }
  }, [userId]);

  const openModal = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
  };

  const handleChange = (e) => {
    setSelectedApp({
      ...selectedApp,
      [e.target.name]: e.target.value,
    });
  };

  const updateApplication = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/update/${selectedApp._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedApp),
        }
      );

      if (res.ok) {
        alert("Application Updated Successfully!");
        closeModal();
        fetchMyApplications();
      }
    } catch (err) {
      console.error(err);
      alert("Error updating application");
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/delete/${id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        alert("Application deleted successfully!");
        fetchMyApplications();
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting application");
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'interview': return 'status-interview';
      default: return 'status-pending';
    }
  };

  return (
    <div className="my-applications-page">
      <UserSidebar />

      <main className="applications-main">
        <div className="page-header">
          <h1>📋 My Applications</h1>
          <p>Track and manage all your job applications in one place</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <span className="empty-icon">📭</span>
              <h3>No Applications Yet</h3>
              <p>You haven't applied to any jobs yet. Start your job search today!</p>
              <button 
                className="browse-jobs-btn"
                onClick={() => window.location.href = "/browse-jobs"}
              >
                Browse Jobs →
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="applications-stats">
              <div className="stat-card-mini">
                <span className="stat-icon">📊</span>
                <div>
                  <div className="stat-number">{applications.length}</div>
                  <div className="stat-label">Total Applications</div>
                </div>
              </div>
              <div className="stat-card-mini">
                <span className="stat-icon">✅</span>
                <div>
                  <div className="stat-number">
                    {applications.filter(a => a.status?.toLowerCase() === 'accepted').length}
                  </div>
                  <div className="stat-label">Accepted</div>
                </div>
              </div>
              <div className="stat-card-mini">
                <span className="stat-icon">⏳</span>
                <div>
                  <div className="stat-number">
                    {applications.filter(a => a.status?.toLowerCase() === 'pending').length}
                  </div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>

            <div className="applications-grid">
              {applications.map((app) => (
                <div className="application-card" key={app._id}>
                  <div className="card-header">
                    <div className="job-icon">💼</div>
                    <div className="job-info">
                      <h3>{app.jobTitle || "Job Position"}</h3>
                      <p className="company-name">{app.companyName || "Company"}</p>
                    </div>
                    <span className={`status-badge ${getStatusColor(app.status)}`}>
                      {app.status || "Pending"}
                    </span>
                  </div>

                  <div className="card-details">
                    <div className="detail-row">
                      <span className="detail-label">Applied on:</span>
                      <span className="detail-value">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    {app.experience && (
                      <div className="detail-row">
                        <span className="detail-label">Experience:</span>
                        <span className="detail-value">{app.experience} years</span>
                      </div>
                    )}
                    {app.currentRole && (
                      <div className="detail-row">
                        <span className="detail-label">Current Role:</span>
                        <span className="detail-value">{app.currentRole}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button className="info-btn" onClick={() => openModal(app)}>
                      ✏️ Edit Details
                    </button>
                    <button className="delete-btn" onClick={() => deleteApplication(app._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modal */}
      {showModal && selectedApp && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Application</h2>
              <button className="close-modal" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={updateApplication}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="userName"
                    value={selectedApp.userName || ""}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Experience (years)</label>
                  <input
                    name="experience"
                    value={selectedApp.experience || ""}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    type="number"
                  />
                </div>

                <div className="form-group">
                  <label>Current Role</label>
                  <input
                    name="currentRole"
                    value={selectedApp.currentRole || ""}
                    onChange={handleChange}
                    placeholder="e.g., Senior Developer"
                  />
                </div>

                <div className="form-group">
                  <label>Education</label>
                  <input
                    name="education"
                    value={selectedApp.education || ""}
                    onChange={handleChange}
                    placeholder="e.g., B.Tech in Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label>Skills</label>
                  <input
                    name="skills"
                    value={selectedApp.skills || ""}
                    onChange={handleChange}
                    placeholder="e.g., React, Node.js, Python"
                  />
                </div>

                <div className="form-group">
                  <label>Reason for applying</label>
                  <textarea
                    name="reason"
                    value={selectedApp.reason || ""}
                    onChange={handleChange}
                    placeholder="Why do you want this position?"
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;