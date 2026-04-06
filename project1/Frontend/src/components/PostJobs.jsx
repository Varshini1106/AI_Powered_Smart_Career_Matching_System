// src/components/PostJobs.jsx
import React, { useState } from "react";

function PostJob() {
  const [job, setJob] = useState({
    title: "",
    company: "",
    skills: "",
    location: "",
    type: "Full-time",
    salary: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const response = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(job)
    });

    const data = await response.json();

    console.log(data);
    alert("Job posted successfully!");

    setJob({
      title: "",
      company: "",
      skills: "",
      location: "",
      type: "Full-time",
      salary: "",
      description: ""
    });

  } catch (error) {
    console.error(error);
    alert("Error posting job");
  }

  setIsSubmitting(false);
};

  return (
    <>
      <div className="page-header">
        <h1>📝 Post a New Job</h1>
        <p>Create a new job listing to find the perfect candidate</p>
      </div>

      <div className="form-container">
        <h3 className="form-title">Job Details</h3>
        <p className="form-subtitle">Fill in the information below to post a new position</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Senior React Developer"
              value={job.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="company"
              placeholder="e.g., TechVision Solutions"
              value={job.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              placeholder="e.g., Remote, New York, San Francisco"
              value={job.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Job Type *</label>
              <select name="type" value={job.type} onChange={handleChange}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Remote</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div className="form-group half">
              <label>Salary Range</label>
              <input
                type="text"
                name="salary"
                placeholder="e.g., $80,000 - $120,000"
                value={job.salary}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Required Skills *</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g., React, Node.js, Python (comma separated)"
              value={job.skills}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              placeholder="Describe the role, responsibilities, requirements, and benefits..."
              value={job.description}
              onChange={handleChange}
              rows="6"
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => {
              setJob({
                title: "",
                company: "",
                skills: "",
                location: "",
                type: "Full-time",
                salary: "",
                description: ""
              });
            }}>
              Clear Form
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Posting...
                </>
              ) : (
                "✨ Post Job Now"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default PostJob;