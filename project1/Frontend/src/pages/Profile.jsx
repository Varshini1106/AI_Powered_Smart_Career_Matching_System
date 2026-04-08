// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import "./Profile.css";

function Profile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    skills: "",
    bio: "",
    id: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!user || !token || !userId) {
      window.location.href = "/";
      return;
    }

    setUserData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      id: userId,
    }));

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUserData((prev) => ({
            ...prev,
            skills: data.skills ? data.skills.join(", ") : "",
            bio: data.bio || "",
          }));
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userData.id,
          skills: userData.skills.split(",").map((s) => s.trim()),
          bio: userData.bio,
        }),
      });

      if (res.ok) {
        alert("✨ Profile updated successfully!");
        setIsEditing(false);
      } else {
        const data = await res.json();
        alert(`Failed to update profile: ${data.message || res.statusText}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Server error. Check your backend console.");
    }
  };

  return (
    <div className="profile-page">
      <UserSidebar />

      <main className="profile-main">
        <div className="page-header">
          <h1>👤 My Profile</h1>
          <p>Update your professional details to get better job matches</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your profile...</p>
          </div>
        ) : (
          <div className="profile-container">
            {/* Profile Avatar Section */}
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <span className="avatar-emoji">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div className="profile-name-email">
                <h2>{userData.name}</h2>
                <p>{userData.email}</p>
              </div>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>
                  <span className="label-icon">📛</span>
                  Full Name
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={userData.name} 
                  readOnly 
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={userData.email} 
                  readOnly 
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">💻</span>
                  Technical Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={userData.skills}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  placeholder="e.g., React, Node.js, Python, MongoDB"
                  className={!isEditing ? "readonly-input" : "editable-input"}
                />
                <small className="input-hint">Separate skills with commas</small>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">📝</span>
                  Professional Bio
                </label>
                <textarea
                  name="bio"
                  rows={5}
                  value={userData.bio}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  placeholder="Tell us about your experience, achievements, and career goals..."
                  className={!isEditing ? "readonly-input" : "editable-input"}
                ></textarea>
              </div>

              <div className="button-group">
                {!isEditing ? (
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <>
                    <button className="save-btn" onClick={saveProfile}>
                      💾 Save Changes
                    </button>
                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                      ❌ Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;