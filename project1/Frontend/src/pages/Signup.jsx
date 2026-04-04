// src/pages/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../assets/Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { name, email, password, role } = formData;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }
      );

      if (response.status === 201) {
        alert("Signup successful! You can now login.");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message || "Signup failed. Try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1B2F4F" strokeWidth="1.5"/>
              <path d="M2 17L12 22L22 17" stroke="#1B2F4F" strokeWidth="1.5"/>
              <path d="M2 12L12 17L22 12" stroke="#1B2F4F" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1>Career<span>Matcher</span></h1>
        </div>

        <h2>Create an Account</h2>
        <p className="subtitle">Join us and start your career journey</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="hello@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="role">Role</label>
            <div className="select-wrapper">
              <select
                id="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="footer">
          Already have an account? <Link to="/">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;