// Admin product CRUD using sessionStorage as working copy (client-side draft)

const ADMIN_PRODUCTS_KEY = "3dprint_admin_products_draft";
let currentProductEditIndex = null;

async function loadBaseProductsForAdmin() {
  try {
    const res = await fetch("../data/products.json");
    if (!res.ok) throw new Error("products.json okunamadı");
    const data = await res.json();
    return Array.isArray(data.products) ? data.products : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function getAdminProducts() {
  const draft = sessionStorage.getItem(ADMIN_PRODUCTS_KEY);
  if (draft) {
    try {
      const parsed = JSON.parse(draft);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return await loadBaseProductsForAdmin();
}

async function saveAdminProducts(products) {
  sessionStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
}

function generateProductCode(lastNumericId) {
  const num = String(lastNumericId).padStart(6, "0");
  return `FD-${num}`;
}

function openProductForm(mode, product, codePreview) {
  const panel = document.getElementById("adminProductFormPanel");
  if (!panel) return;
  panel.classList.remove("hidden");

  const titleEl = document.getElementById("adminProductFormTitle");
  if (titleEl) {
    titleEl.textContent =
      mode === "edit" ? "Ürünü Düzenle" : "Yeni Ürün Ekle";
  }

  // Fill form fields
  document.getElementById("apName").value = product?.name || "";
  document.getElementById("apCategory").value = product?.category || "";
  document.getElementById("apStockStatus").value =
    product?.stockStatus || "made_to_order";
  document.getElementById("apFilament").value =
    product?.filamentType || "PLA";
  document.getElementById("apEstimatedTime").value =
    product?.estimatedPrintTime || "";
  document.getElementById("apImagePath").value =
    (Array.isArray(product?.imagePaths)
      ? product.imagePaths[0]
      : product?.imagePath) || "";
  document.getElementById("apColors").value = Array.isArray(
    product?.colorOptions
  )
    ? product.colorOptions.join(", ")
    : "";
  document.getElementById("apUsageNotes").value =
    product?.usageNotes || "";

  const codeLabel = document.getElementById("apCodePreview");
  if (codeLabel) {
    codeLabel.textContent = codePreview || product?.code || "-";
  }
}

function closeProductForm() {
  const panel = document.getElementById("adminProductFormPanel");
  if (panel) panel.classList.add("hidden");
  currentProductEditIndex = null;
}

async function renderAdminProductsSection() {
  const root = document.getElementById("adminProductsRoot");
  if (!root) return;

  const products = await getAdminProducts();

  const wrapper = document.createElement("div");
  const count = products.length;
  wrapper.innerHTML = `
    <div class="small muted">
      Toplam ürün: <strong>${count}</strong> (Değişiklikler şu an yalnızca bu tarayıcıda tutuluyor)
    </div>
    <div class="admin-actions">
      <button type="button" class="btn primary small" id="addProductBtn">Yeni Ürün Ekle</button>
      <button type="button" class="btn ghost small" id="resetProductsBtn">Taslakları Sıfırla</button>
    </div>
    <table class="admin-products-table">
      <thead>
        <tr>
          <th>Kod</th>
          <th>İsim</th>
          <th>Kategori</th>
          <th>Stok</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="adminProductsTbody"></tbody>
    </table>
    <section id="adminProductFormPanel" class="admin-product-form hidden">
      <div class="admin-product-form-header">
        <h2 id="adminProductFormTitle">Yeni Ürün Ekle</h2>
        <button type="button" class="icon-button" id="apCloseBtn" aria-label="Formu kapat">✕</button>
      </div>
      <form id="adminProductForm" class="form-grid">
        <div class="field">
          <label for="apName">Ürün Adı</label>
          <input id="apName" required />
        </div>
        <div class="field">
          <label for="apCategory">Kategori</label>
          <input id="apCategory" placeholder="Örn: Masaüstü Aksesuar" />
        </div>
        <div class="field">
          <label for="apStockStatus">Stok Durumu</label>
          <select id="apStockStatus">
            <option value="in_stock">Stokta</option>
            <option value="made_to_order">Sipariş Üzerine</option>
            <option value="out_of_stock">Tükendi</option>
          </select>
        </div>
        <div class="field">
          <label for="apFilament">Filament Türü</label>
          <select id="apFilament">
            <option value="PLA">PLA</option>
            <option value="PETG">PETG</option>
            <option value="ABS">ABS</option>
          </select>
        </div>
        <div class="field">
          <label for="apEstimatedTime">Tahmini Baskı Süresi</label>
          <input id="apEstimatedTime" placeholder="Örn: 3 saat" />
        </div>
        <div class="field">
          <label for="apImagePath">Ana Görsel Yolu</label>
          <input id="apImagePath" placeholder="images/products/..." />
          <input id="apImagePath" placeholder="data/images/products/..." />
        </div>
        <div class="field">
          <label for="apImageFile">Görsel Yükle (opsiyonel)</label>
          <input id="apImageFile" type="file" accept="image/*" />
          <div class="small muted"><button type="button" class="btn ghost small" id="apUploadImageBtn">GitHub'a Yükle</button> <span id="apUploadStatus" class="small muted"></span></div>
        </div>
        <div class="field full-width">
          <label for="apColors">Renk Seçenekleri (virgülle ayır)</label>
          <input id="apColors" placeholder="Siyah, Beyaz, Kırmızı" />
        </div>
        <div class="field full-width">
          <label for="apUsageNotes">Kullanım Notları</label>
          <textarea id="apUsageNotes" rows="2"></textarea>
        </div>
        <div class="small muted full-width">
          Ürün kodu: <strong id="apCodePreview">-</strong> (otomatik oluşturulur)
        </div>
        <div class="actions full-width">
          <button type="submit" class="btn primary small">Kaydet</button>
          <button type="button" class="btn ghost small" id="apCancelBtn">Vazgeç</button>
        </div>
      </form>
    </section>
  `;

  root.innerHTML = "";
  root.appendChild(wrapper);

  const tbody = document.getElementById("adminProductsTbody");
  products.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(p.code || "")}</td>
      <td>${escapeHtml(p.name || "")}</td>
      <td>${escapeHtml(p.category || "")}</td>
      <td>${escapeHtml(p.stockStatus || "")}</td>
      <td>
        <button type="button" class="btn ghost small" data-action="edit" data-idx="${idx}">Düzenle</button>
        <button type="button" class="btn ghost small" data-action="delete" data-idx="${idx}">Sil</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.addEventListener("click", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute("data-action");
    const idxStr = target.getAttribute("data-idx");
    if (!action || idxStr == null) return;
    const index = Number(idxStr);
    if (Number.isNaN(index)) return;

    let list = await getAdminProducts();

    if (action === "delete") {
      if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
      list.splice(index, 1);
      await saveAdminProducts(list);
      renderAdminProductsSection();
    } else if (action === "edit") {
      currentProductEditIndex = index;
      const current = list[index];
      openProductForm("edit", current);
    }
  });

  document
    .getElementById("addProductBtn")
    ?.addEventListener("click", async () => {
      const list = await getAdminProducts();
      const lastId = list.reduce(
        (max, p) => Math.max(max, Number(p.id) || 0),
        0
      );
      const newId = lastId + 1;
      const code = generateProductCode(newId);
      currentProductEditIndex = null;
      openProductForm("create", null, code);
    });

  document
    .getElementById("resetProductsBtn")
    ?.addEventListener("click", async () => {
      if (
        !confirm(
          "Taslak ürünleri sıfırlamak istediğinize emin misiniz? (products.json yeniden yüklenecek)"
        )
      )
        return;
      sessionStorage.removeItem(ADMIN_PRODUCTS_KEY);
      closeProductForm();
      renderAdminProductsSection();
    });

  document.getElementById("apCloseBtn")?.addEventListener("click", () => {
    closeProductForm();
  });
  document.getElementById("apCancelBtn")?.addEventListener("click", () => {
    closeProductForm();
  });

  const form = document.getElementById("adminProductForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("apName").value.trim();
      if (!name) {
        alert("Lütfen ürün adını girin.");
        return;
      }
      const category = document
        .getElementById("apCategory")
        .value.trim();
      const stockStatus =
        document.getElementById("apStockStatus").value;
      const filamentType =
        document.getElementById("apFilament").value;
      const estimatedPrintTime = document
        .getElementById("apEstimatedTime")
        .value.trim();
      const imagePath = document
        .getElementById("apImagePath")
        .value.trim();
      const colorsRaw = document
        .getElementById("apColors")
        .value.trim();
      const usageNotes = document
        .getElementById("apUsageNotes")
        .value.trim();

      let list = await getAdminProducts();
      const now = new Date().toISOString();

      if (currentProductEditIndex != null) {
        const idx = currentProductEditIndex;
        const existing = list[idx];
        existing.name = name;
        existing.category = category || existing.category;
        existing.stockStatus = stockStatus;
        existing.filamentType = filamentType;
        existing.estimatedPrintTime = estimatedPrintTime;
        existing.usageNotes = usageNotes;
        existing.updatedAt = now;
        if (imagePath) {
          existing.imagePath = imagePath;
          existing.imagePaths = [imagePath];
        }
        existing.colorOptions = colorsRaw
          ? colorsRaw.split(",").map((c) => c.trim()).filter(Boolean)
          : [];
        await saveAdminProducts(list);
      } else {
        const lastId = list.reduce(
          (max, p) => Math.max(max, Number(p.id) || 0),
          0
        );
        const newId = lastId + 1;
        const code = generateProductCode(newId);
        const product = {
          id: String(newId),
          code,
          name,
          description: "",
          usageNotes,
          category: category || "Genel",
          price: 0,
          currency: "TRY",
          filamentType,
          colorOptions: colorsRaw
            ? colorsRaw
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : [],
          estimatedPrintTime,
          stockStatus,
          imagePath: imagePath || "",
          imagePaths: imagePath ? [imagePath] : [],
          whatsAppTemplate: `Merhaba, ${code} kodlu *${name}* ürününü 3D baskı olarak sipariş etmek istiyorum.`,
          createdAt: now,
          updatedAt: now,
        };
        list.push(product);
        await saveAdminProducts(list);
      }

      closeProductForm();
      renderAdminProductsSection();
    });
  }

  // Image upload button handler
  const uploadBtn = document.getElementById('apUploadImageBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const fileInput = document.getElementById('apImageFile');
      const status = document.getElementById('apUploadStatus');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert('Lütfen önce bir görsel seçin.');
        return;
      }
      const file = fileInput.files[0];
      // Construct path
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '-');
      const timestamp = Date.now();
      const path = `data/images/products/${timestamp}-${safeName}`;
      if (status) status.textContent = 'Yükleniyor...';
      try {
        // uploadImageToGithub is provided by github-integration.js
        const uploadedPath = await uploadImageToGithub(path, file);
        document.getElementById('apImagePath').value = uploadedPath;
        if (status) status.textContent = 'Yüklendi: ' + uploadedPath;
      } catch (err) {
        console.error(err);
        if (status) status.textContent = 'Yükleme başarısız: ' + (err && err.message ? err.message : err);
        alert('Görsel yükleme başarısız: ' + (err && err.message ? err.message : err));
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  if (page === "admin-dashboard") {
    renderAdminProductsSection();
  }
});


