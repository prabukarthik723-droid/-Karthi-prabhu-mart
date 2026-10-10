/**
 * KarthiMart Authentication Module
 * Handles login, registration (Buyer/Seller), session state, demo switchers
 */

const auth = {
  login(email, password) {
    const users = store.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: "No account found with this email address." };
    }

    if (user.password !== password) {
      return { success: false, message: "Incorrect password. Please try again." };
    }

    // Set user session
    store.setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || ""
    });

    return { success: true, user };
  },

  register(userData) {
    const users = store.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());

    if (existing) {
      return { success: false, message: "An account with this email already exists." };
    }

    if (!userData.password || userData.password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters long." };
    }

    if (!['BUYER', 'SELLER'].includes(userData.role)) {
      return { success: false, message: "Invalid role selected." };
    }

    const newUser = {
      id: Date.now(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      role: userData.role,
      phone: userData.phone ? userData.phone.trim() : "",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    store.saveUsers(users);

    // Auto login
    store.setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone
    });

    return { success: true, user: newUser };
  },

  logout() {
    store.setCurrentUser(null);
  },

  switchRole(role) {
    const users = store.getUsers();
    const target = users.find(u => u.role === role);
    if (target) {
      store.setCurrentUser({
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
        phone: target.phone || ""
      });
      return true;
    }
    return false;
  },

  isLoggedIn() {
    return store.getCurrentUser() !== null;
  },

  isBuyer() {
    const user = store.getCurrentUser();
    return user && user.role === 'BUYER';
  },

  isSeller() {
    const user = store.getCurrentUser();
    return user && user.role === 'SELLER';
  },

  isAdmin() {
    const user = store.getCurrentUser();
    return user && user.role === 'ADMIN';
  }
};

if (typeof window !== 'undefined') {
  window.auth = auth;
}
