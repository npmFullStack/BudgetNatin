import jwt from "jsonwebtoken";
import createResponse from "./helper.js";

// This middleware checks if user has valid JWT token
const verifyToken = (req, res, next) => {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // Check if token exists
    if (!token) {
        const response = createResponse(
            false,
            "Access denied. No token provided."
        );
        return res.status(401).json(response);
    }

    try {
        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Add user info to request
        next(); // Continue to next function
    } catch (error) {
        const response = createResponse(false, "Invalid token.");
        res.status(400).json(response);
    }
};

export default verifyToken;
