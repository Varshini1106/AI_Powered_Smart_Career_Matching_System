// src/components/AdminProfile.jsx

import React, { useState, useEffect } from "react";

function AdminProfile() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    role: "Administrator",
    company: "CareerConnect",
    about: "",
    skills: [],
    email: user?.email || "",
    location: "",
    phone: "",
    joined: ""
  });

  const [showCompleteMessage, setShowCompleteMessage] = useState(false);

  useEffect(() => {

    if (!user) return;

    fetch(`http://localhost:5000/api/users/${user._id}`)
      .then(res => res.json())
      .then(data => {

        const updatedProfile = {
          name: data.name || user.name,
          role: data.role || "Administrator",
          company: data.company || "CareerConnect",
          about: data.about || "",
          skills: data.skills || [],
          email: data.email || user.email,
          location: data.location || "",
          phone: data.phone || "",
          joined: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString()
            : ""
        };

        setProfile(updatedProfile);

        checkProfileCompletion(updatedProfile);

      })
      .catch(err => console.error("Error loading profile:", err));

  }, []);

  const checkProfileCompletion = (profileData) => {

    if (
      !profileData.about ||
      !profileData.location ||
      !profileData.phone ||
      profileData.skills.length === 0
    ) {
      setShowCompleteMessage(true);
    } else {
      setShowCompleteMessage(false);
    }

  };

  const handleSave = async () => {

    try {

      await fetch(`http://localhost:5000/api/users/${user._id}`, {

        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile)

      });

      setIsEditing(false);

      checkProfileCompletion(profile);

      alert("Profile updated successfully!");

    } catch (error) {

      console.error("Error updating profile:", error);

    }

  };

  const handleSkillChange = (value) => {

    const skillsArray = value.split(",").map(skill => skill.trim());

    setProfile({
      ...profile,
      skills: skillsArray
    });

  };

  return (

    <div className="profile-container">

      {/* PROFILE WARNING */}
      {showCompleteMessage && (
        <div
          style={{
            background: "#FFF4E5",
            border: "1px solid #FFD8A8",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "15px",
            color: "#9A6700",
            fontWeight: "500"
          }}
        >
          ⚠️ Complete your profile to improve job matching.
        </div>
      )}

      {/* BANNER */}

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

      {/* EDIT BUTTON */}

      <div className="profile-actions">

        <button
          className="edit-profile-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "✏️ Edit Profile"}
        </button>

      </div>

      {/* PROFILE DETAILS */}

      <div className="profile-details">

        {/* ABOUT */}

        <div className="detail-section">

          <h3>
            <span className="section-icon">📖</span>
            About Me
          </h3>

          {isEditing ? (

            <textarea
              value={profile.about}
              onChange={(e) =>
                setProfile({ ...profile, about: e.target.value })
              }
              rows="4"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "2px solid #E2E8F0"
              }}
            />

          ) : (

            <p>{profile.about || "No information added yet."}</p>

          )}

        </div>

        {/* CONTACT */}

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

            {isEditing ? (
              <input
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
              />
            ) : (
              <div className="info-value">
                {profile.location || "Not added"}
              </div>
            )}

          </div>

          <div className="info-row">
            <div className="info-label">Phone:</div>

            {isEditing ? (
              <input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            ) : (
              <div className="info-value">
                {profile.phone || "Not added"}
              </div>
            )}

          </div>

          <div className="info-row">
            <div className="info-label">Joined:</div>
            <div className="info-value">{profile.joined}</div>
          </div>

        </div>

        {/* SKILLS */}

        <div className="detail-section">

          <h3>
            <span className="section-icon">🎯</span>
            Hiring Skills
          </h3>

          {isEditing ? (

            <input
              value={profile.skills.join(",")}
              onChange={(e) => handleSkillChange(e.target.value)}
              placeholder="Enter skills separated by commas"
            />

          ) : (

            <div className="skills-list">

              {profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))
              ) : (
                <p>No skills added yet.</p>
              )}

            </div>

          )}

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