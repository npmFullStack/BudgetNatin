import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "./oauth.js";
import connection from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== REGISTER USER ========
router.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, username, email, password } = req.body;

        // Check if data is provided
        if (!firstname || !lastname || !username || !email || !password) {
            const response = createResponse(
                false,
                "Please provide all required fields"
            );
            return res.status(400).json(response);
        }

        // Check if user already exists
        const [existingUsers] = await connection.query(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [email, username]
        );

        if (existingUsers.length > 0) {
            const response = createResponse(
                false,
                "User already exists with this email or username"
            );
            return res.status(400).json(response);
        }

        // Hash password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into database
        const [result] = await connection.query(
            "INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)",
            [firstname, lastname, username, email, hashedPassword]
        );

        // Create JWT token
        const token = jwt.sign(
            {
                id: result.insertId,
                email: email,
                username: username
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // Token expires in 7 days
        );

        // Create new user object (without password)
        const newUser = {
            id: result.insertId,
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

        // Check if data is provided
        if (!email || !password) {
            const response = createResponse(
                false,
                "Please provide email and password"
            );
            return res.status(400).json(response);
        }

        // Find user by email
        const [users] = await connection.query(
            "SELECT * FROM users WHERE email = ? AND auth_provider = 'local'",
            [email]
        );

        // Check if user exists
        if (users.length === 0) {
            const response = createResponse(false, "Invalid email or password");
            return res.status(400).json(response);
        }

        const user = users[0];

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
            // User is authenticated via Google
            const user = req.user;

            // Create JWT token for your app
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

            // Redirect to frontend with token and user data as URL parameters
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
        // Get user ID from token (set by verifyToken middleware)
        const userId = req.user.id;

        // Get user from database
        const [users] = await connection.query(
            "SELECT id, firstname, lastname, username, email, auth_provider, created_at FROM users WHERE id = ?",
            [userId]
        );

        // Check if user exists
        if (users.length === 0) {
            const response = createResponse(false, "User not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "User data retrieved", users[0]);
        res.json(response);
    } catch (error) {
        console.log("❌ Error:", error.message);
        const response = createResponse(false, "Error getting user data");
        res.status(500).json(response);
    }
});

export default router;
