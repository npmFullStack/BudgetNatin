import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js"; // ADD THIS IMPORT

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple CORS
app.use(cors({
    origin: ["http://localhost:5173", "https://budgetnatinweb.onrender.com"],
    credentials: true
}));

app.use(express.json());

// TEMPORARY: Database setup endpoint
app.get("/api/setup-db", async (req, res) => {
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
        `;
        
        await pool.query(sql);
        res.json({ success: true, message: "Database tables created successfully!" });
    } catch (error) {
        console.error('Database setup error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});

// Root
app.get("/", (req, res) => {
    res.json({ message: "Budgetnatin Backend API is running!" });
});

// Import your routes AFTER database setup
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

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server started on port ${PORT}`);
});