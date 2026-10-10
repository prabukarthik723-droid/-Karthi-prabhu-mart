/**
 * KarthiMart Master Application Controller
 * Handles client routing, views, reactive filtering, search, modals, and toasts
 */

const app = {
  currentView: 'split',
  selectedCategory: 'all',
  searchQuery: '',
  priceMax: 30000,
  sortBy: 'featured',
  inStockOnly: false,

  init() {
    this.bindGlobalEvents();
    this.updateUserNavUI();
    this.render();
    if (window.cart) cart.updateBadge();

    // Initialize AI Assistant
    if (window.KarthiMartAI) {
      new KarthiMartAI();
    }
  },

  bindGlobalEvents() {
    // Auth state changes
    window.addEventListener('karthimart:auth_changed', () => {
      this.updateUserNavUI();
      this.render();
    });

    // Hash change routing
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'split';
      this.navigate(hash, false);
    });

    // Check initial hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['home', 'shop', 'wishlist', 'orders', 'seller', 'admin', 'login', 'split'].includes(initialHash)) {
      this.currentView = initialHash;
    } else {
      this.currentView = 'split';
    }
  },

  navigate(viewName, updateHash = true) {
    this.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Update switcher buttons
    document.querySelectorAll('.switcher-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Mobile nav drawer close
    const mobileMenu = document.getElementById('mobile-nav-menu');
    if (mobileMenu) mobileMenu.classList.remove('open');

    this.render();
  },

  render() {
    // Hide all view sections
    const views = ['home', 'shop', 'wishlist', 'orders', 'seller', 'admin', 'login'];
    
    if (this.currentView === 'split') {
      views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if (el) el.style.display = (v === 'shop' || v === 'login') ? 'block' : 'none';
      });
      this.renderProducts();
    } else {
      views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if (el) el.style.display = (v === this.currentView) ? 'block' : 'none';
      });

      // Render respective content
      if (this.currentView === 'home') {
        this.renderHomeFeatured();
      } else if (this.currentView === 'shop') {
        this.renderProducts();
      } else if (this.currentView === 'wishlist') {
        this.renderWishlist();
      } else if (this.currentView === 'orders') {
        if (window.orders) orders.renderOrdersView();
      } else if (this.currentView === 'seller') {
        if (window.seller) seller.renderDashboard();
      } else if (this.currentView === 'admin') {
        if (window.admin) admin.renderDashboard();
      }
    }

    // Update switcher buttons
    document.querySelectorAll('.switcher-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === this.currentView);
    });
  },

  updateUserNavUI() {
    const user = store.getCurrentUser();
    const guestNav = document.getElementById('nav-guest-actions');
    const userNav = document.getElementById('nav-user-actions');
    const userPillName = document.getElementById('user-pill-name');
    const userRoleBadge = document.getElementById('user-role-badge');
    const sellerNavLink = document.getElementById('nav-link-seller');
    const adminNavLink = document.getElementById('nav-link-admin');

    if (user) {
      if (guestNav) guestNav.style.display = 'none';
      if (userNav) userNav.style.display = 'flex';
      if (userPillName) userPillName.textContent = user.name;
      const userAvatarInitial = document.getElementById('user-avatar-initial');
      if (userAvatarInitial) userAvatarInitial.textContent = user.name.charAt(0).toUpperCase();
      if (userRoleBadge) {
        userRoleBadge.textContent = user.role;
        userRoleBadge.className = `role-chip role-${user.role.toLowerCase()}`;
      }

      // Show role specific nav links
      if (sellerNavLink) {
        sellerNavLink.style.display = (user.role === 'SELLER' || user.role === 'ADMIN') ? 'inline-flex' : 'none';
      }
      if (adminNavLink) {
        adminNavLink.style.display = (user.role === 'ADMIN') ? 'inline-flex' : 'none';
      }
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (userNav) userNav.style.display = 'none';
      if (sellerNavLink) sellerNavLink.style.display = 'none';
      if (adminNavLink) adminNavLink.style.display = 'none';
    }
  },

  // Home Page Featured Blocks
  renderHomeFeatured() {
    const container = document.getElementById('home-featured-grid');
    if (!container) return;

    const products = store.getProducts();
    const featured = products.filter(p => p.featured || p.badge === 'Bestseller').slice(0, 8);

    container.innerHTML = featured.map(p => this.createProductCardHTML(p)).join('');
  },

  // Shop Page Filter & Search
  renderProducts() {
    const container = document.getElementById('shop-products-grid');
    const countDisplay = document.getElementById('products-count-display');
    if (!container) return;

    let products = store.getProducts();

    // Category filter
    if (this.selectedCategory !== 'all') {
      products = products.filter(p => p.category === this.selectedCategory);
    }

    // Search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.includes(q)))
      );
    }

    // Max price filter
    products = products.filter(p => p.price <= this.priceMax);

    // In stock filter
    if (this.inStockOnly) {
      products = products.filter(p => p.stock > 0);
    }

    // Sorting
    if (this.sortBy === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else {
      // Featured / default
      products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    if (countDisplay) {
      countDisplay.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box full-width">
          <div class="empty-icon">🔍</div>
          <h3>No matching products found</h3>
          <p>Try adjusting your category selection, keyword search, or price filter.</p>
          <button class="btn btn-outline" onclick="app.resetFilters()">Clear Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(p => this.createProductCardHTML(p)).join('');
  },

  handleImgError(imgEl, productId) {
    if (!imgEl || imgEl.dataset.fallbackApplied) return;
    imgEl.dataset.fallbackApplied = 'true';
    const product = store.getProductById(productId);
    if (product && product.fallbackImage) {
      imgEl.src = product.fallbackImage;
    }
  },

  createProductCardHTML(p) {
    const isWished = store.isInWishlist(p.id);
    const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-thumb-wrap">
          ${p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase().replace(/\s+/g, '-')}">${p.badge}</span>` : ''}
          ${discount > 0 ? `<span class="discount-tag">${discount}% OFF</span>` : ''}
          <button class="wishlist-btn ${isWished ? 'active' : ''}" onclick="app.toggleWishlist(${p.id}, event)" aria-label="Save to Wishlist" title="Save to Wishlist">
            <svg viewBox="0 0 24 24" fill="${isWished ? '#ef4444' : 'none'}" stroke="${isWished ? '#ef4444' : 'currentColor'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <img src="${p.image}" alt="${p.name}" class="product-thumb" referrerpolicy="no-referrer" loading="lazy" onerror="app.handleImgError(this, ${p.id})" onclick="app.openProductModal(${p.id})" />
          <button class="quick-view-btn" onclick="app.openProductModal(${p.id})">Quick View</button>
        </div>

        <div class="product-card-body">
          <div class="product-category-row">
            <span class="product-cat-name">${p.category}</span>
            <span class="product-stock-tag ${p.stock <= 5 ? 'low' : ''}">
              ${p.stock === 0 ? 'Out of Stock' : (p.stock <= 5 ? `Only ${p.stock} left` : 'In Stock')}
            </span>
          </div>

          <h3 class="product-title" onclick="app.openProductModal(${p.id})">${p.name}</h3>

          <div class="product-rating-row">
            <span class="star-rating">★ ${p.rating}</span>
            <span class="rating-count">(${p.reviewsCount} reviews)</span>
          </div>

          <div class="product-price-row">
            <div class="price-wrap">
              <span class="current-price">₹${p.price.toLocaleString('en-IN')}</span>
              ${p.originalPrice && p.originalPrice > p.price ? `
                <span class="original-price">₹${p.originalPrice.toLocaleString('en-IN')}</span>
              ` : ''}
            </div>
            <button 
              class="add-to-cart-btn ${p.stock === 0 ? 'disabled' : ''}" 
              onclick="app.handleAddToCart(${p.id}, event)"
              ${p.stock === 0 ? 'disabled' : ''}
              title="Add to Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  handleAddToCart(productId, event) {
    if (event) event.stopPropagation();
    const success = store.addToCart(productId, 1);
    if (success) {
      this.showToast("Product added to cart!");
      // Animate cart badge
      const btn = event ? event.currentTarget : null;
      if (btn) {
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 600);
      }
    }
  },

  toggleWishlist(productId, event) {
    if (event) event.stopPropagation();
    const added = store.toggleWishlist(productId);
    this.showToast(added ? "Saved to Wishlist ❤️" : "Removed from Wishlist");
    this.render();
  },

  renderWishlist() {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    const wishlistIds = store.getWishlist();
    const allProducts = store.getProducts();
    const wishedProducts = allProducts.filter(p => wishlistIds.includes(p.id));

    if (wishedProducts.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box full-width">
          <div class="empty-icon">❤️</div>
          <h3>Your Wishlist is Empty</h3>
          <p>Save items you like and view them here anytime.</p>
          <button class="btn btn-primary" onclick="app.navigate('shop')">Explore Products</button>
        </div>
      `;
      return;
    }

    container.innerHTML = wishedProducts.map(p => this.createProductCardHTML(p)).join('');
  },

  openProductModal(productId) {
    const product = store.getProductById(productId);
    if (!product) return;

    const existing = document.getElementById('product-detail-modal');
    if (existing) existing.remove();

    const reviews = store.getReviews(product.id);
    const isWished = store.isInWishlist(product.id);
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    const modalHTML = `
      <div id="product-detail-modal" class="modal-overlay">
        <div class="modal-card modal-xl product-modal-content">
          <button class="modal-close" onclick="app.closeProductModal()">&times;</button>
          <div class="product-modal-grid">
            <!-- Left: Gallery -->
            <div class="product-modal-gallery">
              <div class="product-modal-main-img-wrap">
                <img src="${product.image}" alt="${product.name}" class="product-modal-main-img" referrerpolicy="no-referrer" onerror="app.handleImgError(this, ${product.id})" />
                ${product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase()}">${product.badge}</span>` : ''}
              </div>
            </div>

            <!-- Right: Details -->
            <div class="product-modal-info">
              <div class="product-modal-cat">${product.category} • Sold by <strong>${product.sellerName || 'Verified Merchant'}</strong></div>
              <h2 class="product-modal-title">${product.name}</h2>
              
              <div class="product-modal-rating-box">
                <span class="star-rating">★ ${product.rating}</span>
                <span class="rating-count">(${product.reviewsCount} customer reviews)</span>
                <span class="dot-divider">•</span>
                <span class="stock-status ${product.stock > 0 ? 'text-success' : 'text-danger'}">
                  ${product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                </span>
              </div>

              <div class="product-modal-price-box">
                <span class="modal-current-price">₹${product.price.toLocaleString('en-IN')}</span>
                ${product.originalPrice && product.originalPrice > product.price ? `
                  <span class="modal-orig-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>
                  <span class="discount-pill">${discount}% OFF</span>
                ` : ''}
              </div>

              <p class="product-modal-desc">${product.description}</p>

              <!-- Tags -->
              ${product.tags && product.tags.length > 0 ? `
                <div class="product-tags-row">
                  ${product.tags.map(t => `<span class="tag-pill">#${t}</span>`).join('')}
                </div>
              ` : ''}

              <!-- Purchase Actions -->
              <div class="product-modal-actions">
                <div class="modal-qty-selector">
                  <button class="qty-btn" onclick="app.adjustModalQty(-1)">−</button>
                  <input type="number" id="modal-qty-input" value="1" min="1" max="${product.stock}" readonly />
                  <button class="qty-btn" onclick="app.adjustModalQty(1, ${product.stock})">+</button>
                </div>

                <button class="btn btn-primary btn-lg flex-1 ${product.stock === 0 ? 'disabled' : ''}" 
                  onclick="app.addToCartFromModal(${product.id})"
                  ${product.stock === 0 ? 'disabled' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button class="btn btn-outline btn-icon-only ${isWished ? 'active-wished' : ''}" 
                  onclick="app.toggleWishlist(${product.id}); app.closeProductModal();"
                  title="Save to Wishlist">
                  <svg viewBox="0 0 24 24" fill="${isWished ? '#ef4444' : 'none'}" stroke="${isWished ? '#ef4444' : 'currentColor'}" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              <!-- Reviews Section inside Modal -->
              <div class="product-modal-reviews-section">
                <h4>Verified Reviews (${reviews.length})</h4>
                ${reviews.length === 0 ? `
                  <p class="text-sm text-muted">No reviews yet for this product. Be the first to leave one after ordering!</p>
                ` : `
                  <div class="modal-reviews-list">
                    ${reviews.map(r => `
                      <div class="review-item">
                        <div class="review-author-row">
                          <strong>${r.userName}</strong>
                          <span class="review-stars">★ ${r.rating}/5</span>
                        </div>
                        <p class="review-comment-text">${r.comment}</p>
                        <span class="review-date">${new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  adjustModalQty(delta, max = 99) {
    const input = document.getElementById('modal-qty-input');
    if (!input) return;
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > max) val = max;
    input.value = val;
  },

  addToCartFromModal(productId) {
    const input = document.getElementById('modal-qty-input');
    const qty = input ? parseInt(input.value) : 1;
    store.addToCart(productId, qty);
    this.showToast(`Added ${qty} item(s) to cart!`);
    this.closeProductModal();
    if (window.cart) cart.openDrawer();
  },

  closeProductModal() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) modal.remove();
  },

  // Auth Modal & Quick Switcher
  openAuthModal(tab = 'login', onSuccess = null) {
    const existing = document.getElementById('auth-modal');
    if (existing) existing.remove();

    const modalHTML = `
      <div id="auth-modal" class="modal-overlay">
        <div class="modal-card auth-modal-card">
          <div class="modal-header">
            <div>
              <h3>Welcome to KarthiMart</h3>
              <p class="modal-subtitle">Your premier multi-seller e-commerce marketplace</p>
            </div>
            <button class="modal-close" onclick="app.closeAuthModal()">&times;</button>
          </div>

          <!-- 1-Click Demo Accounts Switcher -->
          <div class="demo-accounts-box">
            <span class="demo-box-label">⚡ 1-Click Instant Demo Login:</span>
            <div class="demo-btn-group">
              <button type="button" class="btn btn-sm btn-outline demo-pill" onclick="app.quickLoginAs('BUYER')">
                👤 Buyer Demo
              </button>
              <button type="button" class="btn btn-sm btn-outline demo-pill" onclick="app.quickLoginAs('SELLER')">
                💼 Seller Demo
              </button>
              <button type="button" class="btn btn-sm btn-outline demo-pill" onclick="app.quickLoginAs('ADMIN')">
                🛡️ Admin Demo
              </button>
            </div>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab-btn ${tab === 'login' ? 'active' : ''}" onclick="app.switchAuthTab('login')">Sign In</button>
            <button class="auth-tab-btn ${tab === 'register' ? 'active' : ''}" onclick="app.switchAuthTab('register')">Register New Account</button>
          </div>

          <!-- Sign In Form -->
          <form id="form-login" class="auth-form" style="display: ${tab === 'login' ? 'block' : 'none'};" onsubmit="app.handleLogin(event)">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="login-email" required placeholder="buyer@karthimart.com" value="buyer@karthimart.com" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="login-password" required placeholder="••••••••" value="password123" />
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg">Sign In</button>
          </form>

          <!-- Register Form (Buyer / Seller roles) -->
          <form id="form-register" class="auth-form" style="display: ${tab === 'register' ? 'block' : 'none'};" onsubmit="app.handleRegister(event)">
            <div class="form-group">
              <label>Account Role *</label>
              <div class="role-selector-radios">
                <label class="role-radio-label">
                  <input type="radio" name="reg-role" value="BUYER" checked />
                  <span>🛍️ Buyer (Shop & Order)</span>
                </label>
                <label class="role-radio-label">
                  <input type="radio" name="reg-role" value="SELLER" />
                  <span>💼 Seller (List Products)</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Full Name / Store Name *</label>
              <input type="text" id="reg-name" required placeholder="e.g. Rahul Verma or Verma Tech" />
            </div>

            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" id="reg-email" required placeholder="rahul@example.com" />
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" id="reg-phone" placeholder="+91 98765 43210" />
            </div>

            <div class="form-group">
              <label>Create Password *</label>
              <input type="password" id="reg-password" required minlength="6" placeholder="At least 6 characters" />
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg">Complete Registration</button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this._authSuccessCallback = onSuccess;
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.remove();
  },

  switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');

    if (tab === 'login') {
      document.querySelectorAll('.auth-tab-btn')[0].classList.add('active');
      document.getElementById('form-login').style.display = 'block';
    } else {
      document.querySelectorAll('.auth-tab-btn')[1].classList.add('active');
      document.getElementById('form-register').style.display = 'block';
    }
  },

  quickLoginAs(role) {
    auth.switchRole(role);
    this.showToast(`Logged in as Demo ${role}`);
    this.closeAuthModal();
    if (this.currentView === 'login') {
      if (role === 'SELLER') this.navigate('seller');
      else if (role === 'ADMIN') this.navigate('admin');
      else this.navigate('home');
    } else {
      this.render();
    }
    if (this._authSuccessCallback) this._authSuccessCallback();
  },

  switchInpageAuthTab(tab) {
    const loginForm = document.getElementById('inpage-form-login');
    const regForm = document.getElementById('inpage-form-register');
    const tabLogin = document.getElementById('inpage-tab-login');
    const tabReg = document.getElementById('inpage-tab-register');
    const title = document.getElementById('inpage-auth-title');
    const subtitle = document.getElementById('inpage-auth-subtitle');

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (regForm) regForm.style.display = 'none';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabReg) tabReg.classList.remove('active');
      if (title) title.textContent = "Welcome Back to KarthiMart";
      if (subtitle) subtitle.textContent = "Sign in to track orders, manage your cart, or sell products";
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (regForm) regForm.style.display = 'block';
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabReg) tabReg.classList.add('active');
      if (title) title.textContent = "Create an Account";
      if (subtitle) subtitle.textContent = "Join KarthiMart as a buyer or independent seller";
    }
  },

  handleInpageLogin(event) {
    event.preventDefault();
    const email = document.getElementById('inpage-login-email').value.trim();
    const pass = document.getElementById('inpage-login-password').value;

    const res = auth.login(email, pass);
    if (res.success) {
      this.showToast(`Welcome back, ${res.user.name}!`);
      if (res.user.role === 'SELLER') {
        this.navigate('seller');
      } else if (res.user.role === 'ADMIN') {
        this.navigate('admin');
      } else {
        this.navigate('home');
      }
    } else {
      this.showToast(res.message, "danger");
    }
  },

  handleInpageRegister(event) {
    event.preventDefault();
    const roleRadio = document.querySelector('input[name="inpage-reg-role"]:checked');
    const role = roleRadio ? roleRadio.value : 'BUYER';
    const name = document.getElementById('inpage-reg-name').value;
    const email = document.getElementById('inpage-reg-email').value;
    const phone = document.getElementById('inpage-reg-phone').value;
    const password = document.getElementById('inpage-reg-password').value;

    const res = auth.register({ name, email, phone, password, role });
    if (res.success) {
      this.showToast(`Welcome to KarthiMart, ${name}!`);
      if (role === 'SELLER') {
        this.navigate('seller');
      } else {
        this.navigate('home');
      }
    } else {
      this.showToast(res.message, "danger");
    }
  },

  handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;

    const res = auth.login(email, pass);
    if (res.success) {
      this.showToast(`Welcome back, ${res.user.name}!`);
      this.closeAuthModal();
      if (this._authSuccessCallback) this._authSuccessCallback();
    } else {
      this.showToast(res.message, "danger");
    }
  },

  handleRegister(event) {
    event.preventDefault();
    const roleRadio = document.querySelector('input[name="reg-role"]:checked');
    const role = roleRadio ? roleRadio.value : 'BUYER';
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;

    const res = auth.register({ name, email, phone, password, role });
    if (res.success) {
      this.showToast(`Registration successful! Welcome to KarthiMart.`);
      this.closeAuthModal();
      if (this._authSuccessCallback) this._authSuccessCallback();
    } else {
      this.showToast(res.message, "danger");
    }
  },

  logoutUser() {
    auth.logout();
    this.showToast("Logged out successfully");
    this.navigate('home');
  },

  // Filter helpers
  setCategory(cat) {
    this.selectedCategory = cat;
    document.querySelectorAll('.cat-chip-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === cat);
    });
    this.renderProducts();
  },

  setSearch(val) {
    this.searchQuery = val;
    this.renderProducts();
  },

  setSort(val) {
    this.sortBy = val;
    this.renderProducts();
  },

  setPriceMax(val) {
    this.priceMax = parseInt(val);
    const label = document.getElementById('price-slider-val');
    if (label) label.textContent = `₹${this.priceMax.toLocaleString('en-IN')}`;
    this.renderProducts();
  },

  toggleStockOnly(checked) {
    this.inStockOnly = checked;
    this.renderProducts();
  },

  resetFilters() {
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.priceMax = 30000;
    this.sortBy = 'featured';
    this.inStockOnly = false;

    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = '';
    const shopSearch = document.getElementById('shop-search-input');
    if (shopSearch) shopSearch.value = '';

    const priceSlider = document.getElementById('price-range-slider');
    if (priceSlider) priceSlider.value = 30000;
    const priceVal = document.getElementById('price-slider-val');
    if (priceVal) priceVal.textContent = '₹30,000';

    const stockCheck = document.getElementById('filter-stock-only');
    if (stockCheck) stockCheck.checked = false;

    document.querySelectorAll('.cat-chip-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === 'all');
    });

    this.renderProducts();
  },

  // Toast Notification System
  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
};

window.app = app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
