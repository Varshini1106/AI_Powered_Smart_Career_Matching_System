// src/components/ManageJobs.jsx
import React, { useState, useEffect } from "react";

function ManageJobs({ setSection }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);

  // Fetch jobs once when component mounts
  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then(res => res.json())
      .then(data => {
        console.log("Jobs from API:", data);
        const formattedJobs = data.map(job => ({
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.jobType,
          skills: job.skills
            ? Array.isArray(job.skills)
            ? job.skills
            : job.skills.split(',')
            : [],
          applications: job.applications || 0,
          status: job.status || "Active",
          postedDate: new Date(job.createdAt).toLocaleDateString()
        }));
        setJobs(formattedJobs);
      })
      .catch(err => console.error("Error fetching jobs:", err));
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete job from backend and update UI
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await fetch(`http://localhost:5000/api/posts/${id}`, { method: "DELETE" });
        setJobs(jobs.filter(job => job.id !== id));
      } catch (err) {
        console.error("Error deleting job:", err);
      }
    }
  };

  const handleEdit = (id) => {
    alert(`Edit job with ID: ${id}\nThis will open edit form in production.`);
  };

  const handleViewApplications = (id) => {
    alert(`View applications for job ID: ${id}\nThis will show applications list in production.`);
  };

  const hasNoJobs = jobs.length === 0;

  return (
    <>
      <div className="page-header">
        <h1>📋 Manage Jobs</h1>
        <p>View, edit, or delete your job postings</p>
      </div>

      {!hasNoJobs && (
        <div className="jobs-stats-summary">
          <div className="summary-card">
            <span className="summary-icon">📊</span>
            <div>
              <div className="summary-value">{jobs.length}</div>
              <div className="summary-label">Total Jobs</div>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">✅</span>
            <div>
              <div className="summary-value">{jobs.filter(j => j.status === "Active").length}</div>
              <div className="summary-label">Active Jobs</div>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">📝</span>
            <div>
              <div className="summary-value">{jobs.reduce((sum, job) => sum + job.applications, 0)}</div>
              <div className="summary-label">Total Applications</div>
            </div>
          </div>
        </div>
      )}

      {!hasNoJobs && (
        <div className="jobs-header">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-bar"
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="refresh-btn" onClick={() => setSearchTerm("")}>🔄 Clear Search</button>
        </div>
      )}

      {hasNoJobs && (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">📭</div>
            <h3>No Jobs Posted Yet</h3>
            <p>You haven't posted any jobs yet. Start by creating your first job posting!</p>
            <button className="create-job-btn" onClick={() => setSection("postjob")}>
              ✨ Post Your First Job
            </button>
          </div>
        </div>
      )}

      {!hasNoJobs && filteredJobs.length > 0 && (
        <div className="jobs-table">
          <table>
            <thead>
              <tr>
                <th>Job Title & Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Skills</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Posted Date</th>
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
                    <div className="skills-preview">
                      {job.skills.slice(0, 2).map((skill, i) => (
                        <span key={i} className="skill-preview-tag">{skill.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button className="applications-count" onClick={() => handleViewApplications(job.id)}>
                      {job.applications} 📧
                    </button>
                  </td>
                  <td>
                    <span className={`job-status ${job.status === "Active" ? "status-active" : "status-closed"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{job.postedDate}</td>
                  <td className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(job.id)}>✏️ Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(job.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!hasNoJobs && filteredJobs.length === 0 && (
        <div className="no-results">
          <div className="no-results-content">
            <span className="no-results-icon">🔍</span>
            <p>No jobs found matching "{searchTerm}"</p>
            <button className="clear-search-btn" onClick={() => setSearchTerm("")}>Clear Search</button>
          </div>
        </div>
      )}

      {!hasNoJobs && filteredJobs.length > 0 && (
        <div className="jobs-footer">
          <p>Showing {filteredJobs.length} of {jobs.length} jobs</p>
        </div>
      )}
    </>
  );
}

export default ManageJobs;