import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "./oauth.js";
import pool from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== REGISTER USER ========
router.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, username, email, password } = req.body;

        if (!firstname || !lastname || !username || !email || !password) {
            const response = createResponse(
                false,
                "Please provide all required fields"
            );
            return res.status(400).json(response);
        }

        // Check if user already exists
        const existingUsers = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );

        if (existingUsers.rows.length > 0) {
            const response = createResponse(
                false,
                "User already exists with this email or username"
            );
            return res.status(400).json(response);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into database
        const result = await pool.query(
            "INSERT INTO users (firstname, lastname, username, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [firstname, lastname, username, email, hashedPassword]
        );

        // Create JWT token
        const token = jwt.sign(
            {
                id: result.rows[0].id,
                email: email,
                username: username
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Create new user object
        const newUser = {
            id: result.rows[0].id,
            firstname: firstname,
            lastname: lastname,
            username: username,
            email: email,
            auth_provider: "local"
        };

        const response = createResponse(true, "User registered successfully", {
            user: newUser,
            token: token
        });

        res.status(201).json(response);
    } catch (error) {
        console.log("❌ Error:", error.message);
        const response = createResponse(false, "Error creating user");
        res.status(500).json(response);
    }
});

// ======== LOGIN USER ========
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const response = createResponse(
                false,
                "Please provide email and password"
            );
            return res.status(400).json(response);
        }

        // Find user by email
        const users = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND auth_provider = 'local'",
            [email]
        );

        if (users.rows.length === 0) {
            const response = createResponse(false, "Invalid email or password");
            return res.status(400).json(response);
        }

        const user = users.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const response = createResponse(false, "Invalid email or password");
            return res.status(400).json(response);
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Create user object (without password)
        const userData = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            auth_provider: user.auth_provider
        };

        const response = createResponse(true, "Login successful", {
            user: userData,
            token: token
        });

        res.json(response);
    } catch (error) {
        console.log("❌ Error:", error.message);
        const response = createResponse(false, "Error during login");
        res.status(500).json(response);
    }
});

// ======== GOOGLE AUTHENTICATION ROUTES ========

// Initiate Google OAuth flow
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// Google OAuth callback
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://localhost:5173/login?error=auth_failed",
        session: false
    }),
    async (req, res) => {
        try {
            const user = req.user;

            // Create JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    username: user.username
                },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Create user object
            const userData = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                auth_provider: user.auth_provider
            };

            const frontendUrl = `http://localhost:5173/auth/callback?token=${token}&user=${encodeURIComponent(
                JSON.stringify(userData)
            )}`;
            res.redirect(frontendUrl);
        } catch (error) {
            console.log("❌ Google callback error:", error);
            res.redirect("http://localhost:5173/login?error=auth_failed");
        }
    }
);

// ======== GET CURRENT USER ========
router.get("/me", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await pool.query(
            "SELECT id, firstname, lastname, username, email, auth_provider, created_at FROM users WHERE id = $1",
            [userId]
        );

        if (users.rows.length === 0) {
            const response = createResponse(false, "User not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "User data retrieved", users.rows[0]);
        res.json(response);
    } catch (error) {
        console.log("❌ Error:", error.message);
        const response = createResponse(false, "Error getting user data");
        res.status(500).json(response);
    }
});

export default router;