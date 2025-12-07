// ===== ENHANCED PIZZERIA APP.JS =====
// Enhanced with mobile menu, back-to-top, special deals, newsletter, and more

// -- Currency formatting --
const currency = v => `₹${v.toFixed(2)}`;

// -- App state with enhanced properties --
const state = {
  pizzas: [],
  cart: {},
currentDeals: [
  {
    id: 'family-feast',
    name: 'Family Feast',
    description: '2 Large Pizzas + 1 Medium Pizza',
    originalPrice: 899,
    price: 699,
    items: [
      { pizzaId: 'p2', size: 'L', toppings: [], qty: 2 },
      { pizzaId: 'p1', size: 'M', toppings: [], qty: 1 }
    ]
  },
  {
    id: 'weekend-special',
    name: 'Weekend Special', 
    description: 'Any 2 Medium Pizzas',
    originalPrice: 499,
    price: 399,
    customizable: true
  },
  {
    id: 'combo-madness', 
    name: 'Combo Madness',
    description: '1 Large Pizza + 2 Medium Pizzas',
    originalPrice: 799,
    price: 599,
    items: [
      { pizzaId: 'p1', size: 'L', toppings: [], qty: 1 },
      { pizzaId: 'p2', size: 'M', toppings: [], qty: 2 }
    ]
  },
  {
    id: 'pizza-bonanza',
    name: 'Pizza Bonanza',
    description: '3 Large Pizzas of Your Choice',
    originalPrice: 999,
    price: 799,
    customizable: true
  }
]
};

// Initialize cart with error handling
try {
  state.cart = JSON.parse(localStorage.getItem('pizzeria_cart') || '{}');
} catch (e) {
  console.error('Error loading cart from storage:', e);
  state.cart = {};
}

// Initialize favorites with error handling
let favorites = [];
try {
  favorites = JSON.parse(localStorage.getItem('pizzeria_favorites') || '[]');
} catch (e) {
  console.error('Error loading favorites from storage:', e);
  favorites = [];
}

// -- Main DOM elements with new enhancements --
const els = {
  // Navigation & Layout
  catalog: document.getElementById('pizza-grid'),
  cartToggle: document.getElementById('cart-toggle'),
  cartCount: document.getElementById('cart-count'),
  cartDrawer: document.getElementById('cart-drawer'),
  drawerClose: document.getElementById('drawer-close'),
  drawerItems: document.getElementById('drawer-items'),
  subtotalEl: document.getElementById('subtotal'),
  taxEl: document.getElementById('tax'),
  deliveryFeeEl: document.getElementById('delivery-fee'),
  totalEl: document.getElementById('total'),
  deliveryNotice: document.getElementById('delivery-notice'),
  freeDeliveryAmount: document.getElementById('free-delivery-amount'),
  
  // Modals
  modal: document.getElementById('modal'),
  modalContent: document.getElementById('modal-content-inner'),
  modalClose: document.getElementById('modal-close'),
  
  // Search & Filters
  search: document.getElementById('search'),
  viewSpecials: document.getElementById('view-specials'),
  resetFilters: document.getElementById('reset-filters'),
  
  // Cart Actions
  clearCartBtn: document.getElementById('clear-cart'),
  checkoutBtn: document.getElementById('checkout'),
  
  // New Elements
  mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
  navLinks: document.querySelector('.nav-links'),
  backToTop: document.getElementById('back-to-top'),
  loadingIndicator: document.getElementById('loading-indicator'),
  emptyState: document.getElementById('empty-state'),
  
  // Forms
  contactForm: document.getElementById('contact-form'),
  newsletterForm: document.querySelector('.newsletter-form')
};

// -- Debug: Check which elements are found --
console.log('Available elements:', Object.keys(els).filter(key => els[key]));

// -- Mobile Menu Functionality --
function initMobileMenu() {
  if (!els.mobileMenuToggle || !els.navLinks) return;
  
  els.mobileMenuToggle.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
    this.classList.toggle('active');
    els.navLinks.classList.toggle('active');
    
    // Close mobile menu when clicking on a link
    if (!isExpanded) {
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
          els.mobileMenuToggle.setAttribute('aria-expanded', 'false');
          els.mobileMenuToggle.classList.remove('active');
          els.navLinks.classList.remove('active');
        });
      });
    }
  });
}

// -- Back to Top Functionality --
function initBackToTop() {
  if (!els.backToTop) return;
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      els.backToTop.classList.add('visible');
    } else {
      els.backToTop.classList.remove('visible');
    }
  });
  
  els.backToTop.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// -- Header Scroll Effect --
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// -- Favorites system --
function toggleFavorite(pizzaId) {
  const index = favorites.indexOf(pizzaId);
  if (index > -1) {
    favorites.splice(index, 1);
    showToast('Removed from favorites', 'warning');
  } else {
    favorites.push(pizzaId);
    showToast('Added to favorites!', 'success');
  }
  localStorage.setItem('pizzeria_favorites', JSON.stringify(favorites));
  renderCatalog(state.pizzas); // Re-render to update heart colors
}

// -- Load pizza data with enhanced loading states --
async function loadPizzas() {
  try {
    showLoadingState();
    const res = await fetch('pizzas.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    state.pizzas = await res.json();
    hideLoadingState();
    renderCatalog(state.pizzas);
    renderCart();
    initDeals(); // Initialize deal buttons after pizzas are loaded
  } catch (err) {
    console.error('Failed to load pizzas:', err);
    showErrorState('Unable to load menu. Please check your connection.');
  }
}

function showLoadingState() {
  if (els.loadingIndicator) els.loadingIndicator.classList.remove('hidden');
  if (els.catalog) els.catalog.innerHTML = '';
  if (els.emptyState) els.emptyState.classList.add('hidden');
}

function hideLoadingState() {
  if (els.loadingIndicator) els.loadingIndicator.classList.add('hidden');
}

function showErrorState(message) {
  hideLoadingState();
  if (els.catalog) {
    els.catalog.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😔</div>
        <h3>Something went wrong</h3>
        <p>${message}</p>
        <button class="btn primary" onclick="loadPizzas()">Try Again</button>
      </div>
    `;
  }
}

// -- Render menu (catalog) with enhanced features --
function renderCatalog(list) {
  if (!els.catalog) {
    console.error('Catalog element not found');
    return;
  }
  
  // Show empty state if no results
  if (!list || list.length === 0) {
    els.catalog.innerHTML = '';
    if (els.emptyState) {
      els.emptyState.classList.remove('hidden');
    }
    return;
  }
  
  // Hide empty state and render pizzas
  if (els.emptyState) els.emptyState.classList.add('hidden');
  
  const fragment = document.createDocumentFragment();
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-pizza-id', p.id);
    const isFavorite = favorites.includes(p.id);
    
    card.innerHTML = `
      <div class="card-media">
        <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" 
                onclick="toggleFavorite('${p.id}')"
                aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          ♥
        </button>
        <img 
          src="${p.image || 'images/placeholder.png'}"
          loading="lazy"
          alt="${p.name}"
          class="pizza-img"
          onerror="this.src='images/placeholder.png'"
        />
      </div>
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <h3 class="card-title">${p.name}</h3>
            <p class="card-desc">${p.description}</p>
          </div>
          <div style="text-align:right">
            <div class="price">${currency(p.basePrice)}</div>
            <div style="font-size:0.85rem;color:#888">${p.availableToppings?.length || 0} toppings</div>
          </div>
        </div>
        <div class="card-meta">
          <div class="card-actions">
            <button class="btn" data-action="customize" data-id="${p.id}">Customize</button>
            <button class="btn primary" data-action="add" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    fragment.appendChild(card);
  });
  els.catalog.innerHTML = '';
  els.catalog.appendChild(fragment);
}

// -- Special Deals Functionality --
function initDeals() {
  const dealButtons = document.querySelectorAll('[data-deal]');
  dealButtons.forEach(button => {
    button.addEventListener('click', function() {
      const dealId = this.dataset.deal;
      addDealToCart(dealId);
    });
  });
}

function addDealToCart(dealId) {
  const deal = state.currentDeals.find(d => d.id === dealId);
  if (!deal) {
    showToast('Deal not found!', 'error');
    return;
  }

  if (deal.customizable) {
    openDealCustomizationModal(deal);
  } else {
    // Add pre-configured deal items to cart
    deal.items.forEach(item => {
      if (item.type === 'pizza' || item.pizzaId) {
        addToCart(item.pizzaId, {
          size: item.size,
          toppings: item.toppings,
          qty: item.qty,
          price: null // Let the system calculate
        });
      } else {
        // Add side or drink
        addNonPizzaItem(item);
      }
    });
    showToast(`${deal.name} added to cart!`, 'success');
  }
}

function addNonPizzaItem(item) {
  const key = `nonpizza-${item.type}-${item.name}`;
  if (state.cart[key]) {
    state.cart[key].qty += item.qty;
  } else {
    state.cart[key] = {
      id: key,
      name: item.name,
      type: item.type,
      qty: item.qty,
      unitPrice: item.price,
      image: `images/${item.type}s/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
    };
  }
  renderCart();
}

function openDealCustomizationModal(deal) {
  if (!els.modalContent) return;
  
  let customizationText = '';
  if (deal.id === 'weekend-special') {
    customizationText = 'Please select your preferred pizza for both pizzas:';
  } else if (deal.id === 'pizza-bonanza') {
    customizationText = 'Please select your preferred pizza for all three pizzas:';
  }
  
  els.modalContent.innerHTML = `
    <div class="customize-header">
      <h2>${deal.name}</h2>
      <p class="pizza-description">${deal.description}</p>
      <div class="deal-price" style="text-align: center; margin: 1rem 0;">
        <span style="text-decoration: line-through; color: #888; margin-right: 0.5rem;">${currency(deal.originalPrice)}</span>
        <span style="font-size: 1.5rem; font-weight: bold; color: #b30015;">${currency(deal.price)}</span>
      </div>
    </div>
    
    <div style="text-align: center; margin: 2rem 0;">
      <p>${customizationText}</p>
      <select id="deal-pizza-select" class="form-control" style="margin: 1rem 0; padding: 0.8rem; border-radius: 6px; background: #1e120b; color: white; border: 1px solid #444; width: 100%;">
        ${state.pizzas.map(p => `<option value="${p.id}">${p.name} - ${currency(p.basePrice)}</option>`).join('')}
      </select>
    </div>
    
    <button class="btn primary large" onclick="addCustomizableDealToCart('${deal.id}')" style="width: 100%;">
      Add Deal to Cart - ${currency(deal.price)}
    </button>
  `;
  
  openModal();
}

function addCustomizableDealToCart(dealId) {
  const deal = state.currentDeals.find(d => d.id === dealId);
  const pizzaSelect = document.getElementById('deal-pizza-select');
  const selectedPizzaId = pizzaSelect.value;
  
  if (deal && selectedPizzaId) {
    if (dealId === 'weekend-special') {
      // For weekend special: 2 medium pizzas
      addToCart(selectedPizzaId, {
        size: 'M',
        toppings: [],
        qty: 2,
        price: deal.price / 2 // Split price between two pizzas
      });
    } else if (dealId === 'pizza-bonanza') {
      // For pizza bonanza: 3 large pizzas
      addToCart(selectedPizzaId, {
        size: 'L',
        toppings: [],
        qty: 3,
        price: deal.price / 3 // Split price between three pizzas
      });
    }
    
    showToast(`${deal.name} added to cart!`, 'success');
    closeModal();
  }
}

// -- Enhanced Cart rendering with delivery notice --
function renderCart() {
  if (!els.drawerItems) return;
  
  const items = Object.entries(state.cart);
  els.drawerItems.innerHTML = '';

  if (items.length === 0) {
    els.drawerItems.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: #888;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add some delicious pizzas to get started!</p>
      </div>
    `;
  } else {
    const frag = document.createDocumentFragment();
    items.forEach(([key, item]) => {
      const el = document.createElement('div');
      el.className = 'drawer-item';
      el.innerHTML = `
        <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}" 
             style="width:60px;height:60px;object-fit:cover;border-radius:8px"
             onerror="this.src='images/placeholder.png'">
        <div class="item-info">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:700">${item.name}</div>
            <div style="font-weight:700">${currency(item.unitPrice * item.qty)}</div>
          </div>
          <div style="color:#888;font-size:0.9rem">
            ${item.size ? `${item.size} • ` : ''}
            ${item.toppings && item.toppings.length ? item.toppings.join(', ') : (item.type || 'Classic')}
          </div>
          <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
            <div class="qty-controls" data-key="${key}">
              <button data-action="dec" aria-label="Decrease quantity">−</button>
              <span style="padding:0 8px">${item.qty}</span>
              <button data-action="inc" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn ghost" data-action="remove" data-key="${key}" style="background:transparent;border:1px solid #b30015">Remove</button>
          </div>
        </div>
      `;
      frag.appendChild(el);
    });
    els.drawerItems.appendChild(frag);
  }

  // Update totals and delivery notice
  updateCartTotals();
  saveCart();
}

function updateCartTotals() {
  const items = Object.entries(state.cart);
  const subtotal = items.reduce((s, [, it]) => s + it.unitPrice * it.qty, 0);
  const tax = subtotal * 0.18;
  const deliveryThreshold = 500;
  const deliveryFee = subtotal > deliveryThreshold ? 0 : 40;
  const total = subtotal + tax + deliveryFee;
  
  // Update DOM elements
  if (els.subtotalEl) els.subtotalEl.textContent = currency(subtotal);
  if (els.taxEl) els.taxEl.textContent = currency(tax);
  if (els.deliveryFeeEl) els.deliveryFeeEl.textContent = deliveryFee === 0 ? 'FREE' : currency(deliveryFee);
  if (els.totalEl) els.totalEl.textContent = currency(total);
  
  // Update delivery notice
  if (els.deliveryNotice && els.freeDeliveryAmount) {
    if (deliveryFee === 0) {
      els.deliveryNotice.innerHTML = '🎉 You qualify for FREE delivery!';
      els.deliveryNotice.style.color = '#4CAF50';
    } else {
      const amountNeeded = deliveryThreshold - subtotal;
      els.freeDeliveryAmount.textContent = amountNeeded;
      els.deliveryNotice.innerHTML = `Add ₹${amountNeeded} more for FREE delivery!`;
      els.deliveryNotice.style.color = '#FF9800';
    }
  }

  // Update cart count
  const count = items.reduce((c, [, it]) => c + it.qty, 0);
  if (els.cartCount) els.cartCount.textContent = count;
}

// -- Cart operations --
function saveCart() { 
  try {
    localStorage.setItem('pizzeria_cart', JSON.stringify(state.cart));
  } catch (e) {
    console.error('Error saving cart:', e);
    showToast('Error saving cart to browser storage', 'error');
  }
}

function addToCart(pizzaId, opts = { size: 'M', toppings: [], qty: 1, price: null }) {
  const p = state.pizzas.find(x => x.id === pizzaId);
  
  if (!p) {
    console.error('Pizza not found:', pizzaId);
    showToast('Pizza not found!', 'error');
    return;
  }
  
  // Create unique key for cart item
  const key = `${pizzaId}|size:${opts.size}|t:${(opts.toppings || []).sort().join('-')}`;
  
  if (state.cart[key]) {
    state.cart[key].qty += opts.qty;
    showToast(`${p.name} quantity updated!`, 'success');
  } else {
    state.cart[key] = {
      id: pizzaId,
      name: p.name,
      image: p.image,
      size: opts.size,
      toppings: opts.toppings || [],
      qty: opts.qty,
      unitPrice: opts.price ?? Math.round(p.basePrice * (opts.size === 'L' ? 1.3 : opts.size === 'S' ? 0.85 : 1))
    };
    showToast(`${p.name} added to cart!`, 'success');
  }
  
  renderCart();
  toggleDrawer(true); // Open cart drawer when adding items
}

function updateQty(key, qty) {
  if (!state.cart[key]) return;
  state.cart[key].qty = Math.max(0, qty);
  if (state.cart[key].qty === 0) {
    delete state.cart[key];
    showToast('Item removed from cart', 'warning');
  }
  renderCart();
}

function removeFromCart(key) {
  if (state.cart[key]) {
    delete state.cart[key];
    renderCart();
    showToast('Item removed from cart', 'warning');
  }
}

function clearCart() {
  if (Object.keys(state.cart).length === 0) {
    showToast('Cart is already empty', 'info');
    return;
  }
  
  if (confirm('Are you sure you want to clear your cart?')) {
    state.cart = {};
    renderCart();
    showToast('Cart cleared', 'warning');
  }
}

// -- Enhanced Checkout Function --
function openCheckout() {
  if (Object.keys(state.cart).length === 0) {
    showToast('Your cart is empty!', 'warning');
    toggleDrawer(true);
    return;
  }

  const items = Object.entries(state.cart);
  const subtotal = items.reduce((s, [, it]) => s + it.unitPrice * it.qty, 0);
  const tax = subtotal * 0.18;
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + tax + deliveryFee;

  els.modalContent.innerHTML = `
    <div class="checkout-header">
      <h2>Checkout</h2>
      <p>Complete your order</p>
    </div>

    <form id="checkout-form">
      <!-- Customer Details -->
      <div class="checkout-section">
        <h3>Delivery Details</h3>
        <div class="form-group">
          <label for="customer-name">Full Name *</label>
          <input type="text" id="customer-name" name="name" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label for="customer-phone">Phone Number *</label>
            <input type="tel" id="customer-phone" name="phone" required>
          </div>
          <div class="form-group">
            <label for="customer-email">Email</label>
            <input type="email" id="customer-email" name="email">
          </div>
        </div>
        <div class="form-group">
          <label for="delivery-address">Delivery Address *</label>
          <textarea id="delivery-address" name="address" required placeholder="House no., Street, Area, City..."></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label for="delivery-time">Preferred Time</label>
            <select id="delivery-time" name="time">
              <option value="asap">ASAP (30-45 mins)</option>
              <option value="1hour">Within 1 hour</option>
              <option value="2hour">Within 2 hours</option>
              <option value="specific">Specific time</option>
            </select>
          </div>
          <div class="form-group">
            <label for="special-instructions">Special Instructions</label>
            <input type="text" id="special-instructions" name="instructions" placeholder="e.g., Ring bell, Leave at door">
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="checkout-section">
        <h3>Order Summary</h3>
        <div class="order-summary">
          ${items.map(([key, item]) => `
            <div class="order-item">
              <div>
                <strong>${item.name}</strong>
                <div style="font-size: 0.9rem; color: #888;">
                  ${item.size ? `${item.size} • ` : ''}
                  ${item.toppings.length ? item.toppings.join(', ') : (item.type || 'Classic')}
                </div>
                <div style="font-size: 0.9rem;">Qty: ${item.qty}</div>
              </div>
              <div>${currency(item.unitPrice * item.qty)}</div>
            </div>
          `).join('')}
          
          <div class="order-totals">
            <div class="order-item">
              <div>Subtotal</div>
              <div>${currency(subtotal)}</div>
            </div>
            <div class="order-item">
              <div>Tax (18%)</div>
              <div>${currency(tax)}</div>
            </div>
            <div class="order-item">
              <div>Delivery Fee</div>
              <div>${deliveryFee === 0 ? 'FREE' : currency(deliveryFee)}</div>
            </div>
            <div class="order-item" style="font-size: 1.2rem; font-weight: 700; color: #b30015;">
              <div>Total</div>
              <div>${currency(total)}</div>
            </div>
            ${deliveryFee === 0 ? '<div style="color: #4CAF50; text-align: center; margin-top: 0.5rem;">🎉 You qualify for free delivery!</div>' : ''}
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="checkout-section">
        <h3>Payment Method</h3>
        <div class="payment-methods">
          <label class="payment-option selected">
            <input type="radio" name="payment" value="cod" checked>
            <div>💰 Cash on Delivery</div>
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="online">
            <div>💳 Online Payment</div>
            <small style="color: #888;">(Coming Soon)</small>
          </label>
        </div>
      </div>

      <button type="submit" class="btn primary large place-order-btn">
        🛍️ Place Order - ${currency(total)}
      </button>
    </form>
  `;

  setupCheckoutForm();
  openModal();
}
// Add these modal functions
function showFAQ() {
  els.modalContent.innerHTML = `
    <div class="customize-header">
      <h2>Frequently Asked Questions</h2>
    </div>
    <div style="text-align: left; line-height: 1.6;">
      <h3>🕒 Delivery Time</h3>
      <p>We deliver within 30-45 minutes in most areas.</p>
      
      <h3>💰 Payment Options</h3>
      <p>We accept Cash on Delivery and online payments.</p>
      
      <h3>🌱 Vegetarian Options</h3>
      <p>We have 20+ delicious vegetarian pizzas.</p>
      
      <h3>📞 Contact Support</h3>
      <p>Call us at 1-800-PIZZERIA for any issues.</p>
    </div>
    <button class="btn primary" onclick="closeModal()" style="margin-top: 2rem;">Close</button>
  `;
  openModal();
}

function showDeliveryInfo() {
  els.modalContent.innerHTML = `
    <div class="customize-header">
      <h2>Delivery Information</h2>
    </div>
    <div style="text-align: left; line-height: 1.6;">
      <h3>🚗 Delivery Areas</h3>
      <p>We deliver across the entire city within our service radius.</p>
      
      <h3>⏰ Delivery Hours</h3>
      <p>11:00 AM - 11:00 PM, 7 days a week</p>
      
      <h3>💰 Delivery Charges</h3>
      <p>₹40 for orders below ₹500 • FREE for orders above ₹500</p>
      
      <h3>📦 Minimum Order</h3>
      <p>No minimum order required</p>
    </div>
    <button class="btn primary" onclick="closeModal()" style="margin-top: 2rem;">Close</button>
  `;
  openModal();
}

function showTerms() {
  els.modalContent.innerHTML = `
    <div class="customize-header">
      <h2>Terms of Service</h2>
    </div>
    <div style="text-align: left; line-height: 1.6; max-height: 400px; overflow-y: auto;">
      <h3>📝 Order Policy</h3>
      <p>Orders can be cancelled within 5 minutes of placement.</p>
      
      <h3>🔙 Refund Policy</h3>
      <p>Full refund available for undelivered or incorrect orders.</p>
      
      <h3>🍕 Quality Guarantee</h3>
      <p>We guarantee fresh ingredients and hot delivery.</p>
      
      <h3>📞 Customer Support</h3>
      <p>Contact us within 2 hours for any quality issues.</p>
    </div>
    <button class="btn primary" onclick="closeModal()" style="margin-top: 2rem;">Close</button>
  `;
  openModal();
}
// Setup Checkout Form
function setupCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  
  const paymentOptions = form.querySelectorAll('.payment-option');

  // Payment method selection
  paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
      paymentOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      option.querySelector('input').checked = true;
    });
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    placeOrder();
  });
}

// Place Order Function
function placeOrder() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  
  const formData = new FormData(form);
  
  // Basic form validation
  const name = formData.get('name');
  const phone = formData.get('phone');
  const address = formData.get('address');
  
  if (!name || !phone || !address) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const orderData = {
    customer: {
      name: name,
      phone: phone,
      email: formData.get('email'),
      address: address,
      instructions: formData.get('instructions'),
      deliveryTime: formData.get('time')
    },
    payment: formData.get('payment'),
    cart: { ...state.cart }, // Copy cart data
    orderNumber: 'ORD' + Date.now().toString().slice(-6),
    timestamp: new Date().toISOString(),
    status: 'confirmed'
  };

  // Simulate order processing
  showToast(`Order #${orderData.orderNumber} placed successfully!`, 'success');
  
  // Save order to localStorage (for order history)
  saveOrderToHistory(orderData);
  
  // Clear cart and close modal
  clearCart();
  closeModal();
  toggleDrawer(false);
  
  // Show order confirmation
  setTimeout(() => {
    showOrderConfirmation(orderData);
  }, 1000);
}

// Save Order to History
function saveOrderToHistory(orderData) {
  try {
    let orderHistory = JSON.parse(localStorage.getItem('pizzeria_orders') || '[]');
    orderHistory.unshift(orderData);
    localStorage.setItem('pizzeria_orders', JSON.stringify(orderHistory));
  } catch (e) {
    console.error('Error saving order history:', e);
  }
}

// Order Confirmation
function showOrderConfirmation(orderData) {
  if (!els.modalContent) return;
  
  els.modalContent.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
      <h2>Order Confirmed!</h2>
      <p style="font-size: 1.2rem; color: #b30015; margin: 1rem 0;">Order #${orderData.orderNumber}</p>
      <p>Thank you for your order, <strong>${orderData.customer.name}</strong>!</p>
      <p>We'll deliver your pizza to:</p>
      <p style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
        ${orderData.customer.address}
      </p>
      <p>Estimated delivery: <strong>30-45 minutes</strong></p>
      <div style="margin: 2rem 0;">
        <button onclick="showOrderTracking('${orderData.orderNumber}')" class="btn" style="margin-right: 1rem;">
          Track Order
        </button>
        <button onclick="closeModal()" class="btn primary">
          Continue Shopping
        </button>
      </div>
    </div>
  `;
  openModal();
}

// -- Form Handlers --
function initForms() {
  // Contact form
  if (els.contactForm) {
    els.contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      
      // Simulate form submission
      showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
      this.reset();
    });
  }
  
  // Newsletter form
  if (els.newsletterForm) {
    els.newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      
      if (email) {
        showToast('Thanks for subscribing to our newsletter!', 'success');
        this.reset();
      }
    });
  }
}

// -- Enhanced Modal for custom pizza --
function openCustomizeModal(pizzaId) {
  const pizza = state.pizzas.find(p => p.id === pizzaId);
  if (!pizza || !els.modalContent) return;
  
  const basePrice = pizza.basePrice;
  
  els.modalContent.innerHTML = `
    <div class="customize-header">
      <h2 id="modal-title">${pizza.name}</h2>
      <p class="pizza-description">${pizza.description}</p>
    </div>
    
    <form id="custom-form" class="customize-form">
      <div class="form-section">
        <h3>Choose Size</h3>
        <div class="size-options">
          <label class="size-option">
            <input type="radio" name="size" value="S" data-multiplier="0.85">
            <div class="size-content">
              <span class="size-name">Small</span>
              <span class="size-desc">12" • Serves 1-2</span>
              <span class="size-price">${currency(basePrice * 0.85)}</span>
            </div>
          </label>
          <label class="size-option active">
            <input type="radio" name="size" value="M" checked data-multiplier="1">
            <div class="size-content">
              <span class="size-name">Medium</span>
              <span class="size-desc">14" • Serves 2-3</span>
              <span class="size-price">${currency(basePrice)}</span>
            </div>
          </label>
          <label class="size-option">
            <input type="radio" name="size" value="L" data-multiplier="1.3">
            <div class="size-content">
              <span class="size-name">Large</span>
              <span class="size-desc">16" • Serves 3-4</span>
              <span class="size-price">${currency(basePrice * 1.3)}</span>
            </div>
          </label>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Extra Toppings <span class="topping-price">(₹30 each)</span></h3>
        <div class="toppings-grid">
          ${(pizza.availableToppings || []).map(topping => `
            <label class="topping-option">
              <input type="checkbox" name="topping" value="${topping}">
              <span class="checkmark"></span>
              <span class="topping-name">${topping}</span>
              <span class="topping-price">+₹30</span>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="form-section">
        <h3>Quantity</h3>
        <div class="quantity-selector">
          <button type="button" class="qty-btn" data-action="decrease">−</button>
          <input type="number" name="qty" value="1" min="1" max="10" readonly>
          <button type="button" class="qty-btn" data-action="increase">+</button>
        </div>
      </div>
      
      <div class="price-summary">
        <div class="price-line">
          <span>Base price:</span>
          <span id="base-price">${currency(basePrice)}</span>
        </div>
        <div class="price-line">
          <span>Toppings:</span>
          <span id="toppings-price">₹0.00</span>
        </div>
        <div class="price-line total">
          <span>Total:</span>
          <span id="total-price">${currency(basePrice)}</span>
        </div>
      </div>
      
      <button type="submit" class="btn primary large add-to-cart-btn">
        🛒 Add to Cart
      </button>
    </form>
  `;
  
  setupCustomizeForm(pizza);
  openModal();
}

function setupCustomizeForm(pizza) {
  const form = document.getElementById('custom-form');
  if (!form) return;
  
  const basePrice = pizza.basePrice;
  
  // Quantity controls
  form.querySelector('.quantity-selector').addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    
    const input = form.querySelector('input[name="qty"]');
    let qty = parseInt(input.value);
    
    if (btn.dataset.action === 'increase' && qty < 10) {
      input.value = qty + 1;
    } else if (btn.dataset.action === 'decrease' && qty > 1) {
      input.value = qty - 1;
    }
    
    updatePrice();
  });
  
  // Size and topping changes
  form.addEventListener('change', updatePrice);
  
  // Update price initially
  updatePrice();
  
  function updatePrice() {
    const selectedSize = form.querySelector('input[name="size"]:checked');
    if (!selectedSize) return;
    
    const sizeMultiplier = parseFloat(selectedSize.dataset.multiplier);
    const toppingsCount = form.querySelectorAll('input[name="topping"]:checked').length;
    const quantity = parseInt(form.querySelector('input[name="qty"]').value);
    
    const toppingsPrice = toppingsCount * 30;
    const totalPrice = Math.round((basePrice * sizeMultiplier + toppingsPrice) * quantity * 100) / 100;
    
    // Update price display
    const basePriceEl = document.getElementById('base-price');
    const toppingsPriceEl = document.getElementById('toppings-price');
    const totalPriceEl = document.getElementById('total-price');
    
    if (basePriceEl) basePriceEl.textContent = currency(basePrice * sizeMultiplier);
    if (toppingsPriceEl) toppingsPriceEl.textContent = currency(toppingsPrice);
    if (totalPriceEl) totalPriceEl.textContent = currency(totalPrice);
  }
  
  // Form submission
  const submitHandler = (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const size = fd.get('size');
    const qty = Number(fd.get('qty') || 1);
    const toppings = Array.from(form.querySelectorAll('input[name="topping"]:checked')).map(i => i.value);
    const sizeMult = size === 'L' ? 1.3 : size === 'S' ? 0.85 : 1;
    const price = Math.round(pizza.basePrice * sizeMult + (toppings.length * 30));
    
    addToCart(pizza.id, { size, toppings, qty, price });
    form.removeEventListener('submit', submitHandler);
    closeModal();
  };
  
  form.addEventListener('submit', submitHandler);
}

// -- Modal open/close --
let lastFocused = null;
function openModal() {
  if (!els.modal) return;
  lastFocused = document.activeElement;
  els.modal.classList.remove('hidden');
  els.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
  if (!els.modal) return;
  els.modal.classList.add('hidden');
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Restore scrolling
  if (lastFocused) lastFocused.focus();
}

// -- Drawer open/close --
function toggleDrawer(force) {
  if (!els.cartDrawer || !els.cartToggle) return;
  
  const willOpen = typeof force === 'boolean' ? force : !els.cartDrawer.classList.contains('open');
  if (willOpen) {
    els.cartDrawer.classList.add('open');
    els.cartDrawer.setAttribute('aria-hidden', 'false');
    els.cartToggle.setAttribute('aria-expanded', 'true');
  } else {
    els.cartDrawer.classList.remove('open');
    els.cartDrawer.setAttribute('aria-hidden', 'true');
    els.cartToggle.setAttribute('aria-expanded', 'false');
  }
}

// -- Toast notifications with enhanced types --
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" aria-label="Close notification">×</button>
  `;
  document.body.appendChild(toast);
  
  // Auto remove after appropriate time
  const duration = type === 'error' ? 5000 : 3000;
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, duration);
}

// -- Order Tracking System --
function showOrderTracking(orderNumber) {
  const orders = JSON.parse(localStorage.getItem('pizzeria_orders') || '[]');
  const order = orders.find(o => o.orderNumber === orderNumber);
  
  if (!order) {
    showToast('Order not found!', 'error');
    return;
  }

  const statusStages = [
    { stage: 'confirmed', icon: '📝', text: 'Order Confirmed', time: 'Now' },
    { stage: 'preparing', icon: '👨‍🍳', text: 'Preparing', time: '+10 min' },
    { stage: 'baking', icon: '🔥', text: 'Baking', time: '+20 min' },
    { stage: 'quality-check', icon: '✅', text: 'Quality Check', time: '+25 min' },
    { stage: 'out-for-delivery', icon: '🚗', text: 'Out for Delivery', time: '+30 min' },
    { stage: 'delivered', icon: '🎉', text: 'Delivered', time: '+45 min' }
  ];

  // Simulate current stage based on order time
  const orderTime = new Date(order.timestamp);
  const now = new Date();
  const minutesPassed = Math.floor((now - orderTime) / (1000 * 60));
  const currentStageIndex = Math.min(Math.floor(minutesPassed / 8), statusStages.length - 1);

  els.modalContent.innerHTML = `
    <div class="tracking-header">
      <h2>Order Tracking</h2>
      <p style="color: #b30015; font-weight: 600;">${orderNumber}</p>
      <p>Placed on ${new Date(order.timestamp).toLocaleString()}</p>
    </div>

    <div class="order-status">
      ${statusStages.map((stage, index) => `
        <div class="status-step ${index <= currentStageIndex ? 'completed' : ''} ${index === currentStageIndex ? 'active' : ''}">
          <div class="status-icon">${stage.icon}</div>
          <span>${stage.text}</span>
          <div style="font-size: 0.8rem; color: #888; margin-top: 0.3rem;">${stage.time}</div>
        </div>
      `).join('')}
    </div>

    <div class="estimated-delivery">
      🕒 Estimated Delivery: <strong>${new Date(orderTime.getTime() + 45 * 60000).toLocaleTimeString()}</strong>
    </div>

    <div class="order-details">
      <h4>Delivery Details</h4>
      <p><strong>${order.customer.name}</strong> • ${order.customer.phone}</p>
      <p>${order.customer.address}</p>
      ${order.customer.instructions ? `<p><em>Instructions: ${order.customer.instructions}</em></p>` : ''}
    </div>

    <div class="order-actions" style="justify-content: center;">
      <button class="btn" onclick="reorder('${orderNumber}')">🔄 Re-order</button>
      <button class="btn primary" onclick="closeModal()">Close</button>
    </div>
  `;

  openModal();
}

// -- View Order History --
function showOrderHistory() {
  const orders = JSON.parse(localStorage.getItem('pizzeria_orders') || '[]');
  const historySection = document.getElementById('order-history');
  const historyList = document.getElementById('history-list');

  if (!historySection || !historyList) return;

  if (orders.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No order history yet</div>';
  } else {
    historyList.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-number">${order.orderNumber}</div>
            <div class="order-date">${new Date(order.timestamp).toLocaleString()}</div>
          </div>
          <div class="order-status-badge status-delivered">Delivered</div>
        </div>
        
        <div class="order-items-preview">
          ${Object.values(order.cart).slice(0, 2).map(item => 
            `${item.qty}x ${item.name}`
          ).join(', ')}${Object.values(order.cart).length > 2 ? '...' : ''}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: 700; color: #b30015;">
            ₹${Object.values(order.cart).reduce((total, item) => total + (item.unitPrice * item.qty), 0)}
          </div>
          <div class="order-actions">
            <button class="btn ghost" onclick="showOrderDetails('${order.orderNumber}')">View Details</button>
            <button class="btn primary" onclick="reorder('${order.orderNumber}')">Reorder</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  historySection.classList.remove('hidden');
  historySection.scrollIntoView({ behavior: 'smooth' });
}

// -- Re-order Functionality --
function reorder(orderNumber) {
  const orders = JSON.parse(localStorage.getItem('pizzeria_orders') || '[]');
  const order = orders.find(o => o.orderNumber === orderNumber);
  
  if (!order) {
    showToast('Order not found!', 'error');
    return;
  }

  // Clear current cart and add all items from previous order
  state.cart = {};
  Object.entries(order.cart).forEach(([key, item]) => {
    state.cart[key] = { ...item };
  });

  renderCart();
  showToast('Order added to cart!', 'success');
  closeModal();
  toggleDrawer(true);
}

// -- Show Order Details --
function showOrderDetails(orderNumber) {
  const orders = JSON.parse(localStorage.getItem('pizzeria_orders') || '[]');
  const order = orders.find(o => o.orderNumber === orderNumber);
  
  if (!order) return;

  els.modalContent.innerHTML = `
    <div class="tracking-header">
      <h2>Order Details</h2>
      <p style="color: #b30015; font-weight: 600;">${orderNumber}</p>
    </div>

    <div class="order-summary">
      ${Object.entries(order.cart).map(([key, item]) => `
        <div class="order-item">
          <div>
            <strong>${item.name}</strong>
            <div style="font-size: 0.9rem; color: #888;">
              ${item.size ? `${item.size} • ` : ''}
              ${item.toppings.length ? item.toppings.join(', ') : (item.type || 'Classic')}
            </div>
            <div style="font-size: 0.9rem;">Qty: ${item.qty}</div>
          </div>
          <div>${currency(item.unitPrice * item.qty)}</div>
        </div>
      `).join('')}
    </div>

    <div class="order-details">
      <h4>Customer Details</h4>
      <p><strong>Name:</strong> ${order.customer.name}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      ${order.customer.email ? `<p><strong>Email:</strong> ${order.customer.email}</p>` : ''}
      <p><strong>Address:</strong> ${order.customer.address}</p>
      ${order.customer.instructions ? `<p><strong>Instructions:</strong> ${order.customer.instructions}</p>` : ''}
    </div>

    <div class="order-actions" style="justify-content: center; margin-top: 2rem;">
      <button class="btn primary" onclick="reorder('${orderNumber}')">Reorder This Order</button>
    </div>
  `;

  openModal();
}

// -- Cross-page order functionality --
function handlePageLoad() {
  // Check if we need to process a reorder
  const reorderData = localStorage.getItem('reorder_data');
  if (reorderData) {
    try {
      state.cart = JSON.parse(reorderData);
      renderCart();
      toggleDrawer(true);
      localStorage.removeItem('reorder_data');
      showToast('Previous order added to cart!', 'success');
    } catch (e) {
      console.error('Error processing reorder:', e);
    }
  }

  // Check if we need to show order details
  const viewOrder = localStorage.getItem('view_order_details');
  if (viewOrder) {
    showOrderDetails(viewOrder);
    localStorage.removeItem('view_order_details');
  }

  // Check URL hash for section navigation
  if (window.location.hash) {
    const targetSection = document.querySelector(window.location.hash);
    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }
}

// -- Enhanced Event Listeners --
function setupEventListeners() {
  // Check for critical DOM elements
  if (!els.catalog || !els.cartDrawer) {
    console.error('Critical DOM elements missing');
    return;
  }

  // Catalog button actions
  els.catalog.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'add') addToCart(id);
    if (action === 'customize') openCustomizeModal(id);
  });

  // Cart toggle
  if (els.cartToggle) {
    els.cartToggle.addEventListener('click', () => toggleDrawer());
  }

  // Drawer close
  if (els.drawerClose) {
    els.drawerClose.addEventListener('click', () => toggleDrawer(false));
  }

  // Cart item actions
  if (els.drawerItems) {
    els.drawerItems.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.dataset.action;
      const key = btn.dataset.key || (btn.closest('.qty-controls')?.dataset?.key);
      if (action === 'remove') removeFromCart(key);
      if (action === 'inc') updateQty(key, (state.cart[key]?.qty || 0) + 1);
      if (action === 'dec') updateQty(key, (state.cart[key]?.qty || 0) - 1);
    });
  }

  // Checkout button
  if (els.checkoutBtn) {
    els.checkoutBtn.addEventListener('click', openCheckout);
  }

  // Clear cart
  if (els.clearCartBtn) {
    els.clearCartBtn.addEventListener('click', clearCart);
  }

  // Search functionality
  if (els.search) {
    els.search.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return renderCatalog(state.pizzas);
      const filtered = state.pizzas.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
      renderCatalog(filtered);
    });
  }

  // Reset filters
  if (els.resetFilters) {
    els.resetFilters.addEventListener('click', () => {
      if (els.search) els.search.value = '';
      renderCatalog(state.pizzas);
    });
  }

  
 // Filter nav links
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', function() {
    // Update active state
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    const f = this.dataset.filter;
    if (f === 'all') renderCatalog(state.pizzas);
    else if (f === 'veg') renderCatalog(state.pizzas.filter(p => /paneer|veg|veggie|spinach|mushroom|corn|cottage/i.test(p.name + ' ' + p.description)));
    else if (f === 'nonveg') renderCatalog(state.pizzas.filter(p => /chicken|pepperoni|bacon|prawn|tuna|meat|sausage/i.test(p.name + ' ' + p.description)));
    else if (f === 'chef') renderCatalog(state.pizzas.filter(p => 
      p.basePrice >= 350 || p.name.toLowerCase().includes("truffle") || 
      p.name.toLowerCase().includes("premium") || p.name.toLowerCase().includes("chef")
    ));
    else if (f === 'favorites') {
      const favoritePizzas = state.pizzas.filter(p => favorites.includes(p.id));
      renderCatalog(favoritePizzas.length ? favoritePizzas : state.pizzas);
    }
  });
});

  // Order Now button
  const orderBtn = document.getElementById('order-now-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', function() {
      const menuSection = document.getElementById('menu-section');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // View Menu button
  const viewMenuBtn = document.getElementById('view-menu-btn');
  if (viewMenuBtn) {
    viewMenuBtn.addEventListener('click', function() {
      const menuSection = document.getElementById('menu-section');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Modal close
  if (els.modalClose) {
    els.modalClose.addEventListener('click', closeModal);
  }

  if (els.modal) {
    els.modal.addEventListener('click', (e) => { 
      if(e.target === els.modal) closeModal(); 
    });
  }
}

// -- Initialize everything when DOM is loaded --
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing enhanced pizzeria app...');
  
  // Initialize all components
  setupEventListeners();
  initMobileMenu();
  initBackToTop();
  initHeaderScroll();
  initForms();
  
  // Load data and handle page state
  loadPizzas();
  handlePageLoad();
  
  console.log('Pizzeria app initialized successfully!');
});

// -- Make functions available globally for HTML onclick handlers --
window.toggleFavorite = toggleFavorite;
window.openCustomizeModal = openCustomizeModal;
window.addToCart = addToCart;
window.toggleDrawer = toggleDrawer;
window.closeModal = closeModal;
window.showOrderTracking = showOrderTracking;
window.showOrderHistory = showOrderHistory;
window.reorder = reorder;
window.showOrderDetails = showOrderDetails;