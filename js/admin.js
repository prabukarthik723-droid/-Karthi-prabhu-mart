/**
 * KarthiMart Admin Portal Module
 * User management, order moderation/workflow controls, listing moderation, platform analytics
 */

const admin = {
  renderDashboard() {
    const container = document.getElementById('admin-view-content');
    if (!container) return;

    const user = store.getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-icon">🛡️</div>
          <h3>Admin Privileges Required</h3>
          <p>Please log in with the administrator account to access platform moderation.</p>
          <button class="btn btn-primary" onclick="auth.switchRole('ADMIN'); app.render();">
            Switch to Demo Admin Account (Karthi Admin)
          </button>
        </div>
      `;
      return;
    }

    const users = store.getUsers();
    const orders = store.getOrders();
    const products = store.getProducts();

    const gmv = orders.reduce((sum, o) => sum + (o.orderStatus !== 'CANCELLED' ? o.totalAmount : 0), 0);

    container.innerHTML = `
      <div class="dashboard-header-block">
        <div>
          <span class="badge badge-accent">Platform Superadmin</span>
          <h2 class="dashboard-title">KarthiMart Operations Center</h2>
          <p class="dashboard-subtitle">Platform-wide overview: moderate marketplace listings, process order statuses, and audit accounts.</p>
        </div>
        <div class="dashboard-actions">
          <button class="btn btn-outline" onclick="admin.resetPlatformData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            Reset Seed Data
          </button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Total Users</span>
            <span class="kpi-value">${users.length}</span>
            <span class="kpi-trend positive">${users.filter(u => u.role === 'BUYER').length} Buyers, ${users.filter(u => u.role === 'SELLER').length} Sellers</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-emerald">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Marketplace GMV</span>
            <span class="kpi-value">₹${gmv.toLocaleString('en-IN')}</span>
            <span class="kpi-trend positive">From ${orders.length} total orders</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Platform Orders</span>
            <span class="kpi-value">${orders.length}</span>
            <span class="kpi-trend">${orders.filter(o => o.orderStatus === 'PENDING').length} pending dispatch</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap kpi-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">Live Listings</span>
            <span class="kpi-value">${products.length}</span>
            <span class="kpi-trend">${products.reduce((acc, p) => acc + p.stock, 0)} units in stock</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="seller-tabs">
        <button class="seller-tab-btn active" onclick="admin.switchTab('orders', event)">
          All Marketplace Orders (${orders.length})
        </button>
        <button class="seller-tab-btn" onclick="admin.switchTab('listings', event)">
          Catalog Moderation (${products.length})
        </button>
        <button class="seller-tab-btn" onclick="admin.switchTab('users', event)">
          User Directory (${users.length})
        </button>
      </div>

      <!-- Tab: Orders Management -->
      <div id="admin-tab-orders" class="admin-tab-panel active">
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status (Workflow Control)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>
                    <strong>#${order.id}</strong>
                    <div class="text-xs text-muted">${order.items.length} item(s)</div>
                  </td>
                  <td>
                    <div>${order.buyerName}</div>
                    <div class="text-xs text-muted">${order.buyerEmail}</div>
                  </td>
                  <td class="font-bold">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                  <td>
                    <span class="badge badge-success">${order.paymentMethod}</span>
                  </td>
                  <td>
                    <select class="status-select status-${order.orderStatus.toLowerCase()}" onchange="admin.updateStatus('${order.id}', this.value)">
                      <option value="PENDING" ${order.orderStatus === 'PENDING' ? 'selected' : ''}>PENDING</option>
                      <option value="CONFIRMED" ${order.orderStatus === 'CONFIRMED' ? 'selected' : ''}>CONFIRMED</option>
                      <option value="SHIPPED" ${order.orderStatus === 'SHIPPED' ? 'selected' : ''}>SHIPPED</option>
                      <option value="DELIVERED" ${order.orderStatus === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
                      <option value="CANCELLED" ${order.orderStatus === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                    </select>
                  </td>
                  <td class="text-sm">${new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Listing Moderation -->
      <div id="admin-tab-listings" class="admin-tab-panel" style="display: none;">
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style="text-align: right;">Moderation</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
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
                  <td>
                    <span class="text-sm">${p.sellerName || 'Merchant'}</span>
                  </td>
                  <td><span class="badge badge-neutral">${p.category}</span></td>
                  <td class="font-bold">₹${p.price.toLocaleString('en-IN')}</td>
                  <td>${p.stock} units</td>
                  <td style="text-align: right;">
                    <button class="btn btn-sm btn-danger" onclick="admin.moderateDeleteListing(${p.id})">
                      Remove Listing
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Users Directory -->
      <div id="admin-tab-users" class="admin-tab-panel" style="display: none;">
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>#${u.id}</td>
                  <td><strong>${u.name}</strong></td>
                  <td>${u.email}</td>
                  <td>
                    <span class="badge ${u.role === 'ADMIN' ? 'badge-danger' : (u.role === 'SELLER' ? 'badge-accent' : 'badge-neutral')}">
                      ${u.role}
                    </span>
                  </td>
                  <td>${u.phone || '—'}</td>
                  <td class="text-sm">${new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  switchTab(tabName, event) {
    document.querySelectorAll('.admin-tab-panel').forEach(p => {
      p.style.display = 'none';
      p.classList.remove('active');
    });
    document.querySelectorAll('.seller-tab-btn').forEach(b => b.classList.remove('active'));

    if (event && event.currentTarget) {
      event.currentTarget.classList.add('active');
    }

    const target = document.getElementById(`admin-tab-${tabName}`);
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
    }
  },

  updateStatus(orderId, newStatus) {
    store.updateOrderStatus(orderId, newStatus);
    app.showToast(`Order #${orderId} status updated to ${newStatus}`);
  },

  moderateDeleteListing(productId) {
    if (confirm(`Remove this listing (#${productId}) from KarthiMart?`)) {
      store.deleteProduct(productId);
      app.showToast("Listing removed by administrator.");
      this.renderDashboard();
      if (app && app.renderProducts) {
        app.renderProducts();
      }
    }
  },

  resetPlatformData() {
    if (confirm("Reset all local products, orders, and users back to initial seed state?")) {
      store.resetAll();
      app.showToast("Platform data reset to seed state.");
      window.location.reload();
    }
  }
};

if (typeof window !== 'undefined') {
  window.admin = admin;
}
