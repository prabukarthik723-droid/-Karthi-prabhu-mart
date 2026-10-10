/**
 * KarthiMart Cart & Checkout Engine
 * Manages cart drawer, quantities, promo coupons, mock payment checkout
 */

const cart = {
  appliedCoupon: null,

  init() {
    window.addEventListener('karthimart:cart_updated', () => {
      this.renderCartUI();
    });
  },

  renderCartUI() {
    this.updateBadge();
    this.renderDrawer();
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-count-badge');
    const count = store.getCartCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  },

  openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.renderDrawer();
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  renderDrawer() {
    const container = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!container || !summaryContainer) return;

    const items = store.getCart();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <div class="empty-cart-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h4>Your Cart is Empty</h4>
          <p>Discover our top deals and add items to your cart.</p>
          <button class="btn btn-primary" onclick="cart.closeDrawer(); app.navigate('shop');">
            Start Shopping
          </button>
        </div>
      `;
      summaryContainer.innerHTML = '';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="cart-item-row" data-id="${item.productId}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" referrerpolicy="no-referrer" onerror="app.handleImgError(this, ${item.productId})" />
        <div class="cart-item-details">
          <div class="cart-item-title-row">
            <h4 class="cart-item-title">${item.name}</h4>
            <button class="cart-remove-btn" onclick="cart.removeItem(${item.productId})" title="Remove item">
              &times;
            </button>
          </div>
          <span class="cart-item-cat">${item.category} • Sold by ${item.sellerName || 'Merchant'}</span>
          <div class="cart-item-price-row">
            <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</span>
            <div class="qty-stepper">
              <button class="qty-btn" onclick="cart.changeQty(${item.productId}, ${item.quantity - 1})" aria-label="Decrease quantity">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="cart.changeQty(${item.productId}, ${item.quantity + 1})" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const totals = store.getCartTotal();
    let discount = 0;
    if (this.appliedCoupon) {
      discount = Math.round(totals.subtotal * this.appliedCoupon.rate);
    }
    const finalTotal = Math.max(0, totals.total - discount);

    summaryContainer.innerHTML = `
      <div class="cart-coupon-box">
        <input type="text" id="coupon-input" placeholder="Promo code (try KARTHI10)" value="${this.appliedCoupon ? this.appliedCoupon.code : ''}" ${this.appliedCoupon ? 'disabled' : ''} />
        ${this.appliedCoupon ? `
          <button class="btn btn-sm btn-outline" onclick="cart.removeCoupon()">Remove</button>
        ` : `
          <button class="btn btn-sm btn-primary" onclick="cart.applyCoupon()">Apply</button>
        `}
      </div>
      ${this.appliedCoupon ? `
        <div class="coupon-success-text">🎉 '${this.appliedCoupon.code}' applied (${this.appliedCoupon.rate * 100}% discount)</div>
      ` : ''}

      <div class="cart-breakdown">
        <div class="breakdown-row">
          <span>Subtotal</span>
          <span>₹${totals.subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${discount > 0 ? `
          <div class="breakdown-row text-success">
            <span>Coupon Discount</span>
            <span>- ₹${discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="breakdown-row">
          <span>Delivery Charge</span>
          <span>${totals.shipping === 0 ? '<strong class="text-success">FREE</strong>' : `₹${totals.shipping}`}</span>
        </div>
        <div class="breakdown-row">
          <span>Estimated GST (5%)</span>
          <span>₹${totals.tax.toLocaleString('en-IN')}</span>
        </div>
        <div class="breakdown-divider"></div>
        <div class="breakdown-row total-row">
          <span>Grand Total</span>
          <span class="total-amount">₹${finalTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <button class="btn btn-primary btn-block btn-lg checkout-btn" onclick="cart.startCheckout()">
        Proceed to Checkout
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>
      <div class="checkout-guarantee">
        <span>🔒 Secure Mock Checkout • No Real Payment Required</span>
      </div>
    `;
  },

  changeQty(productId, newQty) {
    store.updateCartQuantity(productId, newQty);
  },

  removeItem(productId) {
    store.removeFromCart(productId);
    app.showToast("Item removed from cart");
  },

  applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (code === 'KARTHI10') {
      this.appliedCoupon = { code: 'KARTHI10', rate: 0.10 };
      app.showToast("10% Discount coupon applied!");
      this.renderDrawer();
    } else if (code === 'WELCOME20') {
      this.appliedCoupon = { code: 'WELCOME20', rate: 0.20 };
      app.showToast("20% Welcome coupon applied!");
      this.renderDrawer();
    } else {
      app.showToast("Invalid coupon code. Try KARTHI10 or WELCOME20", "warning");
    }
  },

  removeCoupon() {
    this.appliedCoupon = null;
    app.showToast("Coupon removed");
    this.renderDrawer();
  },

  startCheckout() {
    const user = store.getCurrentUser();
    if (!user) {
      this.closeDrawer();
      app.openAuthModal('login', () => {
        this.openDrawer();
      });
      return;
    }

    const cartItems = store.getCart();
    if (cartItems.length === 0) return;

    this.closeDrawer();
    this.openCheckoutModal();
  },

  openCheckoutModal() {
    const existing = document.getElementById('checkout-modal');
    if (existing) existing.remove();

    const user = store.getCurrentUser();
    const totals = store.getCartTotal();
    let discount = 0;
    if (this.appliedCoupon) {
      discount = Math.round(totals.subtotal * this.appliedCoupon.rate);
    }
    const finalTotal = Math.max(0, totals.total - discount);

    const modalHTML = `
      <div id="checkout-modal" class="modal-overlay">
        <div class="modal-card modal-lg checkout-modal-card">
          <div class="modal-header">
            <div>
              <h3>Secure Mock Checkout</h3>
              <p class="modal-subtitle">Confirm your shipping address and mock payment method.</p>
            </div>
            <button class="modal-close" onclick="cart.closeCheckoutModal()">&times;</button>
          </div>

          <form id="checkout-form" onsubmit="cart.submitOrder(event)">
            <div class="checkout-grid">
              <!-- Left Column: Shipping Address -->
              <div class="checkout-section">
                <h4 class="section-heading">1. Delivery Address</h4>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Full Name *</label>
                    <input type="text" id="ship-name" required value="${user.name}" />
                  </div>
                  <div class="form-group full-width">
                    <label>Street Address *</label>
                    <input type="text" id="ship-street" required value="Plot 14, Anna Nagar West" placeholder="Street, apartment, landmark" />
                  </div>
                  <div class="form-group">
                    <label>City *</label>
                    <input type="text" id="ship-city" required value="Chennai" />
                  </div>
                  <div class="form-group">
                    <label>State *</label>
                    <input type="text" id="ship-state" required value="Tamil Nadu" />
                  </div>
                  <div class="form-group">
                    <label>Pincode *</label>
                    <input type="text" id="ship-pincode" required value="600040" pattern="[0-9]{6}" title="6 digit Indian PIN code" />
                  </div>
                  <div class="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" id="ship-phone" required value="${user.phone || '+91 98765 43210'}" />
                  </div>
                </div>
              </div>

              <!-- Right Column: Payment & Order Summary -->
              <div class="checkout-section">
                <h4 class="section-heading">2. Mock Payment Method</h4>
                <div class="payment-methods-list">
                  <label class="payment-option">
                    <input type="radio" name="payment-method" value="UPI" checked />
                    <div class="payment-option-body">
                      <span class="payment-title">Instant UPI / QR Code</span>
                      <span class="payment-desc">Google Pay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input type="radio" name="payment-method" value="Credit Card" />
                    <div class="payment-option-body">
                      <span class="payment-title">Credit or Debit Card</span>
                      <span class="payment-desc">Visa, Mastercard, RuPay (Mock gateway)</span>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input type="radio" name="payment-method" value="Net Banking" />
                    <div class="payment-option-body">
                      <span class="payment-title">Net Banking</span>
                      <span class="payment-desc">SBI, HDFC, ICICI, Axis Bank</span>
                    </div>
                  </label>
                  <label class="payment-option">
                    <input type="radio" name="payment-method" value="Cash On Delivery" />
                    <div class="payment-option-body">
                      <span class="payment-title">Cash on Delivery (COD)</span>
                      <span class="payment-desc">Pay upon physical doorstep arrival</span>
                    </div>
                  </label>
                </div>

                <div class="checkout-summary-box">
                  <div class="summary-line">
                    <span>Items Total:</span>
                    <span>₹${totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  ${discount > 0 ? `
                    <div class="summary-line text-success">
                      <span>Discount (${this.appliedCoupon.code}):</span>
                      <span>-₹${discount.toLocaleString('en-IN')}</span>
                    </div>
                  ` : ''}
                  <div class="summary-line">
                    <span>Shipping:</span>
                    <span>${totals.shipping === 0 ? 'FREE' : `₹${totals.shipping}`}</span>
                  </div>
                  <div class="summary-line">
                    <span>GST (5%):</span>
                    <span>₹${totals.tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div class="summary-line total-highlight">
                    <span>Amount Payable:</span>
                    <span>₹${finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-block btn-lg">
                  Place Order Now (₹${finalTotal.toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.remove();
  },

  submitOrder(event) {
    event.preventDefault();
    const user = store.getCurrentUser();
    if (!user) return;

    const shippingAddress = {
      fullName: document.getElementById('ship-name').value.trim(),
      street: document.getElementById('ship-street').value.trim(),
      city: document.getElementById('ship-city').value.trim(),
      state: document.getElementById('ship-state').value.trim(),
      pincode: document.getElementById('ship-pincode').value.trim(),
      phone: document.getElementById('ship-phone').value.trim()
    };

    const paymentMethodRadio = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : 'UPI';

    const cartItems = store.getCart();
    const totals = store.getCartTotal();
    let discount = 0;
    if (this.appliedCoupon) {
      discount = Math.round(totals.subtotal * this.appliedCoupon.rate);
    }
    const finalTotal = Math.max(0, totals.total - discount);

    const orderData = {
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email,
      items: cartItems,
      totalAmount: finalTotal,
      shippingAddress,
      paymentMethod
    };

    const created = store.createOrder(orderData);
    this.closeCheckoutModal();
    this.appliedCoupon = null;

    // Show order success modal
    this.showOrderSuccessModal(created);
  },

  showOrderSuccessModal(order) {
    const modalHTML = `
      <div id="order-success-modal" class="modal-overlay">
        <div class="modal-card text-center success-modal-card">
          <div class="success-check-bubble">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 class="success-title">Order Placed Successfully!</h3>
          <p class="success-text">Thank you, <strong>${order.buyerName}</strong>! Your order <strong>#${order.id}</strong> has been confirmed.</p>
          <div class="success-order-details">
            <div class="summary-line">
              <span>Order Number:</span>
              <strong>#${order.id}</strong>
            </div>
            <div class="summary-line">
              <span>Amount Paid:</span>
              <strong>₹${order.totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div class="summary-line">
              <span>Payment Mode:</span>
              <span>${order.paymentMethod}</span>
            </div>
            <div class="summary-line">
              <span>Delivery Status:</span>
              <span class="badge badge-accent">${order.orderStatus}</span>
            </div>
          </div>
          <div class="modal-footer justify-center">
            <button class="btn btn-outline" onclick="cart.closeSuccessModal(); app.navigate('shop');">
              Continue Shopping
            </button>
            <button class="btn btn-primary" onclick="cart.closeSuccessModal(); app.navigate('orders');">
              View Order in History
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  closeSuccessModal() {
    const modal = document.getElementById('order-success-modal');
    if (modal) modal.remove();
  }
};

if (typeof window !== 'undefined') {
  window.cart = cart;
  cart.init();
}
