// Sections
const addPostSection = document.getElementById("addPostSection");
const postListSection = document.getElementById("postListSection");
const applicationsSection = document.getElementById("applicationsSection");
const dashboardSection = document.getElementById("dashboardSection");

// Sidebar navigation
document.getElementById("nav-add-post").addEventListener("click", () => {
  addPostSection.style.display = "block";
  postListSection.style.display = "none";
  applicationsSection.style.display = "none";
  dashboardSection.style.display = "none";
});

document.getElementById("nav-view-posts").addEventListener("click", () => {
  addPostSection.style.display = "none";
  postListSection.style.display = "block";
  applicationsSection.style.display = "none";
  dashboardSection.style.display = "none";
  loadPosts();
});

document.getElementById("nav-applications").addEventListener("click", () => {
  addPostSection.style.display = "none";
  postListSection.style.display = "none";
  applicationsSection.style.display = "block";
  dashboardSection.style.display = "none";
  loadApplications();
});

document.getElementById("nav-dashboard").addEventListener("click", () => {
  addPostSection.style.display = "none";
  postListSection.style.display = "none";
  applicationsSection.style.display = "none";
  dashboardSection.style.display = "block";
});

// Add Post Form
document.getElementById("addPostForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    title: form.title.value,
    description: form.description.value,
    skillsRequired: form.skills.value.split(",").map(s => s.trim()),
    createdBy: form.createdBy.value,
    endDate: form.endDate.value
  };
  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message);
    form.reset();
  } catch (err) {
    console.error(err);
    alert("Error adding post");
  }
});

// Load Posts
async function loadPosts() {
  const postList = document.getElementById("postList");
  postList.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch("/api/posts");
    const posts = await res.json();
    postList.innerHTML = "";
    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("post-card");
      div.innerHTML = `
        <h4>${post.title}</h4>
        <p>${post.description}</p>
        <p><strong>Skills:</strong> ${post.skillsRequired.join(", ")}</p>
        <p><strong>Status:</strong> ${post.status}</p>
        <div class="card-buttons">
          <button onclick="openEditModal('${post._id}')">Edit</button>
        </div>
      `;
      postList.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    postList.innerHTML = "<p>Error loading posts</p>";
  }
}

// Edit Post Modal
const modal = document.getElementById("editPostModal");
const span = modal.querySelector(".close");
span.onclick = () => modal.style.display = "none";

window.onclick = (event) => {
  if (event.target == modal) modal.style.display = "none";
};

function openEditModal(postId) {
  modal.style.display = "block";
  fetch(`/api/posts/${postId}`)
    .then(res => res.json())
    .then(post => {
      const form = document.getElementById("editPostForm");
      form.postId.value = post._id;
      form.title.value = post.title;
      form.description.value = post.description;
      form.skills.value = post.skillsRequired.join(", ");
      form.endDate.value = new Date(post.endDate).toISOString().split("T")[0];
    });
}

// Update Post
document.getElementById("editPostForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    title: form.title.value,
    description: form.description.value,
    skillsRequired: form.skills.value.split(",").map(s => s.trim()),
    endDate: form.endDate.value,
    status: "open"
  };
  try {
    const res = await fetch(`/api/posts/${form.postId.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message);
    modal.style.display = "none";
    loadPosts();
  } catch (err) {
    console.error(err);
    alert("Error updating post");
  }
});

// Load Applications
async function loadApplications() {
  const applicationsList = document.getElementById("applicationsList");
  applicationsList.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch("/api/applications");
    const applications = await res.json();
    applicationsList.innerHTML = "";
    applications.forEach(app => {
      const div = document.createElement("div");
      div.classList.add("application-card");
      div.innerHTML = `
        <p><strong>User:</strong> ${app.userEmail || app.user}</p>
        <p><strong>Post ID:</strong> ${app.postId}</p>
        <p><strong>Status:</strong> ${app.status || "pending"}</p>
        <div class="card-buttons">
          <button onclick="updateApplication('${app._id}', 'accepted')">Accept</button>
          <button onclick="updateApplication('${app._id}', 'rejected')">Reject</button>
        </div>
      `;
      applicationsList.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    applicationsList.innerHTML = "<p>Error loading applications</p>";
  }
}

// Accept / Reject Application
async function updateApplication(id, status) {
  try {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    alert(result.message);
    loadApplications();
  } catch (err) {
    console.error(err);
    alert("Error updating application");
  }
}