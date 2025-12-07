// Loading and rendering product list & detail pages

const PRODUCTS_JSON_PATH = "data/products.json";

async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_JSON_PATH, {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) throw new Error("Ürünler yüklenemedi");
    const data = await res.json();
    return Array.isArray(data.products) ? data.products : [];
  } catch (err) {
    console.error("Failed to load products:", err);
    return [];
  }
}

function normalizeImagePath(raw) {
  if (!raw) return "";
  // Remove leading slashes/backslashes
  let p = raw.replace(/^[\\/]+/, "");
  // Ensure path doesn't get doubled
  if (p.startsWith("data/")) {
    return p;
  }
  if (p.startsWith("images/")) {
    return "data/" + p;
  }
  return "data/" + p;
}

function buildProductCard(product) {
  const imageList = Array.isArray(product.imagePaths) ? product.imagePaths : product.imagePath ? [product.imagePath] : [];
  const firstPath = imageList[0] || "";
  const imgSrc = normalizeImagePath(firstPath);
  const stockClass = product.stockStatus || "in_stock";
  const stockLabelMap = { in_stock: "Stokta", made_to_order: "Sipariş Üzerine", out_of_stock: "Tükendi" };

  const safeName = escapeHtml(product.name || "");
  const safeCode = escapeHtml(product.code || "");
  const safeCategory = escapeHtml(product.category || "Genel");
  const safeDescShort = escapeHtml((product.description || "").slice(0, 120));
  const safeImgSrc = escapeHtml(imgSrc);

  const card = createElementFromHTML(`
    <article class="product-card">
      ${imgSrc ? `<div class="product-card-image"><img src="${safeImgSrc}" alt="${escapeHtml(product.name || '3D baskı ürün')}" loading="lazy"></div>` : ""}
      <header class="product-card-header">
        <div>
          <div class="product-code">${safeCode}</div>
          <h3 class="product-title">${safeName}</h3>
        </div>
        <span class="chip">${safeCategory}</span>
      </header>
      <p class="product-desc">${safeDescShort}${(product.description || "").length > 120 ? "…" : ""}</p>
      <div class="product-meta">
        <span class="stock-pill ${escapeHtml(stockClass)}">${stockLabelMap[stockClass] || "Durum Bilinmiyor"}</span>
      </div>
      <footer class="product-footer">
        <a href="product.html?id=${encodeURIComponent(product.id)}" class="btn ghost small">Detaya Git</a>
        <a href="https://wa.me/?text=${encodeURIComponent(product.whatsAppTemplate || `Merhaba, ${safeCode} kodlu ${safeName} ürünü hakkında bilgi almak istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="btn secondary small">WhatsApp</a>
      </footer>
    </article>
  `);

  return card;
}

async function renderHomeProductList() {
  const container = document.getElementById("product-list");
  const emptyState = document.getElementById("product-empty-state");
  if (!container) return;

  const products = await loadProducts();

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const stockFilter = document.getElementById("stockFilter");

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );
  categories.sort();
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter?.appendChild(opt);
  });

  function applyFilters() {
    const search = (searchInput?.value || "").toLowerCase();
    const cat = categoryFilter?.value || "";
    const stock = stockFilter?.value || "";

    const filtered = products.filter((p) => {
      const matchesSearch =
        !search ||
        (p.name || "").toLowerCase().includes(search) ||
        (p.code || "").toLowerCase().includes(search);
      const matchesCat = !cat || p.category === cat;
      const matchesStock = !stock || p.stockStatus === stock;
      return matchesSearch && matchesCat && matchesStock;
    });

    container.innerHTML = "";
    if (!filtered.length) {
      emptyState?.classList.remove("hidden");
      return;
    }
    emptyState?.classList.add("hidden");
    filtered.forEach((p) => container.appendChild(buildProductCard(p)));
  }

  searchInput?.addEventListener("input", applyFilters);
  categoryFilter?.addEventListener("change", applyFilters);
  stockFilter?.addEventListener("change", applyFilters);

  applyFilters();
}

async function renderProductDetailPage() {
  const root = document.getElementById("product-detail");
  const empty = document.getElementById("product-detail-empty");
  if (!root) return;

  const { id } = parseQueryParams();
  if (!id) {
    if (empty) empty.classList.remove("hidden");
    return;
  }

  const products = await loadProducts();
  const product = products.find((p) => String(p.id) === String(id));
  if (!product) {
    if (empty) empty.classList.remove("hidden");
    return;
  }

  const imageList = Array.isArray(product.imagePaths)
    ? product.imagePaths
    : product.imagePath
    ? [product.imagePath]
    : [];
  const firstPath = imageList[0] || "";
  const imgSrc = normalizeImagePath(firstPath);

  const stockLabelMap = {
    in_stock: "Stokta",
    made_to_order: "Sipariş Üzerine",
    out_of_stock: "Tükendi",
  };

  const safeName = escapeHtml(product.name || "");
  const safeCode = escapeHtml(product.code || "");
  const safeDesc = escapeHtml(product.description || "");
  const safeFilament = escapeHtml(product.filamentType || "-");
  const safeEstimated = escapeHtml(product.estimatedPrintTime || "-");
  const safeColors = escapeHtml((product.colorOptions || []).join(", ") || "-");
  const safeUsage = escapeHtml(product.usageNotes || "Belirtilmemiş.");
  const safeImgSrc = escapeHtml(imgSrc);

  const detail = createElementFromHTML(`
    <article class="card">
      <header>
        <div class="product-code">${safeCode}</div>
        <h1>${safeName}</h1>
      </header>
      ${imgSrc ? `<div class="product-detail-image"><img src="${safeImgSrc}" alt="${safeName || '3D baskı ürün'}" id="productMainImage"></div>` : ""}
      ${imageList.length > 1 ? `<div class="product-detail-thumbs">${imageList.map((p, i) => { const src = escapeHtml(normalizeImagePath(p || "")); return `<button type="button" class="product-detail-thumb${i === 0 ? ' active' : ''}" data-src="${src}"><img src="${src}" alt="${safeName || '3D baskı ürün'} küçük önizleme"></button>`; }).join("")}</div>` : ""}
      <p class="muted">${safeDesc}</p>
      <div class="product-meta product-meta--spaced">
        <span class="stock-pill ${escapeHtml(product.stockStatus || 'in_stock')}">${stockLabelMap[product.stockStatus || 'in_stock'] || 'Durum Bilinmiyor'}</span>
      </div>
      <dl class="small detail-grid">
        <div>
          <dt>Filament Türü</dt>
          <dd>${safeFilament}</dd>
        </div>
        <div>
          <dt>Tahmini Baskı Süresi</dt>
          <dd>${safeEstimated}</dd>
        </div>
        <div>
          <dt>Renk Seçenekleri</dt>
          <dd>${safeColors}</dd>
        </div>
      </dl>
      <section class="detail-section">
        <h2 class="detail-heading">Kullanım Notları</h2>
        <p class="small">${safeUsage}</p>
      </section>
      <footer class="detail-footer">
        <a href="https://wa.me/?text=${encodeURIComponent(product.whatsAppTemplate || `Merhaba, ${safeCode} kodlu ${safeName} ürünü 3D baskı olarak sipariş etmek istiyorum.`)}" target="_blank" rel="noopener noreferrer" class="btn primary small">WhatsApp ile Sipariş Ver</a>
        <a href="index.html" class="btn ghost small">Diğer Ürünlere Geri Dön</a>
      </footer>
    </article>
  `);

  root.innerHTML = "";
  root.appendChild(detail);
  // Thumbnail click behavior
  const mainImg = document.getElementById("productMainImage");
  const thumbs = root.querySelectorAll(".product-detail-thumb");
  thumbs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src");
      if (src && mainImg) {
        mainImg.setAttribute("src", src);
      }
      thumbs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  empty?.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  if (page === "home") {
    renderHomeProductList();
  } else if (page === "product-detail") {
    renderProductDetailPage();
  }
});


