/* products-clean.js
   Clean, scoped product renderer to replace a corrupted products.js.
*/
(function () {
  const PRODUCTS_JSON_PATH = 'data/products.json';
  let _cachedProducts = null;

  async function loadProducts() {
    if (_cachedProducts) return _cachedProducts;
    try {
      const res = await fetch(PRODUCTS_JSON_PATH, { headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) throw new Error('products.json load failed');
      const data = await res.json();
      _cachedProducts = Array.isArray(data.products) ? data.products : [];
      return _cachedProducts;
    } catch (err) {
      console.error(err);
      _cachedProducts = [];
      return _cachedProducts;
    }
  }

  function normalizeImagePath(raw) {
    if (!raw) return '';
    const p = String(raw).replace(/^[\\/]+/, '');
    if (p.startsWith('data/')) return p;
    if (p.startsWith('images/')) return 'data/' + p;
    return 'data/' + p;
  }

  function createProductCardDom(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const imageList = Array.isArray(product.imagePaths) ? product.imagePaths : product.imagePath ? [product.imagePath] : [];
    const firstPath = imageList[0] || '';
    const imgSrc = normalizeImagePath(firstPath);

    if (imgSrc) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'product-card-image';
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = product.name || '3D baskı ürün';
      img.loading = 'lazy';
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);
    }

    const header = document.createElement('header');
    header.className = 'product-card-header';
    const metaDiv = document.createElement('div');
    const codeDiv = document.createElement('div');
    codeDiv.className = 'product-code';
    codeDiv.textContent = product.code || '';
    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.name || '';
    metaDiv.appendChild(codeDiv);
    metaDiv.appendChild(title);
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = product.category || 'Genel';
    header.appendChild(metaDiv);
    header.appendChild(chip);
    card.appendChild(header);

    const desc = document.createElement('p');
    desc.className = 'product-desc';
    desc.textContent = product.description || '';

    card.appendChild(desc);

    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const pill = document.createElement('span');
    pill.className = 'stock-pill ' + (product.stockStatus || 'in_stock');
    const stockLabelMap = { in_stock: 'Stokta', made_to_order: 'Sipariş Üzerine', out_of_stock: 'Tükendi' };
    pill.textContent = stockLabelMap[product.stockStatus] || 'Durum Bilinmiyor';
    meta.appendChild(pill);
    card.appendChild(meta);

    const footer = document.createElement('footer');
    footer.className = 'product-footer';
    const link = document.createElement('a');
    link.href = 'product.html?id=' + encodeURIComponent(String(product.id));
    link.className = 'btn ghost small';
    link.textContent = 'Detaya Git';
    footer.appendChild(link);

    const wa = document.createElement('a');
    const waText = product.whatsAppTemplate || ('Merhaba, ' + (product.code || '') + ' kodlu ' + (product.name || '') + ' ürünü hakkında bilgi almak istiyorum.');
    wa.href = `https://wa.me/${APP_CONFIG.WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(waText)}`;
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.className = 'btn secondary small';
    wa.textContent = 'WhatsApp';
    footer.appendChild(wa);

    card.appendChild(footer);
    return card;
  }

  async function renderHomeProductList() {
    const container = document.getElementById('product-list');
    const emptyState = document.getElementById('product-empty-state');
    if (!container) return;
    const products = await loadProducts();

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');

    // populate categories
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
    if (categoryFilter) {
      cats.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c; opt.textContent = c; categoryFilter.appendChild(opt);
      });
    }

    function apply() {
      const q = (searchInput?.value || '').toLowerCase();
      const cat = categoryFilter?.value || '';
      const stock = stockFilter?.value || '';
      const filtered = products.filter((p) => {
        const name = String(p.name || '').toLowerCase();
        const code = String(p.code || '').toLowerCase();
        if (q && !name.includes(q) && !code.includes(q)) return false;
        if (cat && p.category !== cat) return false;
        if (stock && p.stockStatus !== stock) return false;
        return true;
      });

      container.innerHTML = '';
      if (!filtered.length) { emptyState?.classList.remove('hidden'); return; }
      emptyState?.classList.add('hidden');
      filtered.forEach((p) => container.appendChild(createProductCardDom(p)));
    }

    searchInput?.addEventListener('input', apply);
    categoryFilter?.addEventListener('change', apply);
    stockFilter?.addEventListener('change', apply);
    apply();
  }

  async function renderProductDetailPage() {
    const root = document.getElementById('product-detail');
    const empty = document.getElementById('product-detail-empty');
    if (!root) return;
    const { id } = parseQueryParams();
    if (!id) { empty?.classList.remove('hidden'); return; }
    const products = await loadProducts();
    const product = products.find((p) => String(p.id) === String(id));
    if (!product) { empty?.classList.remove('hidden'); return; }

    root.innerHTML = '';
    const card = document.createElement('section');
    card.className = 'card';

    const code = document.createElement('div'); code.className = 'product-code'; code.textContent = product.code || '';
    const h1 = document.createElement('h1'); h1.textContent = product.name || '';
    const header = document.createElement('header'); header.appendChild(code); header.appendChild(h1);
    card.appendChild(header);

    const imageList = Array.isArray(product.imagePaths) ? product.imagePaths : product.imagePath ? [product.imagePath] : [];
    if (imageList.length) {
      const img = document.createElement('img'); img.id = 'productMainImage'; img.src = normalizeImagePath(imageList[0]); img.alt = product.name || '';
      const wrap = document.createElement('div'); wrap.className = 'product-detail-image'; wrap.appendChild(img); card.appendChild(wrap);
    }

    const desc = document.createElement('p'); desc.className = 'muted'; desc.textContent = product.description || ''; card.appendChild(desc);

    const meta = document.createElement('div'); meta.className = 'product-meta product-meta--spaced';
    const pill = document.createElement('span'); pill.className = 'stock-pill ' + (product.stockStatus || 'in_stock');
    const stockLabelMap = { in_stock: 'Stokta', made_to_order: 'Sipariş Üzerine', out_of_stock: 'Tükendi' };
    pill.textContent = stockLabelMap[product.stockStatus] || 'Durum Bilinmiyor'; meta.appendChild(pill); card.appendChild(meta);

    const dl = document.createElement('dl'); dl.className = 'small detail-grid';
    const d1 = document.createElement('div'); d1.innerHTML = '<dt>Filament Türü</dt><dd>' + (product.filamentType || '-') + '</dd>';
    const d2 = document.createElement('div'); d2.innerHTML = '<dt>Tahmini Baskı Süresi</dt><dd>' + (product.estimatedPrintTime || '-') + '</dd>';
    const d3 = document.createElement('div'); d3.innerHTML = '<dt>Renk Seçenekleri</dt><dd>' + ((product.colorOptions || []).join(', ') || '-') + '</dd>';
    dl.appendChild(d1); dl.appendChild(d2); dl.appendChild(d3); card.appendChild(dl);

    const section = document.createElement('section'); section.className = 'detail-section'; section.innerHTML = '<h2 class="detail-heading">Kullanım Notları</h2><p class="small">' + (product.usageNotes || 'Belirtilmemiş.') + '</p>';
    card.appendChild(section);

    const footer = document.createElement('footer'); footer.className = 'detail-footer';
    const wa = document.createElement('a'); wa.className = 'btn primary small'; wa.target = '_blank'; wa.rel = 'noopener noreferrer';
    const waText = product.whatsAppTemplate || ('Merhaba, ' + (product.code || '') + ' kodlu ' + (product.name || '') + ' ürünü 3D baskı olarak sipariş etmek istiyorum.');
    wa.href = `https://wa.me/${APP_CONFIG.WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(waText)}`;
    wa.textContent = 'WhatsApp ile Sipariş Ver'; footer.appendChild(wa);
    const back = document.createElement('a'); back.href = 'index.html'; back.className = 'btn ghost small'; back.textContent = 'Diğer Ürünlere Geri Dön'; footer.appendChild(back);
    card.appendChild(footer);

    root.appendChild(card);
    empty?.classList.add('hidden');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'home') renderHomeProductList();
    else if (page === 'product-detail') renderProductDetailPage();
  });
})();
