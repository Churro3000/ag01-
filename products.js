// =============================================
// ACTIVE GENERATION — PRODUCTS STORE
// =============================================

const AG = {
  WHATSAPP: '26700000000', // ← CHANGE THIS to your WhatsApp number (no + or spaces)

  // Load products from localStorage or use defaults
  getProducts() {
    const stored = localStorage.getItem('ag_products');
    if (stored) return JSON.parse(stored);
    return [
      {
        id: 1,
        name: 'AG Club T-Shirt',
        description: 'Official Active Generation club t-shirt. Premium cotton blend.',
        price: 150,
        currency: 'P',
        image: '',
        badge: 'new',
        hasSizes: true,
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        category: 'apparel',
        inStock: true
      },
      {
        id: 2,
        name: 'AG Club Hoodie',
        description: 'Warm hoodie with embroidered club logo. Perfect for range days.',
        price: 280,
        currency: 'P',
        image: '',
        badge: '',
        hasSizes: true,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        category: 'apparel',
        inStock: true
      },
      {
        id: 3,
        name: 'Archery Target',
        description: 'Professional foam target face. 60cm diameter, high-density foam.',
        price: 350,
        currency: 'P',
        image: '',
        badge: '',
        hasSizes: false,
        sizes: [],
        category: 'equipment',
        inStock: true
      }
    ];
  },

  saveProducts(products) {
    localStorage.setItem('ag_products', JSON.stringify(products));
  },

  // Cart operations
  cart: [],

  getCart() {
    const stored = sessionStorage.getItem('ag_cart');
    if (stored) this.cart = JSON.parse(stored);
    return this.cart;
  },

  saveCart() {
    sessionStorage.setItem('ag_cart', JSON.stringify(this.cart));
  },

  addToCart(product, selectedSize) {
    this.getCart();
    const existingIndex = this.cart.findIndex(
      item => item.id === product.id && item.size === selectedSize
    );
    if (existingIndex > -1) {
      this.cart[existingIndex].qty += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        size: selectedSize,
        image: product.image,
        qty: 1
      });
    }
    this.saveCart();
    return this.cart;
  },

  removeFromCart(id, size) {
    this.getCart();
    this.cart = this.cart.filter(item => !(item.id === id && item.size === size));
    this.saveCart();
    return this.cart;
  },

  getTotal() {
    this.getCart();
    return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  buildWhatsAppMessage() {
    this.getCart();
    if (this.cart.length === 0) return '';
    let msg = 'Good day! I would like to order the following from Active Generation Archery Club:%0A%0A';
    this.cart.forEach(item => {
      msg += `• ${item.name}`;
      if (item.size) msg += ` (Size: ${item.size})`;
      msg += ` — ${item.currency}${item.price} x${item.qty}%0A`;
    });
    msg += `%0ATotal: ${this.cart[0].currency}${this.getTotal()}%0A%0AThank you!`;
    return msg;
  }
};
