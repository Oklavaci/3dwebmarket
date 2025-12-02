// Theme handling, shared utilities and small UI behaviors

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
  const params = {};
  const search = window.location.search.substring(1);
  if (!search) return params;
  search.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (!key) return;
    params[decodeURIComponent(key)] = decodeURIComponent(value || "");
  });
  return params;
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
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstElementChild;
}

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupYear();
});


