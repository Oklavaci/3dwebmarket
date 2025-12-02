// GitHub REST API integration placeholders for static admin panel
// NOTE: For security, never hard-code personal access tokens in this file.
// The admin can paste a token in the UI, which is then stored in localStorage.

const GITHUB_SETTINGS_KEY = "3dprint_github_settings";

function getGithubSettings() {
  const raw = localStorage.getItem(GITHUB_SETTINGS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveGithubSettings(settings) {
  localStorage.setItem(GITHUB_SETTINGS_KEY, JSON.stringify(settings));
}

async function githubApiRequest(path, { method = "GET", body } = {}) {
  const settings = getGithubSettings();
  if (!settings || !settings.token || !settings.repo || !settings.owner) {
    throw new Error("GitHub ayarları eksik");
  }

  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${settings.token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub isteği başarısız: ${res.status} ${text}`);
  }
  return res.json();
}

function renderGithubSettings() {
  const root = document.getElementById("githubSettingsRoot");
  if (!root) return;

  const current = getGithubSettings() || {
    owner: "mevlut-celik",
    repo: "3dprint-site",
    branch: "main",
    token: "",
  };

  root.innerHTML = `
    <div class="github-settings-grid">
      <div class="field">
        <label for="ghOwner">GitHub Kullanıcı / Organizasyon</label>
        <input id="ghOwner" value="${current.owner || ""}" />
      </div>
      <div class="field">
        <label for="ghRepo">Repo Adı</label>
        <input id="ghRepo" value="${current.repo || ""}" />
      </div>
      <div class="field">
        <label for="ghBranch">Branch</label>
        <input id="ghBranch" value="${current.branch || "main"}" />
      </div>
      <div class="field">
        <label for="ghToken">Kişisel Erişim Token'ı</label>
        <input id="ghToken" type="password" placeholder="Token'ı buraya yapıştırın" />
        <span class="small muted">Token yalnızca bu tarayıcıda localStorage içinde tutulur.</span>
      </div>
      <div class="actions">
        <button type="button" class="btn primary small" id="saveGhSettingsBtn">Ayarları Kaydet</button>
        <button type="button" class="btn ghost small" id="testGhSettingsBtn">Bağlantıyı Test Et</button>
      </div>
      <div class="small" id="ghStatusArea"></div>
    </div>
  `;

  const statusArea = document.getElementById("ghStatusArea");

  document
    .getElementById("saveGhSettingsBtn")
    ?.addEventListener("click", () => {
      const owner = document.getElementById("ghOwner").value.trim();
      const repo = document.getElementById("ghRepo").value.trim();
      const branch = document.getElementById("ghBranch").value.trim();
      const token = document.getElementById("ghToken").value.trim() || current.token;

      saveGithubSettings({ owner, repo, branch, token });
      if (statusArea) {
        statusArea.innerHTML =
          '<span class="status-pill">Ayarlar kaydedildi (yalnızca bu tarayıcıda).</span>';
      }
    });

  document
    .getElementById("testGhSettingsBtn")
    ?.addEventListener("click", async () => {
      if (statusArea) {
        statusArea.innerHTML = "Bağlantı test ediliyor...";
      }
      try {
        const settings = getGithubSettings();
        if (!settings || !settings.token) {
          throw new Error("Önce token içeren ayarları kaydedin.");
        }
        await githubApiRequest(
          `/repos/${settings.owner}/${settings.repo}`,
          {}
        );
        if (statusArea) {
          statusArea.innerHTML =
            '<span class="status-pill">GitHub bağlantısı başarılı.</span>';
        }
      } catch (err) {
        console.error(err);
        if (statusArea) {
          statusArea.innerHTML = `<span class="status-pill error">Hata: ${
            err.message || err
          }</span>`;
        }
      }
    });
}

// Example placeholder for committing products.json changes in the future.
// For full implementation, we would:
// 1. Fetch current file sha from GitHub
// 2. Base64 encode new JSON content
// 3. PUT to /repos/{owner}/{repo}/contents/data/products.json
async function pushProductsJsonToGithub(newProductsJsonString) {
  const settings = getGithubSettings();
  if (!settings) throw new Error("GitHub ayarları eksik");
  // Implementation intentionally left minimal to avoid accidental writes.
  console.log(
    "pushProductsJsonToGithub called with",
    newProductsJsonString.length,
    "bytes"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  if (page === "admin-dashboard") {
    renderGithubSettings();
  }
});


