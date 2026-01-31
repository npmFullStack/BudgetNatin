import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./oauth.js";
import authRoutes from "./authRoutes.js";
import monthlyBudgetRoutes from "./monthlyBudgetRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import expenseCategoryRoutes from "./expenseCategoryRoutes.js";
import extraMoneyRoutes from "./extraMoneyRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import "./db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "https://budgetnatinweb.onrender.com",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    })
);

app.use(express.json());

// Session middleware for production
app.use(
    session({
        secret: process.env.JWT_SECRET || "your_session_secret",
        resave: false,
        saveUninitialized: false,
        proxy: true, // Important for Render
        cookie: {
            secure: true, // Must be true for HTTPS
            httpOnly: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
        service: "budgetnatin-backend",
        version: "1.0.0",
        database: "connected"
    });
});

// Keep-alive endpoint (prevent Render sleep)
app.get("/keep-alive", (req, res) => {
    res.status(200).json({
        alive: true,
        timestamp: new Date(),
        message: "Service is active and running"
    });
});

// Database setup endpoint (temporary - remove after setup)
import pool from './db.js';
app.get("/api/setup-database", async (req, res) => {
    try {
        // Re-run table creation
        const sql = `YOUR_SQL_SCHEMA_HERE`;
        await pool.query(sql);
        res.json({ 
            success: true, 
            message: "Database tables created successfully!" 
        });
    } catch (error) {
        console.error('Database setup error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Budgetnatin Backend API is running!",
        version: "1.0.0",
        environment: process.env.NODE_ENV,
        endpoints: {
            auth: "/api/auth",
            expenses: "/api/expenses",
            categories: "/api/expense-categories",
            budget: "/api/monthly-budget",
            extraMoney: "/api/extra-money",
            notifications: "/api/notifications"
        },
        health: "/health",
        keepAlive: "/keep-alive"
    });
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/expense-categories", expenseCategoryRoutes);
app.use("/api/extra-money", extraMoneyRoutes);
app.use("/api/monthly-budget", monthlyBudgetRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("🚨 Server Error:", err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
        timestamp: new Date()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.path,
        method: req.method,
        timestamp: new Date()
    });
});

// Start server
app.listen(PORT, () => {
    console.log("=".repeat(50));
    console.log(`✅ Server started on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 CORS Origins: ${allowedOrigins.join(', ')}`);
    console.log("=".repeat(50));
    
    // Log startup message with URLs
    if (process.env.NODE_ENV === 'production') {
        console.log(`🚀 Production Server Running`);
        console.log(`🔗 Health Check: https://budgetnatin.onrender.com/health`);
        console.log(`🔗 Keep Alive: https://budgetnatin.onrender.com/keep-alive`);
    } else {
        console.log(`🚀 Development Server: http://localhost:${PORT}`);
    }
});