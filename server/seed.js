require('dotenv').config();

// [name, brand, category, emoji, price (₹), mrp (₹), stock, rating, reviews, description]
// Brands are fictional. Products render as coloured emoji tiles unless an image URL is set in Admin.
const rows = [
  // Mobiles
  ['Nexa X5 5G (8GB RAM, 128GB)', 'Nexa', 'Mobiles', '📱', 24999, 29999, 40, 4.4, 12840, '6.7" AMOLED 120Hz display, 50MP triple camera, 5000mAh battery with 67W fast charging.'],
  ['Zenix Lite 4G (4GB RAM, 64GB)', 'Zenix', 'Mobiles', '📱', 8499, 10999, 80, 4.1, 30211, '6.5" HD+ display, 13MP dual camera, 5000mAh battery. Great first smartphone.'],
  ['Vertex Pro Max (12GB RAM, 256GB)', 'Vertex', 'Mobiles', '📲', 54999, 64999, 20, 4.6, 5120, 'Flagship 6.8" LTPO display, 200MP camera system, wireless charging and 5 years of updates.'],
  ['Orbit Mini 5G (6GB RAM, 128GB)', 'Orbit', 'Mobiles', '📱', 13999, 16999, 55, 4.2, 9876, 'Compact 6.1" display, 64MP camera, 33W charging, dual 5G SIM.'],
  // Laptops
  ['Aero Book 14 (Core i5, 16GB, 512GB SSD)', 'Aero', 'Laptops', '💻', 52990, 69990, 25, 4.3, 2210, '14" FHD IPS, backlit keyboard, fingerprint reader, up to 10 hours of battery.'],
  ['Zenix Slim 15 (Ryzen 5, 8GB, 512GB)', 'Zenix', 'Laptops', '💻', 38990, 52990, 30, 4.2, 4180, '15.6" FHD anti-glare display, thin and light 1.6 kg body, Windows 11 Home.'],
  ['Vertex Creator 16 (RTX, 32GB, 1TB)', 'Vertex', 'Laptops', '🖥️', 119990, 139990, 8, 4.7, 640, '16" QHD+ 165Hz display, dedicated GPU, ideal for editing, 3D and gaming.'],
  ['Nexa Chromebook 11 (4GB, 64GB)', 'Nexa', 'Laptops', '💻', 17990, 24990, 40, 4.0, 3120, 'Rugged 11.6" student laptop with 12-hour battery and Chrome OS.'],
  // Electronics
  ['Bolt Wireless Earbuds with ANC', 'Bolt', 'Electronics', '🎧', 1999, 4999, 150, 4.2, 58234, 'Active noise cancellation, 40-hour playback, IPX5 sweat resistance, low-latency gaming mode.'],
  ['Tango 20W Bluetooth Speaker', 'Tango', 'Electronics', '🔊', 2499, 5999, 90, 4.3, 17650, 'Deep bass, RGB lights, 12-hour playtime and IPX6 water resistance.'],
  ['Lumo Active Smart Watch', 'Lumo', 'Electronics', '⌚', 3499, 7999, 70, 4.0, 22910, '1.8" AMOLED display, SpO2, heart-rate and sleep tracking, 100+ sports modes.'],
  ['Orbit Power Bank 20000mAh', 'Orbit', 'Electronics', '🔋', 1799, 2999, 120, 4.4, 40190, '22.5W fast charging, dual output, USB-C in/out, airline-safe.'],
  // TVs & Appliances
  ['Vertex 43" 4K Ultra HD Smart TV', 'Vertex', 'TVs & Appliances', '📺', 26999, 42999, 18, 4.3, 14520, 'Dolby Vision, 3 HDMI, built-in streaming apps and voice remote.'],
  ['Aero 7 kg Front Load Washing Machine', 'Aero', 'TVs & Appliances', '🧺', 29990, 38990, 14, 4.4, 6310, 'Inverter motor, 15 wash programs, in-built heater and 5-star energy rating.'],
  ['Frostline 253 L Double Door Refrigerator', 'Frostline', 'TVs & Appliances', '🧊', 27490, 34990, 12, 4.2, 8744, 'Frost-free cooling, convertible freezer, stabilizer-free operation from 130V.'],
  ['Breeze 1.5 Ton 3 Star Split AC', 'Breeze', 'TVs & Appliances', '❄️', 33990, 52990, 10, 4.1, 7421, 'Inverter compressor, copper condenser, anti-dust filter and PM 2.5 filter.'],
  // Fashion
  ['Urban Cotton Slim-Fit T-Shirts (Pack of 3)', 'Urban', 'Fashion', '👕', 599, 1799, 200, 4.1, 91230, 'Breathable 100% cotton, round neck, machine washable. Assorted colours.'],
  ['Denimo Men\'s Slim Stretch Jeans', 'Denimo', 'Fashion', '👖', 899, 2499, 140, 4.0, 33190, 'Mid-rise slim fit with comfortable stretch and a classic five-pocket design.'],
  ['Ethnica Women\'s Printed Kurta Set', 'Ethnica', 'Fashion', '👗', 1299, 2999, 90, 4.3, 12480, 'Rayon kurta with palazzo and dupatta, festive-ready prints.'],
  ['Urban Hooded Sweatshirt', 'Urban', 'Fashion', '🧥', 999, 2299, 110, 4.2, 18420, 'Fleece-lined hoodie with kangaroo pocket and drawstring hood.'],
  // Footwear
  ['Stride Pro Running Shoes', 'Stride', 'Footwear', '👟', 1799, 3999, 100, 4.2, 26540, 'Lightweight mesh upper, cushioned midsole and grippy outsole.'],
  ['Kicks Casual White Sneakers', 'Kicks', 'Footwear', '👟', 1299, 2999, 130, 4.1, 41280, 'Everyday sneakers with a soft insole and a durable rubber sole.'],
  ['Comfy Walk Men\'s Sandals', 'Comfy', 'Footwear', '🩴', 499, 999, 180, 4.0, 52110, 'Velcro-adjustable sandals with a cushioned footbed. Light and washable.'],
  ['Formo Genuine Leather Formal Shoes', 'Formo', 'Footwear', '👞', 1999, 4499, 60, 4.3, 9340, 'Oxford-style lace-ups in full-grain leather with a flexible sole.'],
  // Home & Kitchen
  ['Cozy 5-Piece Non-Stick Cookware Set', 'Cozy', 'Home & Kitchen', '🍳', 1499, 3499, 75, 4.2, 15980, 'Induction-friendly granite-coated set with cool-touch handles.'],
  ['Hydra 1 L Insulated Steel Bottle', 'Hydra', 'Home & Kitchen', '🧴', 449, 899, 250, 4.4, 77210, 'Keeps water cold for 24 hours and hot for 12. BPA-free and leak-proof.'],
  ['Brew 1.5 L Electric Kettle', 'Brew', 'Home & Kitchen', '☕', 699, 1499, 160, 4.1, 36420, 'Stainless-steel body with auto shut-off and boil-dry protection.'],
  ['Lumo LED Study Desk Lamp', 'Lumo', 'Home & Kitchen', '💡', 799, 1599, 95, 4.3, 11230, 'Touch dimming, 3 colour temperatures, flexible neck, USB powered.'],
  // Beauty
  ['Glow Vitamin C Face Serum 30 ml', 'Glow', 'Beauty', '🧴', 399, 799, 220, 4.1, 48210, 'Brightening serum with 10% Vitamin C and hyaluronic acid.'],
  ['Silk 1800W Professional Hair Dryer', 'Silk', 'Beauty', '💇', 899, 1999, 85, 4.0, 19420, '3 heat and 2 speed settings, cool-shot button and ionic technology.'],
  ['Bloom Matte Lipstick Set (6 shades)', 'Bloom', 'Beauty', '💄', 499, 1199, 140, 4.2, 23190, 'Long-wear creamy matte formula in six everyday shades.'],
  ['Groom Pro Cordless Beard Trimmer', 'Groom', 'Beauty', '🧔', 999, 1999, 120, 4.3, 61020, '40 length settings, 90-minute runtime and fast USB charging.'],
  // Sports
  ['Willow Pro Kashmir Willow Cricket Bat', 'Willow', 'Sports', '🏏', 1499, 2999, 45, 4.2, 5420, 'Full-size bat with a thick edge and a comfortable grip. Pre-knocked.'],
  ['Zen Anti-Slip Yoga Mat 6 mm', 'Zen', 'Sports', '🧘', 499, 1299, 210, 4.3, 38420, 'Extra-cushioned, non-slip, tear-resistant mat with a carry strap.'],
  ['Power Adjustable Dumbbell Set 20 kg', 'Power', 'Sports', '🏋️', 2499, 4999, 50, 4.2, 8120, 'Cast-iron plates with anti-rust coating and a secure spin-lock.'],
  ['Pedal 21-Speed Mountain Bike 26T', 'Pedal', 'Sports', '🚵', 8999, 14999, 15, 4.1, 2310, 'Dual-disc brakes, front suspension and a high-tensile steel frame.'],
  // Toys
  ['Brick Builder Creative Set (500 pcs)', 'Brick', 'Toys', '🧱', 799, 1599, 100, 4.5, 14230, 'Compatible building bricks with an idea booklet. Ages 6+.'],
  ['Remo Rechargeable RC Racing Car', 'Remo', 'Toys', '🏎️', 999, 2199, 80, 4.1, 9540, '2.4 GHz remote, 4WD drift tyres and 30-minute battery.'],
  ['Cuddle Soft Plush Teddy Bear 3 ft', 'Cuddle', 'Toys', '🧸', 599, 1499, 70, 4.4, 27180, 'Ultra-soft, hypoallergenic stuffed teddy with a satin ribbon.'],
  ['Genius Family Board Game Pack', 'Genius', 'Toys', '🎲', 449, 999, 120, 4.3, 12040, 'Four classic games in one box for ages 6 and up.'],
  // Books
  ['The Startup Playbook (Paperback)', 'Pageturn', 'Books', '📘', 299, 499, 150, 4.4, 8420, 'A practical guide to taking a product from idea to first 1,000 customers.'],
  ['Mindful Mornings: Build Better Habits', 'Pageturn', 'Books', '📗', 199, 350, 200, 4.2, 15310, 'Simple routines to start every day with focus and calm.'],
  ['Python in 30 Days', 'CodeCraft', 'Books', '📙', 349, 699, 130, 4.5, 6230, 'Hands-on lessons and projects that take you from basics to real programs.'],
  ['Tales of the Nilgiris (Kids Illustrated)', 'Little Leaf', 'Books', '📕', 249, 399, 160, 4.6, 3120, 'Illustrated stories set in the hills for readers aged 5 to 9.'],
  // Grocery
  ['FarmFresh Aged Basmati Rice 5 kg', 'FarmFresh', 'Grocery', '🌾', 549, 749, 300, 4.3, 45210, 'Long-grain, aromatic, aged for 24 months.'],
  ['Sunrise Cold-Pressed Groundnut Oil 1 L', 'Sunrise', 'Grocery', '🥜', 289, 399, 260, 4.2, 18420, 'Traditionally extracted with no chemicals, full of natural aroma.'],
  ['Brewmate South Indian Filter Coffee 500 g', 'Brewmate', 'Grocery', '☕', 349, 499, 180, 4.5, 21130, '80:20 coffee-chicory blend, medium-dark roast.'],
  ['Nutri Premium Mixed Dry Fruits 1 kg', 'Nutri', 'Grocery', '🥜', 799, 1299, 90, 4.3, 9870, 'Almonds, cashews, raisins, pistachios and walnuts, vacuum packed.'],
];

const products = rows.map(([name, brand, category, emoji, price, mrp, countInStock, rating, numReviews, description]) => ({ name, brand, category, emoji, price, mrp, countInStock, rating, numReviews, description }));

const bcrypt = require('bcryptjs');
const { pool, connectDB } = require('./config/db');
(async () => {
  try {
    await connectDB();
    const conn=await pool.getConnection();
    try {
      await conn.beginTransaction();
      // WARNING: This seed clears existing VS Cart demo records. Never run against production data.
      await conn.execute('DELETE FROM orders');
      await conn.execute('DELETE FROM products');
      await conn.execute('DELETE FROM users');
      const adminPass=await bcrypt.hash('admin123',10), customerPass=await bcrypt.hash('user123',10);
      await conn.execute('INSERT INTO users(name,email,password,isAdmin) VALUES(?,?,?,TRUE)', ['Admin','admin@example.com',adminPass]);
      await conn.execute('INSERT INTO users(name,email,password,isAdmin) VALUES(?,?,?,FALSE)', ['Demo Customer','user@example.com',customerPass]);
      for(const p of products){
        const mrp=Math.max(Number(p.mrp||p.price),Number(p.price));
        const discount=mrp>0?Math.round(((mrp-Number(p.price))/mrp)*100):0;
        await conn.execute('INSERT INTO products(name,brand,description,price,mrp,discount,image,emoji,category,countInStock,rating,numReviews) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
          [p.name,p.brand||'',p.description||'',p.price,mrp,discount,p.image||'',p.emoji||'🛍️',p.category,p.countInStock||0,p.rating||0,p.numReviews||0]);
      }
      await conn.commit();
    }catch(e){await conn.rollback();throw e;}finally{conn.release();}
    console.log(`Seeded ${products.length} products and 2 users into MySQL.`);
    console.log(' Admin: admin@example.com / admin123');
    console.log(' Customer: user@example.com / user123');
  } catch(err){console.error(err);process.exitCode=1;} finally {await pool.end();}
})();
