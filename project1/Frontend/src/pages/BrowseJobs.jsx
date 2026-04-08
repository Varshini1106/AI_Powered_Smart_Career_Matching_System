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

  const handleApply = async (job) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to apply");
      window.location.href = "/";
      return;
    }

    setApplyingJob(job._id);
    
    try {
      const response = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ jobId: job._id })
      });

      if (response.ok) {
        alert(`Successfully applied for ${job.title}!`);
      } else {
        const error = await response.json();
        alert(error.message || "Application failed");
      }
    } catch (err) {
      console.error("Apply Error:", err);
      alert("Error applying for job");
    } finally {
      setApplyingJob(null);
    }
  };

  // Get unique locations and types for filters
  const locations = ["all", ...new Set(jobs.map(job => job.location).filter(Boolean))];
  const types = ["all", ...new Set(jobs.map(job => job.type).filter(Boolean))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
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

        {/* Search and Filters */}
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

        {/* Results Count */}
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
              <button className="clear-btn" onClick={() => {
                setSearch("");
                setSelectedType("all");
                setSelectedLocation("all");
              }}>
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div key={job._id} className="job-card">
                <div className="job-card-header">
                  <div className="job-icon">
                    <span>💼</span>
                  </div>
                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <div className="company-info">
                      <span>🏢 {job.company || "Company Name"}</span>
                    </div>
                  </div>
                </div>

                <div className="job-details">
                  <div className="job-meta">
                    <span className="meta-tag">
                      📍 {job.location || "Remote"}
                    </span>
                    <span className="meta-tag">
                      💰 {job.salary || "Competitive"}
                    </span>
                    <span className="meta-tag">
                      📅 {job.type || "Full-time"}
                    </span>
                  </div>
                  
                  <p className="job-description">
                    {job.description || "No description available"}
                  </p>

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
                    onClick={() => handleApply(job)}
                    disabled={applyingJob === job._id}
                  >
                    {applyingJob === job._id ? (
                      <>
                        <span className="spinner-small"></span>
                        Applying...
                      </>
                    ) : (
                      "Apply Now →"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BrowseJobs;