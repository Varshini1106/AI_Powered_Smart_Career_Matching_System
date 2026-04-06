// src/components/AdminProfile.jsx
import React, { useState } from "react";

function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    role: "Senior HR Manager",
    company: "TechVision Solutions",
    about: "Experienced HR professional with 8+ years in tech recruitment. Passionate about finding the right talent and building great teams. Specialized in AI/ML and Full Stack roles.",
    skills: ["React", "Node.js", "Python", "Machine Learning", "AWS", "Docker"],
    email: "sarah.johnson@techvision.com",
    location: "San Francisco, CA",
    phone: "+1 (555) 123-4567",
    joined: "January 2022"
  });

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  return (
    <div className="profile-container">
      {/* Navy Blue Banner with User Info */}
      <div className="profile-banner">
        <div className="banner-content">
          <div className="banner-left">
            <div className="banner-avatar">
              <span className="avatar-emoji">👩‍💼</span>
            </div>
            <div className="banner-info">
              <h2>{profile.name}</h2>
              <p>{profile.role} • {profile.company}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Button Below Banner - Right Aligned */}
      <div className="profile-actions">
        <button className="edit-profile-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "✏️ Edit Profile"}
        </button>
      </div>

      <div className="profile-details">
        <div className="detail-section">
          <h3>
            <span className="section-icon">📖</span>
            About Me
          </h3>
          {isEditing ? (
            <textarea 
              value={profile.about} 
              onChange={(e) => setProfile({...profile, about: e.target.value})}
              rows="4"
              style={{width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #E2E8F0"}}
            />
          ) : (
            <p>{profile.about}</p>
          )}
        </div>

        <div className="detail-section">
          <h3>
            <span className="section-icon">📞</span>
            Contact Information
          </h3>
          <div className="info-row">
            <div className="info-label">Email:</div>
            <div className="info-value">{profile.email}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Location:</div>
            <div className="info-value">{profile.location}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Phone:</div>
            <div className="info-value">{profile.phone}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Joined:</div>
            <div className="info-value">{profile.joined}</div>
          </div>
        </div>

        <div className="detail-section">
          <h3>
            <span className="section-icon">🎯</span>
            Hiring Skills
          </h3>
          <div className="skills-list">
            {profile.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>

        {isEditing && (
          <button className="submit-btn" onClick={handleSave}>
            💾 Save Changes
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;