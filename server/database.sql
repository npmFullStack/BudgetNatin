-- Keep your existing users table (updated)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),
  firstname VARCHAR(50),
  lastname VARCHAR(50),
  auth_provider ENUM('local', 'google') DEFAULT 'local',
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Expense categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, name)
);

-- Monthly budget table
CREATE TABLE IF NOT EXISTS monthly_budget (
  budget_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  month DATE NOT NULL,  -- Stores month/year (e.g., '2024-01-01' for January 2024)
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_month (user_id, month)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  expense_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  budget_month DATE NOT NULL,  -- Links to monthly_budget month
  amount DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,  -- References expense_categories
  expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES expense_categories(category_id) ON DELETE CASCADE
);

-- Extra money table
CREATE TABLE IF NOT EXISTS extra_money (
  extra_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  budget_month DATE NOT NULL,  -- Links to monthly_budget month
  amount DECIMAL(10, 2) NOT NULL,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT,
  type ENUM('overdue', 'due_soon', 'info', 'warning') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  related_id INT,
  related_type VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);