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
  try {
    console.log('🔄 Creating database tables...');
    
    const sql = `
      -- Users table
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

      -- Expense categories table
      CREATE TABLE IF NOT EXISTS expense_categories (
        category_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT unique_user_category UNIQUE (user_id, name)
      );

      -- Monthly budget table
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

      -- Expenses table
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

      -- Extra money table
      CREATE TABLE IF NOT EXISTS extra_money (
        extra_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        budget_month DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Notifications table
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
    `;
    
    await pool.query(sql);
    console.log("✅ Database tables created/verified successfully!");
    
    // Create indexes
    try {
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);
        CREATE INDEX IF NOT EXISTS idx_expenses_budget_month ON expenses(budget_month);
        CREATE INDEX IF NOT EXISTS idx_monthly_budget_user_month ON monthly_budget(user_id, month);
      `;
      await pool.query(indexSql);
      console.log("✅ Database indexes created/verified successfully!");
    } catch (indexError) {
      console.log("⚠️  Index creation skipped or already exists");
    }
    
  } catch (error) {
    console.error('❌ Error creating database tables:', error.message);
    console.error('Error details:', error);
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log("✅ PostgreSQL Database Connected!");
    console.log("📅 Database time:", result.rows[0].now);
    
    // Create tables
    await createTables();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('🔄 Retrying in 10 seconds...');
    setTimeout(initializeDatabase, 10000);
  }
};

// Start database initialization (don't await, let it run in background)
initializeDatabase();

// Query helper function
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