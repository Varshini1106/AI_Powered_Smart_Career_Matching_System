// src/pages/BrowseJobs.jsx
import React, { useEffect, useState } from "react";
import UserSidebar from "../components/UserSidebar";
import "./BrowseJobs.css";

function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [applyingJob, setApplyingJob] = useState(null); // job being applied to
  const [appliedJobs, setAppliedJobs] = useState([]); // track applied jobs

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    experience: "",
    currentRole: "",
    education: "",
    skills: "",
    reason: "",
  });
  const [currentJobId, setCurrentJobId] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Load jobs from backend
  useEffect(() => {
    loadJobs();
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

  const handleApplyClick = (jobId) => {
    if (!userId) {
      alert("Please log in first!");
      return;
    }
    setCurrentJobId(jobId);
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!userId || !currentJobId) return;

    const applicationData = {
      postId: currentJobId,
      userId: userId,
      userName: formData.userName,
      experience: formData.experience,
      currentRole: formData.currentRole,
      education: formData.education,
      skills: formData.skills,
      reason: formData.reason,
      status: "pending",
    };

    try {
      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Application submitted successfully! ✅");
        setAppliedJobs(prev => [...prev, currentJobId]);
        setShowModal(false);
        setFormData({
          userName: "",
          experience: "",
          currentRole: "",
          education: "",
          skills: "",
          reason: "",
        });
        setCurrentJobId(null);
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Failed to connect to server. Is your Backend running?");
    }
  };

  const closeModal = () => setShowModal(false);

  // Filtering
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

        {/* Search & Filters */}
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

        {/* Jobs Grid */}
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
                    onClick={() => handleApplyClick(job._id)}
                    disabled={applyingJob === job._id || appliedJobs.includes(job._id)}
                  >
                    {appliedJobs.includes(job._id) ? "Applied" : "Apply Now →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal" onClick={(e) => e.target.className === "modal" && closeModal()}>
          <div className="modal-content">
            <h2>Apply for Position</h2>
            <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "1rem" }}>
              Let the recruiter know why you're the perfect fit.
            </p>

            <form onSubmit={handleSubmitApplication}>
              <div className="form-group">
                <label>Full Name</label>
                <input id="userName" value={formData.userName} onChange={handleModalChange} required />
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Experience (Years)</label>
                  <input id="experience" type="number" value={formData.experience} onChange={handleModalChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Current Role</label>
                  <input id="currentRole" value={formData.currentRole} onChange={handleModalChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Education</label>
                <input id="education" value={formData.education} onChange={handleModalChange} required />
              </div>

              <div className="form-group">
                <label>Key Skills</label>
                <input id="skills" value={formData.skills} onChange={handleModalChange} required />
              </div>

              <div className="form-group">
                <label>Statement of Interest</label>
                <textarea id="reason" rows="4" value={formData.reason} onChange={handleModalChange} required />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="confirm-btn">Submit Application</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Maybe Later</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseJobs;