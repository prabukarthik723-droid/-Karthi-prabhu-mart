/**
 * KarthiMart Seller Portal Module
 * Listing management (create, edit, delete), inventory stock, incoming orders, and revenue metrics
 */

const seller = {
  renderDashboard() {
    const container = document.getElementById('seller-view-content');
    if (!container) return;

    const user = store.getCurrentUser();
    if (!user || user.role !== 'SELLER') {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">🔒</div>
          <h3>Seller Access Required</h3>
          <p>Please log in with a Seller account to access the Merchant Dashboard.</p>
          <button class="btn btn-primary" onclick="auth.switchRole('SELLER'); app.render();">
            Switch to Demo Seller Account (Apex Electronics)
          </button>
        </div>
      `;
      return;
    }

    const allProducts = store.getProducts();
    const sellerProducts = allProducts.filter(p => p.sellerId === user.id || p.sellerName === user.name);

    const allOrders = store.getOrders();
    // Orders containing items from this seller
    const incomingOrders = allOrders.filter(order => 
      order.items.some(item => item.sellerId === user.id || item.sellerName === user.name)
    );

    // Calculate metrics
    let totalSales = 0;
    let itemsSold = 0;
    incomingOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.sellerId === user.id || item.sellerName === user.name) {
          totalSales += (item.price * item.quantity);
          itemsSold += item.quantity;
        }
      });
    });

    const totalInventoryValue = sellerProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

    container.innerHTML = `
      <div class="dashboard-header-block">
        <div>
          <span class="badge badge-accent">Merchant Console</span>
          <h2 class="dashboard-title">${user.name} Dashboard</h2>
          <p class="dashboard-subtitle">Manage your product catalog, monitor live orders, and grow your KarthiMart store.</p>
        </div>
        <div class="dashboard-actions">
          <button class="btn btn-primary" onclick="seller.openProductModal()">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Product Listing
          </button>
        </div>
      </div>

      <!-- Metric KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Active Listings</span>
            <span class="kpi-value">${sellerProducts.length}</span>
            <span class="kpi-trend positive">${sellerProducts.filter(p => p.stock > 0).length} in stock</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-emerald">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Total Seller Revenue</span>
            <span class="kpi-value">₹${totalSales.toLocaleString('en-IN')}</span>
            <span class="kpi-trend positive">From ${incomingOrders.length} incoming orders</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Units Sold</span>
            <span class="kpi-value">${itemsSold}</span>
            <span class="kpi-trend">All-time units fulfilled</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Inventory Worth</span>
            <span class="kpi-value">₹${totalInventoryValue.toLocaleString('en-IN')}</span>
            <span class="kpi-trend">Warehouse stock valuation</span>
          </div>
        </div>
      </div>

      <!-- Tab Navigation for Listings & Incoming Orders -->
      <div class="seller-tabs">
        <button class="seller-tab-btn active" onclick="seller.switchTab('listings', event)">
          Catalog Listings (${sellerProducts.length})
        </button>
        <button class="seller-tab-btn" onclick="seller.switchTab('orders', event)">
          Incoming Customer Orders (${incomingOrders.length})
        </button>
      </div>

      <!-- Listings Table Tab -->
      <div id="seller-tab-listings" class="seller-tab-panel active">
        ${sellerProducts.length === 0 ? `
          <div class="empty-state-box">
            <p>You have not listed any products yet. Click <strong>Add New Product Listing</strong> to start selling on KarthiMart.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Qty</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${sellerProducts.map(p => `
                  <tr>
                    <td>
                      <div class="table-item-cell">
                        <img src="${p.image}" alt="${p.name}" class="table-thumb" referrerpolicy="no-referrer" onerror="app.handleImgError(this, ${p.id})" />
                        <div>
                          <span class="table-title">${p.name}</span>
                          <span class="table-sub">ID: #${p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge badge-neutral">${p.category}</span></td>
                    <td class="font-bold">₹${p.price.toLocaleString('en-IN')}</td>
                    <td>
                      <span class="stock-pill ${p.stock <= 5 ? 'low-stock' : 'in-stock'}">
                        ${p.stock} units
                      </span>
                    </td>
                    <td>⭐ ${p.rating} (${p.reviewsCount})</td>
                    <td>
                      <span class="badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}">
                        ${p.stock > 0 ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div class="table-actions">
                        <button class="btn-icon-action" title="Edit Listing" onclick="seller.openProductModal(${p.id})">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon-action text-danger" title="Delete Listing" onclick="seller.deleteProductListing(${p.id})">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Incoming Orders Tab -->
      <div id="seller-tab-orders" class="seller-tab-panel" style="display: none;">
        ${incomingOrders.length === 0 ? `
          <div class="empty-state-box">
            <p>No incoming orders for your listings yet. As customers purchase your items, orders will show up here.</p>
          </div>
        ` : `
          <div class="orders-list">
            ${incomingOrders.map(order => {
              const myItems = order.items.filter(item => item.sellerId === user.id || item.sellerName === user.name);
              const mySubtotal = myItems.reduce((s, i) => s + (i.price * i.quantity), 0);
              return `
                <div class="order-card-detailed">
                  <div class="order-card-header">
                    <div>
                      <span class="order-id">Order #${order.id}</span>
                      <span class="order-date">Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div class="order-status-badge status-${order.orderStatus.toLowerCase()}">
                      ${order.orderStatus}
                    </div>
                  </div>
                  <div class="order-buyer-info">
                    <span><strong>Customer:</strong> ${order.buyerName} (${order.buyerEmail})</span>
                    <span><strong>Shipping to:</strong> ${order.shippingAddress.city}, ${order.shippingAddress.state}</span>
                  </div>
                  <div class="order-card-items">
                    ${myItems.map(item => `
                      <div class="order-item-row">
                        <img src="${item.image}" alt="${item.name}" class="order-item-thumb" />
                        <div class="order-item-info">
                          <span class="order-item-name">${item.name}</span>
                          <span class="order-item-qty">Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</span>
                        </div>
                        <span class="order-item-total">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    `).join('')}
                  </div>
                  <div class="order-card-footer">
                    <div>
                      <span class="text-muted">Payment: </span>
                      <span class="badge badge-success">${order.paymentMethod} (${order.paymentStatus})</span>
                    </div>
                    <div>
                      <span class="text-muted">Your Payout: </span>
                      <strong class="text-accent text-lg">₹${mySubtotal.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  switchTab(tabName, event) {
    document.querySelectorAll('.seller-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.seller-tab-panel').forEach(p => {
      p.style.display = 'none';
      p.classList.remove('active');
    });

    if (event && event.currentTarget) {
      event.currentTarget.classList.add('active');
    }

    const target = document.getElementById(`seller-tab-${tabName}`);
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
    }
  },

  openProductModal(productId = null) {
    const isEdit = !!productId;
    let product = null;
    if (isEdit) {
      product = store.getProductById(productId);
      if (!product) return;
    }

    const modalHTML = `
      <div id="seller-product-modal" class="modal-overlay">
        <div class="modal-card modal-lg">
          <div class="modal-header">
            <h3>${isEdit ? 'Edit Product Listing' : 'Create New Product Listing'}</h3>
            <button class="modal-close" onclick="seller.closeProductModal()">&times;</button>
          </div>
          <form id="seller-product-form" onsubmit="seller.handleProductSave(event, ${productId})">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Product Title *</label>
                <input type="text" id="p-name" required value="${isEdit ? product.name : ''}" placeholder="e.g. Aura Pro Wireless Headphones" />
              </div>

              <div class="form-group">
                <label>Category *</label>
                <select id="p-category" required>
                  ${['Electronics', 'Fashion', 'Home & Living', 'Beauty & Wellness', 'Groceries & Gourmet', 'Sports & Fitness'].map(cat => `
                    <option value="${cat}" ${isEdit && product.category === cat ? 'selected' : ''}>${cat}</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Price (₹) *</label>
                <input type="number" id="p-price" step="0.01" min="1" required value="${isEdit ? product.price : ''}" placeholder="2999.00" />
              </div>

              <div class="form-group">
                <label>Original / MRP Price (₹)</label>
                <input type="number" id="p-orig-price" step="0.01" min="1" value="${isEdit ? (product.originalPrice || product.price) : ''}" placeholder="3999.00" />
              </div>

              <div class="form-group">
                <label>Stock Quantity *</label>
                <input type="number" id="p-stock" min="0" required value="${isEdit ? product.stock : '25'}" placeholder="25" />
              </div>

              <div class="form-group full-width">
                <label>Image URL *</label>
                <input type="url" id="p-image" required value="${isEdit ? product.image : ''}" placeholder="https://images.unsplash.com/photo-..." />
                <small class="form-hint">Tip: Use high quality direct HTTPS image URLs.</small>
              </div>

              <div class="form-group full-width">
                <label>Description *</label>
                <textarea id="p-desc" rows="4" required placeholder="Describe key features, specs, and materials...">${isEdit ? product.description : ''}</textarea>
              </div>

              <div class="form-group">
                <label>Badge Highlight</label>
                <select id="p-badge">
                  <option value="" ${isEdit && !product.badge ? 'selected' : ''}>None</option>
                  <option value="Bestseller" ${isEdit && product.badge === 'Bestseller' ? 'selected' : ''}>Bestseller</option>
                  <option value="Trending" ${isEdit && product.badge === 'Trending' ? 'selected' : ''}>Trending</option>
                  <option value="New" ${isEdit && product.badge === 'New' ? 'selected' : ''}>New Arrival</option>
                  <option value="Hot Deal" ${isEdit && product.badge === 'Hot Deal' ? 'selected' : ''}>Hot Deal</option>
                </select>
              </div>

              <div class="form-group">
                <label>Search Tags (comma separated)</label>
                <input type="text" id="p-tags" value="${isEdit && product.tags ? product.tags.join(', ') : ''}" placeholder="audio, wireless, gadget" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="seller.closeProductModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Update Product' : 'Publish Product'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  closeProductModal() {
    const modal = document.getElementById('seller-product-modal');
    if (modal) modal.remove();
  },

  handleProductSave(event, productId) {
    event.preventDefault();
    const user = store.getCurrentUser();
    if (!user) return;

    const name = document.getElementById('p-name').value.trim();
    const category = document.getElementById('p-category').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const originalPrice = parseFloat(document.getElementById('p-orig-price').value) || (price * 1.3);
    const stock = parseInt(document.getElementById('p-stock').value);
    const image = document.getElementById('p-image').value.trim();
    const description = document.getElementById('p-desc').value.trim();
    const badge = document.getElementById('p-badge').value;
    const tagsRaw = document.getElementById('p-tags').value;
    const tags = tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    const productData = {
      name,
      category,
      price,
      originalPrice,
      stock,
      image,
      description,
      badge: badge || null,
      tags: tags.length ? tags : [category.toLowerCase()],
      sellerId: user.id,
      sellerName: user.name
    };

    if (productId) {
      store.updateProduct(productId, productData);
      app.showToast("Product listing updated successfully!");
    } else {
      store.addProduct(productData);
      app.showToast("New product published to KarthiMart!");
    }

    this.closeProductModal();
    this.renderDashboard();
    if (app && app.renderProducts) {
      app.renderProducts();
    }
  },

  deleteProductListing(productId) {
    if (confirm("Are you sure you want to remove this product listing? This action cannot be undone.")) {
      store.deleteProduct(productId);
      app.showToast("Product listing deleted.");
      this.renderDashboard();
      if (app && app.renderProducts) {
        app.renderProducts();
      }
    }
  }
};

if (typeof window !== 'undefined') {
  window.seller = seller;
}
