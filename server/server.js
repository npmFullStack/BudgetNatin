import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

// ======================
// CONFIGURATION
// ======================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// MIDDLEWARE
// ======================
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://budgetnatinweb.onrender.com"
        ],
        credentials: true
    })
);
app.use(express.json());

// ======================
// DATABASE SETUP ENDPOINTS
// ======================

// Test database connection (with SSL bypass)
app.get("/api/test-db", async (req, res) => {
    try {
        // Simple query that doesn't require SSL
        const result = await pool.query('SELECT 1 as test');
        res.json({ 
            success: true, 
            test: result.rows[0].test,
            message: "Database connection successful (SSL bypassed)"
        });
    } catch (error) {
        console.error('Database test error:', error.message);
        
        // Try alternative connection method
        try {
            // Try without SSL
            const testPool = new pg.Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: false
            });
            const testResult = await testPool.query('SELECT 1');
            await testPool.end();
            
            res.json({ 
                success: true, 
                message: "Database works without SSL",
                note: "Update your connection to use ssl: false"
            });
        } catch (sslError) {
            res.status(500).json({ 
                success: false, 
                error: error.message,
                sslError: sslError.message,
                suggestion: "Use direct connection configuration in db.js"
            });
        }
    }
});

// Create users table
app.get("/api/setup-users", async (req, res) => {
    try {
        const sql = `
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
        `;

        await pool.query(sql);
        res.json({
            success: true,
            message: "Users table created successfully!"
        });
    } catch (error) {
        console.error("Setup error:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create all tables
app.get("/api/setup-all-tables", async (req, res) => {
    try {
        const sql = `
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

            CREATE TABLE IF NOT EXISTS expense_categories (
                category_id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT unique_user_category UNIQUE (user_id, name)
            );

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

            CREATE TABLE IF NOT EXISTS extra_money (
                extra_id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                budget_month DATE NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

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
        res.json({
            success: true,
            message: "All tables created successfully!"
        });
    } catch (error) {
        console.error("Setup error:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ======================
// SYSTEM ENDPOINTS
// ======================

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date(),
        service: "budgetnatin-backend",
        environment: process.env.NODE_ENV || "development"
    });
});

// Keep-alive endpoint
app.get("/keep-alive", (req, res) => {
    res.json({
        alive: true,
        timestamp: new Date(),
        message: "Service is active"
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Budgetnatin Backend API is running!",
        version: "1.0.0",
        endpoints: {
            database: {
                test: "/api/test-db",
                setupUsers: "/api/setup-users",
                setupAll: "/api/setup-all-tables"
            },
            system: {
                health: "/health",
                keepAlive: "/keep-alive"
            },
            api: {
                auth: "/api/auth",
                expenses: "/api/expenses",
                categories: "/api/expense-categories",
                budget: "/api/monthly-budget",
                extraMoney: "/api/extra-money",
                notifications: "/api/notifications"
            }
        }
    });
});

// ======================
// API ROUTES
// ======================
import authRoutes from "./authRoutes.js";
import monthlyBudgetRoutes from "./monthlyBudgetRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import expenseCategoryRoutes from "./expenseCategoryRoutes.js";
import extraMoneyRoutes from "./extraMoneyRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/expense-categories", expenseCategoryRoutes);
app.use("/api/extra-money", extraMoneyRoutes);
app.use("/api/monthly-budget", monthlyBudgetRoutes);
app.use("/api/notifications", notificationRoutes);

// ======================
// ERROR HANDLING
// ======================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({
        error: "Internal server error",
        message:
            process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// ======================
// SERVER START
// ======================
app.listen(PORT, () => {
    console.log("==================================");
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log("==================================");
});
