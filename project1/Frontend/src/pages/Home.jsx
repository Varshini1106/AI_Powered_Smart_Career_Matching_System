// src/pages/Home.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

const Home = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data
        localStorage.setItem("user", JSON.stringify({ name: data.name, role: data.role }));
        localStorage.setItem("token", data.token);

        // Extract userId from JWT
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        localStorage.setItem("userId", payload.id);

        // Navigate based on role
        if (data.role === "admin") navigate("/admin");
        else navigate("/user");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1B2F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#1B2F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#1B2F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Career<span>Matcher</span></h1>
        </div>
        
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue your career journey</p>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 6L12 13L2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Email or Username
            </label>
            <input
              id="email"
              type="text"
              placeholder="Enter your email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M18 8C19.6569 8 21 9.34315 21 11V16C21 17.6569 19.6569 19 18 19H6C4.34315 19 3 17.6569 3 16V11C3 9.34315 4.34315 8 6 8H18Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Password
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C13.7874 19 15.3701 18.4431 16.6911 17.6085M9.88468 9.88579C9.32434 10.4462 9 11.197 9 12C9 13.6569 10.3431 15 12 15C12.803 15 13.5538 14.6757 14.1142 14.1153" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M17.736 12.0632C17.9061 11.3922 18 10.7074 18 10C18 6.68629 15.3137 4 12 4C11.0916 4 10.2292 4.18943 9.44543 4.52344M21.6076 7.49414C22.4767 8.85784 22.9745 10.3116 22.9919 10.5441C23.0027 10.6734 23.0027 11.3266 22.9919 11.4559C22.9858 11.5376 22.8392 11.8552 22.6076 12.2926" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 12 5.63636 5 12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="forgot">
            <Link to="#">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="footer">
          New user? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;