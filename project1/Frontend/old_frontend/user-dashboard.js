// --- 1. Load Real-Time Stats (For the Dashboard Boxes) ---
async function updateDashboardStats() {
    try {
        // Fetch real count of jobs from the /count endpoint we added to posts.js
        const postsRes = await fetch("http://localhost:5000/api/posts/count");
        const postsData = await postsRes.json();
        
        // Update the "Active Posts" box
        const postsBox = document.getElementById('statPosts');
        if (postsBox) {
            postsBox.innerText = postsData.count || 0;
        }

        // Update the "Total Applied" box based on the rows in your tracking table
        const appliedRows = document.querySelectorAll('#myAppsTable tr').length;
        const appliedBox = document.getElementById('statApplied');
        if (appliedBox) {
            // Subtracting 1 if you have a placeholder/empty row, or just use the length
            appliedBox.innerText = appliedRows;
        }
    } catch (err) {
        console.error("Error updating stats:", err);
    }
}

// --- 2. Load Applications for the Logged-in User ---
async function loadMyApplications() {
    const tableBody = document.getElementById("myAppsTable");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:5000/api/applications/my-applications", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const apps = await response.json();

        tableBody.innerHTML = ""; 
        if (apps.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No applications found.</td></tr>`;
        } else {
            apps.forEach(app => {
                // Formatting date for the "Applied On" column
                const date = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A";
                
                tableBody.innerHTML += `
                    <tr>
                        <td>${app.jobTitle || "Job Application"}</td>
                        <td>${date}</td>
                        <td><span class="status status-${app.status.toLowerCase()}">${app.status.toUpperCase()}</span></td>
                    </tr>`;
            });
        }
        
        // Trigger the stats update after the table is filled
        updateDashboardStats(); 

    } catch (err) {
        console.error("Error loading your applications:", err);
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: red;">Error loading data.</td></tr>`;
    }
}

// --- 3. Submit Application to MongoDB ---
async function applyForJob(postId, jobTitle) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please login first!");
        return;
    }

    const appData = {
        postId: postId,
        jobTitle: jobTitle,
        userId: user.id,
        userEmail: user.email,
        status: "pending",
        appliedAt: new Date()
    };

    try {
        const res = await fetch("http://localhost:5000/api/applications", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(appData)
        });

        const result = await res.json();
        alert("Success: " + result.message);
        
        // Refresh everything to update boxes and table immediately
        loadMyApplications(); 
    } catch (err) {
        console.error("Application error:", err);
    }
}

// --- Note: loadAvailableJobs is no longer needed on the main Dashboard 
// as we removed the "Recommended" section, but keep it for your "Browse Jobs" page.