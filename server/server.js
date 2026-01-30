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

// CORS configuration for production

const allowedOrigins = [
    "http://localhost:5173",
    "https://budgetnatinweb.onrender.com", // Your frontend URL
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1) {
                const msg =
                    "The CORS policy for this site does not allow access from the specified Origin.";
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        credentials: true
    })
);
app.use(express.json());

// Session middleware - UPDATED for production
app.use(
    session({
        secret: process.env.JWT_SECRET || "your_session_secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint (important for Render)
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Budgetnatin Backend API is running!",
        version: "1.0.0",
        docs: "/api endpoints available"
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
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message:
            process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
    console.log("============================");
    console.log(`✅ Server started on port ${PORT}`);
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("============================");
});
