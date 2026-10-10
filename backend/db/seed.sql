-- ============================================================================
-- KarthiMart Seed Data (seed.sql)
-- Pre-populated users, products, orders, and reviews
-- Passwords hashed with BCrypt (Cost factor: 10, Plaintext: "password123")
-- ============================================================================

-- 1. Seed Users (Admin, Sellers, Buyers)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Karthi Admin', 'admin@karthimart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
(2, 'Apex Electronics', 'seller@karthimart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SELLER'),
(3, 'Priya Sharma', 'buyer@karthimart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'BUYER'),
(4, 'Karthi Living Hub', 'living@karthimart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SELLER'),
(5, 'Velvet & Thread', 'velvet@karthimart.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SELLER');

-- 2. Seed Products
INSERT INTO products (id, seller_id, name, description, price, stock_qty, category, image_url) VALUES
(1, 2, 'Aura Pro Wireless Noise-Cancelling Headphones', 'Spatial audio, 40dB active noise cancellation, 36h battery life.', 8999.00, 24, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80'),
(2, 2, 'Zenith Ultra Slim Smartwatch 2.0', '1.78 AMOLED display, SpO2 monitor, 100+ sport modes, 10-day battery.', 4499.00, 35, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80'),
(3, 2, 'Veloce Mechanical Gaming Keyboard RGB', 'Hot-swappable linear switches, PBT double-shot keycaps, aluminum body.', 3299.00, 18, 'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80'),
(4, 2, 'Optix 27-inch 4K UHD IPS Frameless Monitor', 'Ultra HD 3840x2160, 99% sRGB, HDR400, USB-C 65W charging.', 21999.00, 12, 'Electronics', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=80'),
(5, 4, 'Aerocool Pro Ergonomic Office Chair', 'Full mesh backrest, 3D dynamic lumbar support, 4D adjustable armrests.', 13499.00, 15, 'Home & Living', 'https://images.unsplash.com/photo-1580481077195-c3c2b972e276?auto=format&fit=crop&w=700&q=80'),
(6, 4, 'Barista Artisanal Ceramic Pour-Over Set', 'Handcrafted matte dripper, 600ml borosilicate glass server, walnut collar.', 1899.00, 40, 'Home & Living', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80'),
(7, 4, 'Lumina Touch LED Desk Lamp with Wireless Charger', '5 color temperatures, Qi 15W wireless base charger, eye-care filter.', 2299.00, 28, 'Home & Living', 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=700&q=80'),
(8, 5, 'Urban Minimalist Chronograph Leather Watch', '316L stainless steel, Italian veg-tanned leather, Japanese quartz.', 3799.00, 20, 'Fashion', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80'),
(9, 5, 'Solstice Heavyweight Organic Cotton Hoodie', '420 GSM 100% GOTS certified French terry cotton, dropped-shoulder fit.', 2499.00, 32, 'Fashion', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80'),
(10, 5, 'Strata Premium Heritage Leather Bifold Wallet', 'Full-grain pull-up leather, RFID protection, 8 card slots.', 1299.00, 45, 'Fashion', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80');

-- 3. Seed Orders & Order Items
INSERT INTO orders (id, buyer_id, status, total_amount, payment_method) VALUES
(101, 3, 'DELIVERED', 8999.00, 'UPI'),
(102, 3, 'SHIPPED', 2499.00, 'Credit Card');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
(1, 101, 1, 1, 8999.00),
(2, 102, 9, 1, 2499.00);

-- 4. Seed Reviews
INSERT INTO reviews (id, product_id, user_id, rating, comment) VALUES
(1, 1, 3, 5, 'Exceptional noise cancellation and battery life. Exceeded expectations!'),
(2, 2, 3, 4, 'Very crisp display and accurate health tracking. Great value.');
