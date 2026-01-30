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
import notificationRoutes from "./notificationRoutes.js"; // Add this import
import "./db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);
app.use(express.json());

// Session middleware
app.use(
    session({
        secret: process.env.JWT_SECRET || "your_session_secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/expense-categories", expenseCategoryRoutes);
app.use("/api/extra-money", extraMoneyRoutes);
app.use("/api/monthly-budget", monthlyBudgetRoutes);
app.use("/api/notifications", notificationRoutes); // Add this line

// Start server
app.listen(PORT, () => {
    console.log("============================");
    console.log(`✅ Server started on port ${PORT}`);
    console.log(`📡 http://localhost:${PORT}`);
    console.log("============================");
});