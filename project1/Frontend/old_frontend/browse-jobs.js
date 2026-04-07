// 1. LOAD JOBS (Keep your current design)
async function loadAvailableJobs() {
    const jobList = document.getElementById("allJobsList");
    try {
        const response = await fetch("http://localhost:5000/api/posts");
        const jobs = await response.json();
        jobList.innerHTML = "";

        if (!jobs || jobs.length === 0) {
            jobList.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No jobs found.</p>`;
            return;
        }

        jobList.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h4 style="margin-bottom: 5px; color: #1e293b;">${job.title}</h4>
                <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 15px;">${job.description}</p>
                <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.75rem; color: #94a3b8;">${job.createdBy}</span>
                    <button class="apply-btn" onclick="applyNow('${job._id}')" style="width: auto; padding: 8px 15px; margin: 0;">Apply Now</button>
                </div>
            </div>
        `).join("");
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

// 2. OPEN THE NEAT MODAL
function applyNow(jobId) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please log in first!");
        return;
    }
    // Set the Job ID in the hidden input and show the modal
    document.getElementById("applyJobId").value = jobId;
    document.getElementById("applyModal").style.display = "flex";
}

// 3. CLOSE MODAL
function closeModal() {
    document.getElementById("applyModal").style.display = "none";
}

// 4. SUBMIT FORM TO ATLAS
document.getElementById("applicationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    const postId = document.getElementById("applyJobId").value;

    // Collect all the neat information you wanted
    const applicationData = {
        postId: postId,
        userId: userId,
        userName: document.getElementById("applyName").value,
        experience: document.getElementById("applyExp").value,
        currentRole: document.getElementById("applyCurrentRole").value,
        education: document.getElementById("applyEdu").value,
        skills: document.getElementById("applySkills").value,
        reason: document.getElementById("applyReason").value,
        status: "pending"
    };

    try {
        const response = await fetch("http://localhost:5000/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(applicationData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Application submitted successfully! ✅ It is now in your Atlas database.");
            closeModal();
            document.getElementById("applicationForm").reset();
        } else {
            alert("Error: " + result.error);
        }
    } catch (err) {
        console.error("Submission Error:", err);
        alert("Failed to connect to server. Is your Backend running?");
    }
});

// Run on page load
loadAvailableJobs();