/**
 * KarthiMart Orders & Reviews Engine
 * Buyer order tracking, order timeline workflow, review submission on delivered items
 */

const orders = {
  renderOrdersView() {
    const container = document.getElementById('orders-view-content');
    if (!container) return;

    const user = store.getCurrentUser();
    if (!user) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">📦</div>
          <h3>Sign in to view your orders</h3>
          <p>Track packages, view past receipts, and submit product reviews.</p>
          <button class="btn btn-primary" onclick="app.openAuthModal('login')">Sign In</button>
        </div>
      `;
      return;
    }

    const allOrders = store.getOrders();
    const myOrders = allOrders.filter(o => o.buyerId === user.id);

    if (myOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">🛍️</div>
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet on KarthiMart.</p>
          <button class="btn btn-primary" onclick="app.navigate('shop')">Explore Products</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="orders-header-row">
        <div>
          <h2>Your Orders & Shipments</h2>
          <p class="text-muted">Track deliveries, inspect items, and write verified customer reviews.</p>
        </div>
        <div class="orders-count-pill">${myOrders.length} Orders Placed</div>
      </div>

      <div class="orders-list">
        ${myOrders.map(order => this.renderOrderCard(order)).join('')}
      </div>
    `;
  },

  renderOrderCard(order) {
    const statusSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const currentStepIndex = statusSteps.indexOf(order.orderStatus);
    const isCancelled = order.orderStatus === 'CANCELLED';

    return `
      <div class="order-card-detailed" id="order-card-${order.id}">
        <div class="order-card-header">
          <div>
            <span class="order-id">Order #${order.id}</span>
            <span class="order-date">Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div class="order-status-badge status-${order.orderStatus.toLowerCase()}">
            ${order.orderStatus}
          </div>
        </div>

        <!-- Tracking Visual Timeline -->
        ${!isCancelled ? `
          <div class="tracking-stepper">
            ${statusSteps.map((step, idx) => `
              <div class="step-item ${idx <= currentStepIndex ? 'completed' : ''} ${idx === currentStepIndex ? 'current' : ''}">
                <div class="step-circle">${idx < currentStepIndex ? '✓' : (idx + 1)}</div>
                <div class="step-label">${step}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="order-cancelled-notice">
            ⚠️ This order has been cancelled.
          </div>
        `}

        <div class="order-card-items">
          ${order.items.map(item => `
            <div class="order-item-row">
              <img src="${item.image}" alt="${item.name}" class="order-item-thumb" referrerpolicy="no-referrer" onerror="app.handleImgError(this, ${item.productId})" />
              <div class="order-item-info">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-qty">Qty: ${item.quantity} • ₹${item.price.toLocaleString('en-IN')} each</span>
                <span class="order-item-seller">Seller: ${item.sellerName || 'Verified Merchant'}</span>
              </div>
              <div class="order-item-actions">
                <span class="order-item-total">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                ${(order.orderStatus === 'DELIVERED') ? `
                  <button class="btn btn-sm btn-outline review-btn" onclick="orders.openReviewModal(${item.productId}, '${item.name.replace(/'/g, "\\'")}')">
                    ★ Write Review
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="order-card-footer">
          <div class="order-shipping-summary">
            <span class="text-sm text-muted">Shipping to: <strong>${order.shippingAddress.fullName}</strong> (${order.shippingAddress.city}, ${order.shippingAddress.pincode})</span>
            <span class="text-sm text-muted">Mode: <strong>${order.paymentMethod}</strong> (${order.paymentStatus})</span>
          </div>
          <div class="order-total-block">
            <span class="text-muted text-sm">Total Paid:</span>
            <strong class="order-grand-total">₹${order.totalAmount.toLocaleString('en-IN')}</strong>
            ${(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') ? `
              <button class="btn btn-sm btn-outline text-danger" onclick="orders.cancelOrder('${order.id}')">Cancel Order</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  cancelOrder(orderId) {
    if (confirm(`Are you sure you want to cancel order #${orderId}?`)) {
      store.updateOrderStatus(orderId, 'CANCELLED');
      app.showToast(`Order #${orderId} has been cancelled.`);
      this.renderOrdersView();
    }
  },

  openReviewModal(productId, productName) {
    const existing = document.getElementById('review-modal');
    if (existing) existing.remove();

    const modalHTML = `
      <div id="review-modal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Review & Rating</h3>
            <button class="modal-close" onclick="orders.closeReviewModal()">&times;</button>
          </div>
          <form onsubmit="orders.submitReview(event, ${productId})">
            <p class="modal-subtitle">Share your honest experience for <strong>${productName}</strong></p>
            
            <div class="form-group text-center">
              <label>Your Rating *</label>
              <div class="star-rating-selector" id="star-selector">
                <input type="radio" name="star-rate" id="star-5" value="5" checked /><label for="star-5">★</label>
                <input type="radio" name="star-rate" id="star-4" value="4" /><label for="star-4">★</label>
                <input type="radio" name="star-rate" id="star-3" value="3" /><label for="star-3">★</label>
                <input type="radio" name="star-rate" id="star-2" value="2" /><label for="star-2">★</label>
                <input type="radio" name="star-rate" id="star-1" value="1" /><label for="star-1">★</label>
              </div>
            </div>

            <div class="form-group">
              <label>Your Review Comments *</label>
              <textarea id="review-comment" rows="4" required placeholder="What did you like or dislike? How was the build quality?"></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="orders.closeReviewModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Submit Review</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.remove();
  },

  submitReview(event, productId) {
    event.preventDefault();
    const checkedStar = document.querySelector('input[name="star-rate"]:checked');
    const rating = checkedStar ? checkedStar.value : 5;
    const comment = document.getElementById('review-comment').value.trim();

    store.addReview(productId, rating, comment);
    app.showToast("Review submitted! Thank you for your feedback.");
    this.closeReviewModal();
  }
};

if (typeof window !== 'undefined') {
  window.orders = orders;
}
