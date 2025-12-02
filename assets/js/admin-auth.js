// Simple localStorage-based admin auth

const ADMIN_USER_KEY = "3dprint_admin_user";

function isAdminAuthenticated() {
  return !!localStorage.getItem(ADMIN_USER_KEY);
}

function requireAdminOnDashboard() {
  if (!isAdminAuthenticated()) {
    window.location.href = "login.html";
  }
}

function setupAdminLogin() {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;
  const errorEl = document.getElementById("adminLoginError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    // NOTE: Since this is a static site, credentials are only for obscurity,
    // not real security. You can adjust these or move to GitHub OAuth later.
    const validUsername = "admin";
    const validPassword = "3dprint";

    if (username === validUsername && password === validPassword) {
      localStorage.setItem(
        ADMIN_USER_KEY,
        JSON.stringify({ username, loggedInAt: new Date().toISOString() })
      );
      window.location.href = "dashboard.html";
    } else {
      if (errorEl) errorEl.classList.remove("hidden");
    }
  });
}

function setupAdminDashboardShell() {
  const page = document.body.getAttribute("data-page");
  if (page !== "admin-dashboard") return;

  requireAdminOnDashboard();

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem(ADMIN_USER_KEY);
    window.location.href = "login.html";
  });

  const tabs = document.querySelectorAll(".sidebar-tab");
  const tabContents = document.querySelectorAll(".admin-tab");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(targetId);
      if (target) target.classList.add("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  if (page === "admin-login") {
    setupAdminLogin();
  } else if (page === "admin-dashboard") {
    setupAdminDashboardShell();
  }
});


