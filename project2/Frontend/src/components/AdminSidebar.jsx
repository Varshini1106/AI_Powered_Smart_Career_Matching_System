// src/components/AdminSidebar.jsx
import React from "react";

function AdminSidebar({ setSection, activeSection }) {
  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 10.5V17.5L12 21.5L19 17.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 12L8 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 12L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: "profile", 
      label: "Profile", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M17 3.5L19 5.5L23 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: "postjob", 
      label: "Post Job", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      id: "managejobs", 
      label: "Manage Jobs", 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 21V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V21" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 11H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 15H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      window.location.href = "/";
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>Career<span>Matcher</span></h2>
      </div>

      <div className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
            onClick={() => setSection(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;