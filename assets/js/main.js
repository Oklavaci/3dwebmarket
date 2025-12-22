
// Theme handling, shared utilities and small UI behaviors

// Global WhatsApp business number for all product links
const BUSINESS_WHATSAPP_NUMBER = "+905308563042"; // <-- Set your WhatsApp number here

const THEME_STORAGE_KEY = "3dprint_theme";
const ADMIN_TOKEN_KEY = "3dprint_admin_token";

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = theme === "dark" ? "🌙" : "☀️";
  }
}

function setupThemeToggle() {
  const theme = getPreferredTheme();
  applyTheme(theme);

  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  });
}

function setupYear() {
  const span = document.getElementById("year");
  if (span) {
    span.textContent = new Date().getFullYear().toString();
  }
}

function parseQueryParams() {
  // Use URLSearchParams which correctly handles encoding and multiple values
  try {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  } catch (e) {
    return {};
  }
}

function formatPrice(value, currency) {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "TRY",
      maximumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    return `${value} ${currency || "TRY"}`;
  }
}

function createElementFromHTML(htmlString) {
  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  return template.content.firstElementChild;
}

// Escape HTML to avoid XSS when inserting untrusted content into templates
function escapeHtml(unsafe) {
  if (unsafe == null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Basic phone validation: allow 10-13 digits after removing non-digit chars
function validatePhone(input) {
  if (!input) return false;
  const digits = String(input).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupYear();
});


