const mysql = require('mysql2/promise');
const fs = require('fs');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'vscart',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  queueLimit: 0,
  timezone: 'Z',
  // Enable verified TLS for Amazon RDS when DB_SSL=true.
  ssl: process.env.DB_SSL === 'true'
    ? {
        ca: fs.readFileSync(process.env.DB_SSL_CA || '/etc/ssl/certs/rds-global-bundle.pem'),
        rejectUnauthorized: true,
      }
    : undefined,
});

async function connectDB() {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    throw new Error('DB_HOST, DB_USER, DB_PASSWORD and DB_NAME must be configured');
  }
  await pool.query('SELECT 1');
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL, brand VARCHAR(150) NOT NULL DEFAULT '',
    description TEXT, price DECIMAL(10,2) NOT NULL, mrp DECIMAL(10,2) NOT NULL,
    discount INT NOT NULL DEFAULT 0, image TEXT, emoji VARCHAR(32) DEFAULT '🛍️',
    category VARCHAR(150) NOT NULL, countInStock INT NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0, numReviews INT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_category_price (category, price), INDEX idx_products_created (createdAt)
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT UNSIGNED NOT NULL,
    items JSON NOT NULL, shippingAddress JSON NOT NULL,
    paymentMethod ENUM('card','cod') NOT NULL DEFAULT 'card',
    itemsPrice DECIMAL(10,2) NOT NULL, shippingPrice DECIMAL(10,2) NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL, isPaid BOOLEAN NOT NULL DEFAULT FALSE,
    paidAt DATETIME NULL, status ENUM('processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'processing',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_user (userId), CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES users(id)
  ) ENGINE=InnoDB`);
  console.log('MySQL connected and VS Cart tables verified/created');
}
module.exports = { pool, connectDB };
