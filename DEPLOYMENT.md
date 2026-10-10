# 🚀 KarthiMart — Public URL Deployment Guide

This guide explains exactly how to deploy **KarthiMart** online and obtain a **free, live, 24/7 public link** in under 60 seconds.

---

## 🎯 Which Files / Folders to Upload?

Everything you need for the public link is located at the root of your project:

```
📁 Karthi prabhu Mart/
├── 📄 index.html          <-- Main entry point
├── 📁 css/
│   └── 📄 style.css       <-- Complete design & styling
├── 📁 js/
│   ├── 📄 app.js          <-- Core app & routing
│   ├── 📄 store.js        <-- LocalStorage database & seed data
│   ├── 📄 products.js     <-- 16+ Curated multi-category products
│   ├── 📄 auth.js         <-- Buyer, Seller, and Admin authentication
│   ├── 📄 cart.js         <-- Cart drawer, coupons & mock payment
│   ├── 📄 orders.js       <-- Order workflow & review system
│   ├── 📄 seller.js       <-- Merchant dashboard & listing controls
│   ├── 📄 admin.js        <-- Superadmin operations & moderation
│   └── 📄 chatbot.js      <-- AI Shopping Assistant
└── 📁 backend/            <-- Java Servlets, JDBC, Maven & SQL (for Tomcat submission)
```

---

## ⚡ Option 1: Netlify Drag & Drop (Instant Live URL — Recommended)

1. Open **[Netlify Drop](https://app.netlify.com/drop)** in your web browser.
2. Drag and drop the **entire `Karthi prabhu Mart` folder** (or a `.zip` containing `index.html`, `css/`, and `js/`) directly onto the Netlify drop zone.
3. Within 5 seconds, Netlify will generate your live public URL:
   ```
   https://karthimart-xxxxxx.netlify.app
   ```
4. You can share this URL with faculty, evaluators, and teammates!

---

## ⚡ Option 2: GitHub Pages (Free Permanent Hosting)

1. Create a new GitHub repository named `karthimart`.
2. Push your project files:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for KarthiMart"
   git branch -M main
   git remote add origin https://github.com/<your-username>/karthimart.git
   git push -u origin main
   ```
3. In your repository on GitHub:
   - Click **Settings** → **Pages** (under the "Code and automation" sidebar).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/ (root)`.
   - Click **Save**.
4. Within 1 minute, your site will be live at:
   ```
   https://<your-username>.github.io/karthimart/
   ```

---

## ⚡ Option 3: Vercel

1. Go to **[vercel.com](https://vercel.com)** and log in with GitHub.
2. Click **Add New Project** → Import your `karthimart` repository.
3. Keep default settings (Framework: *Other*, Root Directory: `./`).
4. Click **Deploy**.
5. Your public URL will be ready instantly:
   ```
   https://karthimart.vercel.app
   ```

---

## ☕ Option 4: Apache Tomcat 9 Deployment (Academic Java Submission)

If submitting the Java Servlet WAR package for Anna University R2025:
1. Navigate into the `backend/` directory:
   ```bash
   cd backend
   mvn clean package
   ```
2. Copy the resulting `target/karthimart.war` file into Tomcat's `webapps/` folder:
   ```bash
   cp target/karthimart.war /opt/tomcat/webapps/
   ```
3. Start Tomcat:
   ```bash
   /opt/tomcat/bin/startup.sh
   ```
4. Access the application on `http://localhost:8080/karthimart/`.
