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

  const validateInputs = () => {
    // If input looks like an email (contains @), validate it's @gmail.com
    if (email.includes("@")) {
      if (!email.toLowerCase().endsWith("@gmail.com")) {
        setError("Email must end with @gmail.com");
        return false;
      }
    }
    // Password validation: min 6 chars, 1 uppercase, 1 special character
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError("Password must contain at least one special character");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info
        const user = data.user;
        const token = data.token;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        // Extract userId from JWT payload
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          localStorage.setItem("userId", payload.id);
        }

        // Navigate based on role
        if (user.role === "admin") navigate("/admin");
        else navigate("/user");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <div className="brand-icon">
            {/* Your SVG logo */}
          </div>
          <h1>Career<span>Matcher</span></h1>
        </div>

        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue your career journey</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email or Username</label>
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
            <label htmlFor="password">Password</label>
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
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="forgot">
            <Link to="#">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
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