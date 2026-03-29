// =============================================
// ACTIVE GENERATION — MAIN JS
// =============================================

// ── HEADER SCROLL ──
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
});

// ── MOBILE MENU ──
function toggleMobileMenu() {
  const nav = document.getElementById('mobileNav');
  const burger = document.getElementById('hamburger');
  nav.classList.toggle('open');
  burger.classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

// ── ACTIVE NAV ──
function updateActiveNav() {
  const sections = ['home','about','shop','tournaments','schedule','contact'];
  const scrollY = window.scrollY + 100;
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.offsetTop, bottom = top + el.offsetHeight;
    const links = document.querySelectorAll(`.nav-link[href="#${id}"]`);
    links.forEach(link => link.classList.toggle('active', scrollY >= top && scrollY < bottom));
  });
}

// ── SLIDESHOW ──
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('slideDots');
let slideTimer;

// Build dots
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.onclick = () => goToSlide(i);
  dotsContainer.appendChild(dot);
});

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dotsContainer.children[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dotsContainer.children[currentSlide].classList.add('active');
  document.getElementById('slideshow').style.transform = `translateX(-${currentSlide * 100}%)`;
  resetTimer();
}
function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }
function resetTimer() {
  clearInterval(slideTimer);
  slideTimer = setInterval(nextSlide, 5000);
}
resetTimer();

// ── CART ──
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('active');
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('active');
}

function renderCart() {
  const cart = AG.getCart();
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const whatsappBtn = document.getElementById('whatsappOrderAll');

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = totalItems;
  cartCountEl.classList.toggle('visible', totalItems > 0);

  if (cart.length === 0) {
    cartEmptyEl.style.display = 'flex';
    cartFooterEl.style.display = 'none';
    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(cartEmptyEl);
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartFooterEl.style.display = 'block';

  const itemsHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<i class="fas fa-tshirt"></i>`}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${item.size ? `<div class="cart-item-size">Size: ${item.size}</div>` : ''}
        <div class="cart-item-price">${item.currency}${item.price} × ${item.qty}</div>
      </div>
      <button class="cart-item-remove" onclick="removeCartItem(${item.id}, '${item.size}')">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');

  cartItemsEl.innerHTML = itemsHTML;

  const total = AG.getTotal();
  cartTotalEl.textContent = `P${total.toFixed(2)}`;
  whatsappBtn.href = `https://wa.me/${AG.WHATSAPP}?text=${AG.buildWhatsAppMessage()}`;
}

function removeCartItem(id, size) {
  AG.removeFromCart(id, size);
  renderCart();
}

// ── SHOP ──
function renderShop() {
  const products = AG.getProducts();
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('shopEmpty');

  const visible = products.filter(p => p.inStock);
  if (visible.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }
  grid.style.display = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = visible.map(p => `
    <div class="product-card fade-in" data-product-id="${p.id}">
      ${p.badge ? `<div class="product-badge badge-${p.badge}">${p.badge}</div>` : ''}
      <div class="product-img-wrap">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}">`
          : `<i class="fas fa-${p.category === 'equipment' ? 'crosshairs' : 'tshirt'}"></i>`}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.description}</div>
        <div class="product-price">${p.currency}${p.price.toFixed(2)}</div>
        ${p.hasSizes && p.sizes.length > 0 ? `
          <div class="product-sizes" id="sizes-${p.id}">
            ${p.sizes.map(s => `
              <button class="size-btn" onclick="selectSize(${p.id}, '${s}', this)">${s}</button>
            `).join('')}
          </div>
        ` : ''}
        <div class="product-actions">
          <button class="btn-add-cart"
            id="add-btn-${p.id}"
            ${p.hasSizes ? 'disabled' : ''}
            onclick="addToCart(${p.id})">
            <i class="fas fa-cart-plus"></i>
            ${p.hasSizes ? 'Select a Size' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  `).join('');

  observeFadeIns();
}

const selectedSizes = {};

function selectSize(productId, size, btn) {
  const sizeContainer = document.getElementById(`sizes-${productId}`);
  sizeContainer.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSizes[productId] = size;

  const addBtn = document.getElementById(`add-btn-${productId}`);
  addBtn.disabled = false;
  addBtn.innerHTML = `<i class="fas fa-cart-plus"></i> Add to Cart`;
}

function addToCart(productId) {
  const products = AG.getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const size = selectedSizes[productId] || null;
  AG.addToCart(product, size);
  renderCart();

  // Flash animation
  const btn = document.getElementById(`add-btn-${productId}`);
  const original = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-check"></i> Added!`;
  btn.style.background = 'var(--green)';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
  }, 1200);
}

// ── FADE IN OBSERVER ──
function observeFadeIns() {
  const els = document.querySelectorAll('.fade-in:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ── SECTION FADE INS ──
document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in to section titles
  document.querySelectorAll(
    '.section-title, .section-sub, .about-text p, .country-card, .schedule-card, .contact-item, .stat'
  ).forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${(i % 5) * 0.07}s`;
  });
  observeFadeIns();

  renderShop();
  renderCart();
});

window.addEventListener('scroll', observeFadeIns);
