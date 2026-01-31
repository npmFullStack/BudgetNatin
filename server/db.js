import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Function to create tables
const createTables = async () => {
  const client = await pool.connect();
  try {
    // Create users table first
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        firstname VARCHAR(50),
        lastname VARCHAR(50),
        auth_provider VARCHAR(20) DEFAULT 'local',
        provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create other tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS expense_categories (
        category_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT unique_user_category UNIQUE (user_id, name)
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS monthly_budget (
        budget_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        month DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT unique_user_month UNIQUE (user_id, month)
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        expense_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        budget_month DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category_id INT NOT NULL,
        expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES expense_categories(category_id) ON DELETE CASCADE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS extra_money (
        extra_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        budget_month DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        message TEXT,
        type VARCHAR(20) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        related_id INT,
        related_type VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    console.log("✅ Database tables created successfully!");
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    client.release();
  }
};

// Initialize database on startup
createTables();

export const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

export default pool;