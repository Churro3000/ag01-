// =============================================
// ACTIVE GENERATION — ADMIN JS
// =============================================

// ── DEFAULT CREDENTIALS (stored in localStorage) ──
function getCredentials() {
  return {
    username: localStorage.getItem('ag_admin_user') || 'admin',
    password: localStorage.getItem('ag_admin_pass') || 'AG@2025!'
  };
}

// ── LOGIN ──
function doLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const creds = getCredentials();
  const errorEl = document.getElementById('loginError');

  if (user === creds.username && pass === creds.password) {
    sessionStorage.setItem('ag_authed', '1');
    sessionStorage.setItem('ag_authed_user', user);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'flex';
    document.getElementById('adminUsername').textContent = user;
    initAdmin();
    errorEl.style.display = 'none';
  } else {
    errorEl.style.display = 'flex';
    document.getElementById('loginPass').value = '';
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') doLogin();
});

function doLogout() {
  sessionStorage.removeItem('ag_authed');
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function togglePassVis() {
  const inp = document.getElementById('loginPass');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

// ── AUTO LOGIN CHECK ──
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('ag_authed')) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'flex';
    document.getElementById('adminUsername').textContent = sessionStorage.getItem('ag_authed_user') || 'admin';
    initAdmin();
  }
});

// ── INIT ──
function initAdmin() {
  renderAdminProducts();
  renderAdminSchedule();
  renderAdminCountries();
  loadSettings();
}

// ── SIDEBAR TOGGLE ──
function toggleSidebar() {
  document.getElementById('adminSidebar').classList.toggle('mobile-open');
}

// ── TABS ──
const tabTitles = { products: 'Products', schedule: 'Training Schedule', tournaments: 'Tournaments', settings: 'Settings' };
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelectorAll('.sidebar-link').forEach(l => {
    if (l.getAttribute('onclick').includes(`'${name}'`)) l.classList.add('active');
  });
  document.getElementById('adminPageTitle').textContent = tabTitles[name];
}

// ── TOAST ──
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── MODAL HELPERS ──
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── CONFIRM DELETE ──
function confirmDelete(msg, onConfirm) {
  document.getElementById('confirmMsg').textContent = msg;
  const btn = document.getElementById('confirmDeleteBtn');
  btn.onclick = () => { onConfirm(); closeModal('confirmModal'); };
  openModal('confirmModal');
}

// ═══════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════
function renderAdminProducts() {
  const products = AG.getProducts();
  const grid = document.getElementById('adminProductsGrid');
  if (products.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray);grid-column:1/-1;">No products yet. Click "Add Product" to get started.</p>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="admin-product-card">
      <div class="prod-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<i class="fas fa-${p.category === 'equipment' ? 'crosshairs' : 'tshirt'}"></i>`}
      </div>
      <div class="admin-product-info">
        <div class="prod-name">${p.name}
          <span class="prod-stock-badge ${p.inStock ? 'in' : 'out'}">${p.inStock ? 'In Stock' : 'Hidden'}</span>
        </div>
        <div class="prod-price">${p.currency}${p.price.toFixed(2)}</div>
        <div class="prod-meta">${p.category}${p.hasSizes ? ' · Sizes: ' + p.sizes.join(', ') : ''}</div>
        <div class="admin-card-actions">
          <button class="btn-icon edit" onclick="openProductModal(${p.id})"><i class="fas fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function openProductModal(id = null) {
  document.getElementById('productModalTitle').textContent = id ? 'Edit Product' : 'Add Product';
  document.getElementById('productId').value = id || '';
  if (id) {
    const p = AG.getProducts().find(x => x.id === id);
    if (!p) return;
    document.getElementById('productName').value = p.name;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productDesc').value = p.description;
    document.getElementById('productImage').value = p.image;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productBadge').value = p.badge;
    document.getElementById('productHasSizes').checked = p.hasSizes;
    document.getElementById('productSizes').value = p.sizes.join(', ');
    document.getElementById('productInStock').checked = p.inStock;
    document.getElementById('sizesGroup').style.display = p.hasSizes ? 'block' : 'none';
    previewImage();
  } else {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDesc').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productCategory').value = 'apparel';
    document.getElementById('productBadge').value = '';
    document.getElementById('productHasSizes').checked = false;
    document.getElementById('productSizes').value = '';
    document.getElementById('productInStock').checked = true;
    document.getElementById('sizesGroup').style.display = 'none';
    document.getElementById('imgPreview').style.display = 'none';
  }
  openModal('productModal');
}

function toggleSizesInput() {
  document.getElementById('sizesGroup').style.display =
    document.getElementById('productHasSizes').checked ? 'block' : 'none';
}

function previewImage() {
  const url = document.getElementById('productImage').value.trim();
  const preview = document.getElementById('imgPreview');
  const img = document.getElementById('imgPreviewEl');
  if (url) { img.src = url; preview.style.display = 'block'; }
  else { preview.style.display = 'none'; }
}

function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  if (!name || isNaN(price)) { showToast('Please fill in required fields.', 'error'); return; }

  const products = AG.getProducts();
  const id = document.getElementById('productId').value;
  const hasSizes = document.getElementById('productHasSizes').checked;
  const sizesRaw = document.getElementById('productSizes').value;
  const sizes = hasSizes ? sizesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const product = {
    id: id ? parseInt(id) : Date.now(),
    name,
    price,
    currency: 'P',
    description: document.getElementById('productDesc').value.trim(),
    image: document.getElementById('productImage').value.trim(),
    category: document.getElementById('productCategory').value,
    badge: document.getElementById('productBadge').value,
    hasSizes,
    sizes,
    inStock: document.getElementById('productInStock').checked
  };

  if (id) {
    const idx = products.findIndex(p => p.id === parseInt(id));
    if (idx > -1) products[idx] = product;
  } else {
    products.push(product);
  }

  AG.saveProducts(products);
  renderAdminProducts();
  closeModal('productModal');
  showToast(id ? 'Product updated!' : 'Product added!');
}

function deleteProduct(id) {
  confirmDelete('Are you sure you want to delete this product?', () => {
    const products = AG.getProducts().filter(p => p.id !== id);
    AG.saveProducts(products);
    renderAdminProducts();
    showToast('Product deleted.');
  });
}

// ═══════════════════════════════════
// SCHEDULE
// ═══════════════════════════════════
function getSchedule() {
  const stored = localStorage.getItem('ag_schedule');
  if (stored) return JSON.parse(stored);
  return [
    { id: 1, day: 'Monday', start: '06:00', end: '08:00', type: 'Morning Session', level: 'beginner', featured: false },
    { id: 2, day: 'Wednesday', start: '17:00', end: '19:00', type: 'Evening Session', level: 'intermediate', featured: false },
    { id: 3, day: 'Saturday', start: '08:00', end: '12:00', type: 'Full Morning Session', level: 'all', featured: true },
    { id: 4, day: 'Sunday', start: '09:00', end: '11:00', type: 'Open Range', level: 'advanced', featured: false }
  ];
}
function saveSchedule_data(data) { localStorage.setItem('ag_schedule', JSON.stringify(data)); }

function renderAdminSchedule() {
  const schedule = getSchedule();
  const list = document.getElementById('adminScheduleList');
  if (schedule.length === 0) {
    list.innerHTML = '<p style="color:var(--gray);">No sessions yet.</p>';
    return;
  }
  list.innerHTML = schedule.map(s => `
    <div class="admin-schedule-item">
      <div class="schedule-item-info">
        <div class="schedule-item-day">${s.day} ${s.featured ? '⭐' : ''}</div>
        <div class="schedule-item-time">${s.start} – ${s.end}</div>
        <div class="schedule-item-type">${s.type} · ${s.level}</div>
      </div>
      <div class="admin-card-actions">
        <button class="btn-icon edit" onclick="openScheduleModal(${s.id})"><i class="fas fa-pen"></i></button>
        <button class="btn-icon delete" onclick="deleteSchedule(${s.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function openScheduleModal(id = null) {
  document.getElementById('scheduleModalTitle').textContent = id ? 'Edit Session' : 'Add Training Session';
  document.getElementById('scheduleId').value = id || '';
  if (id) {
    const s = getSchedule().find(x => x.id === id);
    if (!s) return;
    document.getElementById('scheduleDay').value = s.day;
    document.getElementById('scheduleStart').value = s.start;
    document.getElementById('scheduleEnd').value = s.end;
    document.getElementById('scheduleType').value = s.type;
    document.getElementById('scheduleLevel').value = s.level;
    document.getElementById('scheduleFeatured').checked = s.featured;
  } else {
    document.getElementById('scheduleDay').value = 'Monday';
    document.getElementById('scheduleStart').value = '';
    document.getElementById('scheduleEnd').value = '';
    document.getElementById('scheduleType').value = '';
    document.getElementById('scheduleLevel').value = 'all';
    document.getElementById('scheduleFeatured').checked = false;
  }
  openModal('scheduleModal');
}

function saveSchedule() {
  const start = document.getElementById('scheduleStart').value;
  const end = document.getElementById('scheduleEnd').value;
  if (!start || !end) { showToast('Please fill in required fields.', 'error'); return; }

  const data = getSchedule();
  const id = document.getElementById('scheduleId').value;
  const session = {
    id: id ? parseInt(id) : Date.now(),
    day: document.getElementById('scheduleDay').value,
    start,
    end,
    type: document.getElementById('scheduleType').value.trim() || 'Training Session',
    level: document.getElementById('scheduleLevel').value,
    featured: document.getElementById('scheduleFeatured').checked
  };

  if (id) {
    const idx = data.findIndex(s => s.id === parseInt(id));
    if (idx > -1) data[idx] = session;
  } else {
    data.push(session);
  }

  saveSchedule_data(data);
  renderAdminSchedule();
  closeModal('scheduleModal');
  showToast(id ? 'Session updated!' : 'Session added!');
}

function deleteSchedule(id) {
  confirmDelete('Delete this training session?', () => {
    const data = getSchedule().filter(s => s.id !== id);
    saveSchedule_data(data);
    renderAdminSchedule();
    showToast('Session deleted.');
  });
}

// ═══════════════════════════════════
// COUNTRIES
// ═══════════════════════════════════
function getCountries() {
  const stored = localStorage.getItem('ag_countries');
  if (stored) return JSON.parse(stored);
  return [
    { id: 1, name: 'Botswana', flag: '🇧🇼', detail: 'National Championships' },
    { id: 2, name: 'South Africa', flag: '🇿🇦', detail: 'Regional Invitational' },
    { id: 3, name: 'Zimbabwe', flag: '🇿🇼', detail: 'SADC Cup' },
    { id: 4, name: 'Namibia', flag: '🇳🇦', detail: 'Southern Africa Open' },
    { id: 5, name: 'Kenya', flag: '🇰🇪', detail: 'Africa Championships' },
    { id: 6, name: 'Mauritius', flag: '🇲🇺', detail: 'Island Games' }
  ];
}
function saveCountries_data(data) { localStorage.setItem('ag_countries', JSON.stringify(data)); }

function renderAdminCountries() {
  const countries = getCountries();
  const list = document.getElementById('adminCountriesList');
  list.innerHTML = countries.map(c => `
    <div class="admin-country-item">
      <div class="country-item-info">
        <div class="country-item-flag">${c.flag}</div>
        <div>
          <div class="country-item-name">${c.name}</div>
          <div class="country-item-detail">${c.detail}</div>
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="btn-icon edit" onclick="openCountryModal(${c.id})"><i class="fas fa-pen"></i></button>
        <button class="btn-icon delete" onclick="deleteCountry(${c.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function openCountryModal(id = null) {
  document.getElementById('countryId').value = id || '';
  if (id) {
    const c = getCountries().find(x => x.id === id);
    if (!c) return;
    document.getElementById('countryName').value = c.name;
    document.getElementById('countryFlag').value = c.flag;
    document.getElementById('countryDetail').value = c.detail;
  } else {
    document.getElementById('countryName').value = '';
    document.getElementById('countryFlag').value = '';
    document.getElementById('countryDetail').value = '';
  }
  openModal('countryModal');
}

function saveCountry() {
  const name = document.getElementById('countryName').value.trim();
  const flag = document.getElementById('countryFlag').value.trim();
  if (!name || !flag) { showToast('Please fill in required fields.', 'error'); return; }

  const data = getCountries();
  const id = document.getElementById('countryId').value;
  const country = {
    id: id ? parseInt(id) : Date.now(),
    name,
    flag,
    detail: document.getElementById('countryDetail').value.trim()
  };

  if (id) {
    const idx = data.findIndex(c => c.id === parseInt(id));
    if (idx > -1) data[idx] = country;
  } else {
    data.push(country);
  }

  saveCountries_data(data);
  renderAdminCountries();
  closeModal('countryModal');
  showToast(id ? 'Country updated!' : 'Country added!');
}

function deleteCountry(id) {
  confirmDelete('Delete this country entry?', () => {
    const data = getCountries().filter(c => c.id !== id);
    saveCountries_data(data);
    renderAdminCountries();
    showToast('Country deleted.');
  });
}

// ═══════════════════════════════════
// SETTINGS
// ═══════════════════════════════════
function loadSettings() {
  const wa = localStorage.getItem('ag_whatsapp') || AG.WHATSAPP;
  document.getElementById('settingsWA').value = wa;
}

function saveWhatsApp() {
  const num = document.getElementById('settingsWA').value.trim();
  if (!num) { showToast('Please enter a number.', 'error'); return; }
  localStorage.setItem('ag_whatsapp', num);
  AG.WHATSAPP = num;
  showToast('WhatsApp number saved!');
}

function changePassword() {
  const p1 = document.getElementById('newPass1').value;
  const p2 = document.getElementById('newPass2').value;
  const msg = document.getElementById('passMsg');
  if (!p1 || p1.length < 6) {
    msg.textContent = 'Password must be at least 6 characters.';
    msg.className = 'settings-msg err'; msg.style.display = 'block'; return;
  }
  if (p1 !== p2) {
    msg.textContent = 'Passwords do not match.';
    msg.className = 'settings-msg err'; msg.style.display = 'block'; return;
  }
  localStorage.setItem('ag_admin_pass', p1);
  msg.textContent = 'Password updated successfully!';
  msg.className = 'settings-msg ok'; msg.style.display = 'block';
  document.getElementById('newPass1').value = '';
  document.getElementById('newPass2').value = '';
  setTimeout(() => msg.style.display = 'none', 3000);
}

function changeUsername() {
  const u = document.getElementById('newUsername').value.trim();
  const msg = document.getElementById('userMsg');
  if (!u || u.length < 3) {
    msg.textContent = 'Username must be at least 3 characters.';
    msg.className = 'settings-msg err'; msg.style.display = 'block'; return;
  }
  localStorage.setItem('ag_admin_user', u);
  sessionStorage.setItem('ag_authed_user', u);
  document.getElementById('adminUsername').textContent = u;
  msg.textContent = 'Username updated!';
  msg.className = 'settings-msg ok'; msg.style.display = 'block';
  document.getElementById('newUsername').value = '';
  setTimeout(() => msg.style.display = 'none', 3000);
}
