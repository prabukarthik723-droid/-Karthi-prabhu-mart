/**
 * KarthiMart AI Shopping Assistant
 * Intelligent domain-scoped chatbot with product recommendations, order status lookup,
 * policy answers, per-session caching, and rate limiting.
 */

class KarthiMartAI {
  constructor() {
    this.cache = new Map();
    this.messageTimestamps = [];
    this.maxRatePerMinute = 10;
    this.isOpen = false;
    this.init();
  }

  init() {
    this.renderWidget();
    this.bindEvents();
  }

  renderWidget() {
    const existing = document.getElementById('karthimart-ai-widget');
    if (existing) existing.remove();

    const widgetHTML = `
      <div id="karthimart-ai-widget" class="ai-widget-container">
        <!-- Floating Trigger Button -->
        <button id="ai-chat-trigger" class="ai-chat-trigger" aria-label="Open KarthiMart AI Shopping Assistant">
          <span class="ai-chat-pulse"></span>
          <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span class="ai-badge">AI</span>
        </button>

        <!-- Chat Modal / Panel -->
        <div id="ai-chat-panel" class="ai-chat-panel" style="display: none;">
          <div class="ai-chat-header">
            <div class="ai-header-info">
              <div class="ai-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path>
                  <path d="M6 10v2a6 6 0 0 0 12 0v-2"></path>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="8" y1="22" x2="16" y2="22"></line>
                </svg>
              </div>
              <div>
                <h4 class="ai-title">KarthiMart AI Guide</h4>
                <span class="ai-status"><span class="status-dot"></span> Online • Instant Answers</span>
              </div>
            </div>
            <button id="ai-chat-close" class="ai-close-btn" aria-label="Close Chat">&times;</button>
          </div>

          <div id="ai-chat-body" class="ai-chat-body">
            <div class="ai-message bot">
              <div class="ai-msg-content">
                Hello! 👋 I'm your KarthiMart AI Concierge. I can help you find products, track orders, or answer questions about shopping, shipping, and selling.
              </div>
              <span class="ai-msg-time">Just now</span>
            </div>

            <!-- Quick Suggestion Pills -->
            <div class="ai-quick-pills">
              <button class="ai-pill" data-query="Show trending electronics">🔥 Trending Electronics</button>
              <button class="ai-pill" data-query="How does shipping & returns work?">📦 Shipping & Returns</button>
              <button class="ai-pill" data-query="Track my recent orders">🚚 Track My Orders</button>
              <button class="ai-pill" data-query="Best coffee recommendations">☕ Coffee Beans</button>
              <button class="ai-pill" data-query="How do I become a seller?">💼 Become a Seller</button>
            </div>
          </div>

          <form id="ai-chat-form" class="ai-chat-form">
            <input 
              type="text" 
              id="ai-chat-input" 
              placeholder="Ask about products, deals, or orders..." 
              maxlength="200"
              autocomplete="off"
            />
            <button type="submit" id="ai-chat-send" aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }

  bindEvents() {
    const trigger = document.getElementById('ai-chat-trigger');
    const closeBtn = document.getElementById('ai-chat-close');
    const panel = document.getElementById('ai-chat-panel');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const body = document.getElementById('ai-chat-body');

    trigger.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      panel.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) {
        input.focus();
        this.scrollToBottom();
      }
    });

    closeBtn.addEventListener('click', () => {
      this.isOpen = false;
      panel.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      this.handleUserMessage(text);
      input.value = '';
    });

    body.addEventListener('click', (e) => {
      const pill = e.target.closest('.ai-pill');
      if (pill) {
        const query = pill.getAttribute('data-query');
        this.handleUserMessage(query);
      }

      const viewBtn = e.target.closest('.ai-product-view');
      if (viewBtn) {
        const pId = viewBtn.getAttribute('data-id');
        if (window.app && window.app.openProductModal) {
          window.app.openProductModal(pId);
        }
      }
    });
  }

  handleUserMessage(text) {
    if (this.isRateLimited()) {
      this.appendBotMessage("⚠️ Rate limit reached (max 10 messages/minute). Please pause for a moment before sending another message.");
      return;
    }

    this.appendUserMessage(text);
    this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator();
      const reply = this.generateResponse(text);
      this.appendBotMessage(reply.text, reply.cards);
    }, 450);
  }

  isRateLimited() {
    const now = Date.now();
    this.messageTimestamps = this.messageTimestamps.filter(t => now - t < 60000);
    if (this.messageTimestamps.length >= this.maxRatePerMinute) {
      return true;
    }
    this.messageTimestamps.push(now);
    return false;
  }

  generateResponse(query) {
    const qLower = query.toLowerCase().trim();

    // Check cache
    if (this.cache.has(qLower)) {
      return this.cache.get(qLower);
    }

    let response = { text: "", cards: [] };
    const products = store.getProducts();

    // 1. Order tracking & status
    if (qLower.includes('track') || qLower.includes('my order') || qLower.includes('order status')) {
      const user = store.getCurrentUser();
      if (!user) {
        response.text = "Please log in to view and track your orders. You can use the Login button in the top navigation.";
      } else {
        const orders = store.getOrders().filter(o => o.buyerId === user.id);
        if (orders.length === 0) {
          response.text = `Hi ${user.name}, you don't have any orders placed yet! Browse our catalog to place your first order.`;
        } else {
          const latest = orders[0];
          response.text = `Here is your latest order **#${latest.id}**:\n• Status: **${latest.orderStatus}**\n• Total: **₹${latest.totalAmount.toLocaleString('en-IN')}**\n• Items: ${latest.items.map(i => i.name).join(', ')}\n• Delivery to: ${latest.shippingAddress.city}, ${latest.shippingAddress.pincode}.\n\nYou can view full details in the **Orders** section.`;
        }
      }
    }

    // 2. Shipping & Returns Policy
    else if (qLower.includes('shipping') || qLower.includes('delivery') || qLower.includes('return') || qLower.includes('refund')) {
      response.text = "🚚 **Shipping & Return Policy**:\n• **Free Standard Shipping** on all orders above ₹1,000! (₹99 for smaller orders).\n• **Delivery Time**: Usually delivered within 2-4 business days across India.\n• **Easy 7-Day Returns**: Hassle-free replacement or full refund for unopened/defective items with zero return fees.";
    }

    // 3. Payment queries
    else if (qLower.includes('payment') || qLower.includes('pay') || qLower.includes('upi') || qLower.includes('cod')) {
      response.text = "💳 **Payment Options**:\nWe support Instant UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery (COD). In this demo sandbox, all payments are securely mocked without charging real money!";
    }

    // 4. Selling / Seller account
    else if (qLower.includes('seller') || qLower.includes('sell') || qLower.includes('merchant')) {
      response.text = "💼 **Selling on KarthiMart**:\nYou can register directly as a **Seller** using our Sign-Up form or switch to a demo seller account with one click! Sellers enjoy our unified dashboard to list products, manage inventory, adjust prices, and monitor incoming buyer orders.";
    }

    // 5. Product specific matching
    else {
      let matched = [];
      if (qLower.includes('electronic') || qLower.includes('gadget')) {
        matched = products.filter(p => p.category === 'Electronics');
      } else if (qLower.includes('headphone') || qLower.includes('audio') || qLower.includes('earbud')) {
        matched = products.filter(p => p.name.toLowerCase().includes('headphone') || p.tags.includes('audio'));
      } else if (qLower.includes('coffee') || qLower.includes('honey') || qLower.includes('grocery')) {
        matched = products.filter(p => p.category === 'Groceries & Gourmet');
      } else if (qLower.includes('watch')) {
        matched = products.filter(p => p.name.toLowerCase().includes('watch'));
      } else if (qLower.includes('chair') || qLower.includes('lamp') || qLower.includes('home')) {
        matched = products.filter(p => p.category === 'Home & Living');
      } else if (qLower.includes('fashion') || qLower.includes('hoodie') || qLower.includes('wallet')) {
        matched = products.filter(p => p.category === 'Fashion');
      } else if (qLower.includes('beauty') || qLower.includes('skin') || qLower.includes('serum')) {
        matched = products.filter(p => p.category === 'Beauty & Wellness');
      } else if (qLower.includes('sport') || qLower.includes('fitness') || qLower.includes('yoga') || qLower.includes('bottle')) {
        matched = products.filter(p => p.category === 'Sports & Fitness');
      } else if (qLower.includes('trending') || qLower.includes('best') || qLower.includes('popular')) {
        matched = products.filter(p => p.badge === 'Bestseller' || p.badge === 'Trending' || p.rating >= 4.8);
      } else {
        // Keyword search in name or tags
        matched = products.filter(p => 
          p.name.toLowerCase().includes(qLower) || 
          p.category.toLowerCase().includes(qLower) ||
          p.tags.some(t => t.includes(qLower))
        );
      }

      if (matched.length > 0) {
        response.text = `Here are the top ${Math.min(3, matched.length)} matching recommendations on KarthiMart:`;
        response.cards = matched.slice(0, 3);
      } else {
        response.text = `I couldn't find exact matches for "${query}". You can browse our categories above or ask about headphones, watches, coffee, ergonomics, skincare, or order status!`;
      }
    }

    this.cache.set(qLower, response);
    return response;
  }

  appendUserMessage(text) {
    const body = document.getElementById('ai-chat-body');
    const msg = document.createElement('div');
    msg.className = 'ai-message user';
    msg.innerHTML = `
      <div class="ai-msg-content">${this.escapeHTML(text)}</div>
      <span class="ai-msg-time">Just now</span>
    `;
    body.appendChild(msg);
    this.scrollToBottom();
  }

  appendBotMessage(text, cards = []) {
    const body = document.getElementById('ai-chat-body');
    const msg = document.createElement('div');
    msg.className = 'ai-message bot';

    let formattedText = this.escapeHTML(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    let cardsHTML = '';
    if (cards && cards.length > 0) {
      cardsHTML = `
        <div class="ai-product-cards">
          ${cards.map(p => `
            <div class="ai-mini-card">
              <img src="${p.image}" alt="${this.escapeHTML(p.name)}" class="ai-card-img" />
              <div class="ai-card-details">
                <span class="ai-card-title">${this.escapeHTML(p.name)}</span>
                <div class="ai-card-meta">
                  <span class="ai-card-price">₹${p.price.toLocaleString('en-IN')}</span>
                  <span class="ai-card-rating">★ ${p.rating}</span>
                </div>
                <button class="ai-product-view" data-id="${p.id}">View Product</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    msg.innerHTML = `
      <div class="ai-msg-content">${formattedText} ${cardsHTML}</div>
      <span class="ai-msg-time">Just now</span>
    `;
    body.appendChild(msg);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const body = document.getElementById('ai-chat-body');
    const typing = document.createElement('div');
    typing.id = 'ai-typing-indicator';
    typing.className = 'ai-message bot typing';
    typing.innerHTML = `
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    body.appendChild(typing);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const typing = document.getElementById('ai-typing-indicator');
    if (typing) typing.remove();
  }

  scrollToBottom() {
    const body = document.getElementById('ai-chat-body');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

if (typeof window !== 'undefined') {
  window.KarthiMartAI = KarthiMartAI;
}
