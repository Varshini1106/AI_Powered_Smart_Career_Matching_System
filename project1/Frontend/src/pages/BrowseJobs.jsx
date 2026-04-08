// src/pages/BrowseJobs.jsx
import React, { useEffect, useState } from "react";
import UserSidebar from "../components/UserSidebar";
import "./BrowseJobs.css";

function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [applyingJob, setApplyingJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    experience: "",
    currentRole: "",
    education: "",
    skills: "",
    reason: "",
    resume: null
  });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadJobs();
    loadAppliedJobs();
  }, []);

  async function loadJobs() {
    try {
      const response = await fetch("http://localhost:5000/api/posts");
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }

  async function loadAppliedJobs() {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5000/api/applications/my-applications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const appliedJobIds = data.map(app => app.postId);
      setAppliedJobs(appliedJobIds);
    } catch (err) {
      console.error("Error loading applied jobs:", err);
    }
  }

  const handleApplyClick = (job) => {
    if (!token) {
      alert("Please login to apply");
      window.location.href = "/";
      return;
    }
    setApplyingJob(job);
    setFormData({
      userName: "",
      experience: "",
      currentRole: "",
      education: "",
      skills: "",
      reason: "",
      resume: null
    });
  };

  const closeModal = () => {
    setApplyingJob(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applyingJob) return;
    
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append("postId", applyingJob._id);
      data.append("userId", userId);
      data.append("userName", formData.userName);
      data.append("experience", formData.experience);
      data.append("currentRole", formData.currentRole);
      data.append("education", formData.education);
      data.append("skills", formData.skills);
      data.append("reason", formData.reason);
      if (formData.resume) data.append("resume", formData.resume);

      const response = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        alert("✨ Application submitted successfully!");
        setAppliedJobs([...appliedJobs, applyingJob._id]);
        closeModal();
      } else {
        alert(result.error || "Failed to submit application");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const locations = ["all", ...new Set(jobs.map(job => job.location).filter(Boolean))];
  const types = ["all", ...new Set(jobs.map(job => job.type).filter(Boolean))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "all" || job.type === selectedType;
    const matchesLocation = selectedLocation === "all" || job.location === selectedLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="browse-jobs-container">
      <UserSidebar />

      <main className="browse-main">
        <div className="page-header">
          <h1>Find Your Next Role</h1>
          <p>Discover opportunities that match your skills and career goals</p>
        </div>

        <div className="filters-section">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by job title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              className="filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {types.filter(t => t !== "all").map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locations.filter(l => l !== "all").map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="results-count">
          Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <span className="empty-icon">🔍</span>
              <h3>No jobs found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button
                className="clear-btn"
                onClick={() => {
                  setSearch("");
                  setSelectedType("all");
                  setSelectedLocation("all");
                }}
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div key={job._id} className="job-card">
                <div className="job-card-header">
                  <div className="job-icon"><span>💼</span></div>
                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <div className="company-info"><span>🏢 {job.company || "Company Name"}</span></div>
                  </div>
                </div>

                <div className="job-details">
                  <div className="job-meta">
                    <span className="meta-tag">📍 {job.location || "Remote"}</span>
                    <span className="meta-tag">💰 {job.salary || "Competitive"}</span>
                    <span className="meta-tag">📅 {job.type || "Full-time"}</span>
                  </div>

                  <p className="job-description">{job.description || "No description available"}</p>

                  {job.skills && (
                    <div className="skills-section">
                      <span className="skills-label">Required Skills:</span>
                      <div className="skills-list">
                        {job.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="skill-badge">{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="job-card-footer">
                  <button
                    className="apply-btn"
                    onClick={() => handleApplyClick(job)}
                    disabled={appliedJobs.includes(job._id)}
                  >
                    {appliedJobs.includes(job._id) ? "✓ Applied" : "Apply Now →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modern Modal */}
      {applyingJob && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="modal-job-icon">📝</div>
                <div>
                  <h2>Apply for {applyingJob.title}</h2>
                  <p className="modal-company">{applyingJob.company || "Company Name"}</p>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span className="label-icon">👤</span>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">💼</span>
                      Experience (Years) *
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span className="label-icon">🎯</span>
                      Current Role
                    </label>
                    <input
                      type="text"
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleChange}
                      placeholder="e.g., Senior Developer"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">🎓</span>
                      Education *
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="e.g., B.Tech in Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon">⚡</span>
                    Key Skills *
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., React, Node.js, Python, MongoDB"
                    required
                  />
                  <small className="input-hint">Separate skills with commas</small>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon">💬</span>
                    Statement of Interest *
                  </label>
                  <textarea
                    name="reason"
                    rows="4"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Why are you interested in this position? What makes you a great fit?"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon">📄</span>
                    Upload Resume *
                  </label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      name="resume"
                      id="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="resume" className="file-label">
                      <span>📎 Choose File</span>
                    </label>
                    <span className="file-name">
                      {formData.resume ? formData.resume.name : "No file chosen"}
                    </span>
                  </div>
                  <small className="input-hint">Supported formats: PDF, DOC, DOCX</small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-modal-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-modal-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Submitting...
                    </>
                  ) : (
                    "✓ Submit Application"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseJobs;