/**
 * KarthiMart Global Store & State Management
 * Persistent localStorage backed state with reactive event dispatch
 */

const STORAGE_KEYS = {
  USERS: 'karthimart_users',
  CURRENT_USER: 'karthimart_current_user',
  PRODUCTS: 'karthimart_products',
  CART: 'karthimart_cart',
  ORDERS: 'karthimart_orders',
  REVIEWS: 'karthimart_reviews',
  WISHLIST: 'karthimart_wishlist'
};

// Initial Seed Users (Admin, Seller, Buyer)
const INITIAL_USERS = [
  {
    id: 1,
    name: "Karthi Admin",
    email: "admin@karthimart.com",
    password: "password123",
    role: "ADMIN",
    createdAt: "2026-08-01T10:00:00Z"
  },
  {
    id: 2,
    name: "Apex Electronics",
    email: "seller@karthimart.com",
    password: "password123",
    role: "SELLER",
    phone: "+91 98765 43210",
    createdAt: "2026-08-05T11:30:00Z"
  },
  {
    id: 3,
    name: "Priya Sharma",
    email: "buyer@karthimart.com",
    password: "password123",
    role: "BUYER",
    phone: "+91 91234 56789",
    createdAt: "2026-08-10T14:15:00Z"
  },
  {
    id: 4,
    name: "Karthi Living Hub",
    email: "living@karthimart.com",
    password: "password123",
    role: "SELLER",
    phone: "+91 98888 77777",
    createdAt: "2026-08-12T09:20:00Z"
  }
];

// Initial Seed Reviews
const INITIAL_REVIEWS = [
  {
    id: 1,
    productId: 1,
    userId: 3,
    userName: "Priya Sharma",
    rating: 5,
    comment: "Exceptional sound quality and active noise cancellation! Worth every rupee.",
    createdAt: "2026-09-02T15:00:00Z"
  },
  {
    id: 2,
    productId: 2,
    userId: 3,
    userName: "Priya Sharma",
    rating: 4,
    comment: "Battery lasts easily a week. AMOLED screen is super sharp under direct sunlight.",
    createdAt: "2026-09-10T11:20:00Z"
  },
  {
    id: 3,
    productId: 13,
    userId: 3,
    userName: "Priya Sharma",
    rating: 5,
    comment: "Best artisanal coffee aroma! Freshly roasted batch with chocolate notes.",
    createdAt: "2026-09-15T18:40:00Z"
  }
];

// Initial Seed Orders
const INITIAL_ORDERS = [
  {
    id: "KM-89421",
    buyerId: 3,
    buyerName: "Priya Sharma",
    buyerEmail: "buyer@karthimart.com",
    items: [
      {
        productId: 1,
        name: "Aura Pro Wireless Noise-Cancelling Headphones",
        price: 8999.00,
        quantity: 1,
        sellerId: 2,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"
      }
    ],
    totalAmount: 8999.00,
    shippingAddress: {
      fullName: "Priya Sharma",
      street: "42 Anna Salai, Guindy",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600025",
      phone: "+91 91234 56789"
    },
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    createdAt: "2026-09-01T14:32:00Z"
  },
  {
    id: "KM-89512",
    buyerId: 3,
    buyerName: "Priya Sharma",
    buyerEmail: "buyer@karthimart.com",
    items: [
      {
        productId: 13,
        name: "Single-Estate Coorg Dark Roast Arabica Beans (500g)",
        price: 699.00,
        quantity: 2,
        sellerId: 7,
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80"
      }
    ],
    totalAmount: 1398.00,
    shippingAddress: {
      fullName: "Priya Sharma",
      street: "42 Anna Salai, Guindy",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600025",
      phone: "+91 91234 56789"
    },
    paymentMethod: "Credit Card",
    paymentStatus: "PAID",
    orderStatus: "SHIPPED",
    createdAt: "2026-09-28T09:15:00Z"
  }
];

class KarthiMartStore {
  constructor() {
    this.initStore();
  }

  initStore() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    // Always ensure fresh products with embedded SVG imagery
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
    }
    // Users start in Guest mode so they can see and use the Sign In / Register page
  }

  dispatch(event, detail = {}) {
    window.dispatchEvent(new CustomEvent(`karthimart:${event}`, { detail }));
  }

  // Users
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.dispatch('users_updated');
  }

  getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.dispatch('auth_changed', { user });
  }

  // Products
  getProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === parseInt(id));
  }

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.dispatch('products_updated');
  }

  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      ...productData,
      id: Date.now(),
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  updateProduct(productId, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === parseInt(productId));
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedData };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  }

  deleteProduct(productId) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== parseInt(productId));
    this.saveProducts(products);
  }

  // Cart
  getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
  }

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.dispatch('cart_updated', { cart });
  }

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product) return false;

    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.productId === parseInt(productId));

    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        cart[existingIndex].quantity = product.stock;
      } else {
        cart[existingIndex].quantity = newQty;
      }
    } else {
      const addQty = Math.min(quantity, product.stock);
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        stock: product.stock,
        quantity: addQty
      });
    }

    this.saveCart(cart);
    return true;
  }

  updateCartQuantity(productId, quantity) {
    let cart = this.getCart();
    const product = this.getProductById(productId);
    const existingIndex = cart.findIndex(item => item.productId === parseInt(productId));

    if (existingIndex > -1) {
      if (quantity <= 0) {
        cart.splice(existingIndex, 1);
      } else {
        const maxStock = product ? product.stock : 99;
        cart[existingIndex].quantity = Math.min(quantity, maxStock);
      }
      this.saveCart(cart);
    }
  }

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.productId !== parseInt(productId));
    this.saveCart(cart);
  }

  clearCart() {
    this.saveCart([]);
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal() {
    const cart = this.getCart();
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 99;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    return {
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax
    };
  }

  // Wishlist
  getWishlist() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
  }

  saveWishlist(list) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    this.dispatch('wishlist_updated', { list });
  }

  toggleWishlist(productId) {
    let list = this.getWishlist();
    const id = parseInt(productId);
    const index = list.indexOf(id);
    let added = false;
    if (index > -1) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(id);
      added = true;
    }
    this.saveWishlist(list);
    return added;
  }

  isInWishlist(productId) {
    const list = this.getWishlist();
    return list.includes(parseInt(productId));
  }

  // Orders
  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  }

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.dispatch('orders_updated');
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const orderId = `KM-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: orderId,
      ...orderData,
      orderStatus: 'PENDING',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    };

    // Deduct stock
    const products = this.getProducts();
    orderData.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    });
    this.saveProducts(products);

    orders.unshift(newOrder);
    this.saveOrders(orders);
    this.clearCart();
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.orderStatus = newStatus;
      this.saveOrders(orders);
      return order;
    }
    return null;
  }

  // Reviews
  getReviews(productId = null) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    if (productId) {
      return all.filter(r => r.productId === parseInt(productId));
    }
    return all;
  }

  addReview(productId, rating, comment) {
    const user = this.getCurrentUser();
    if (!user) return null;

    const reviews = this.getReviews();
    const newReview = {
      id: Date.now(),
      productId: parseInt(productId),
      userId: user.id,
      userName: user.name,
      rating: parseInt(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Update product average rating
    const prodReviews = reviews.filter(r => r.productId === parseInt(productId));
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    this.updateProduct(productId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewsCount: prodReviews.length
    });

    this.dispatch('reviews_updated');
    return newReview;
  }

  // Reset to factory seed data
  resetAll() {
    localStorage.clear();
    this.initStore();
    this.dispatch('store_reset');
  }
}

const store = new KarthiMartStore();
if (typeof window !== 'undefined') {
  window.store = store;
}
