import express from "express";
import pool from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== GET CATEGORIES ========
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            "SELECT * FROM expense_categories WHERE user_id = $1 ORDER BY name ASC",
            [userId]
        );

        const response = createResponse(
            true,
            "Categories retrieved successfully",
            result.rows
        );
        res.json(response);
    } catch (error) {
        console.error("❌ Error fetching categories:", error.message);
        const response = createResponse(false, "Error fetching categories");
        res.status(500).json(response);
    }
});

// ======== ADD CATEGORY ========
router.post("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (!name || name.trim() === "") {
            const response = createResponse(false, "Category name is required");
            return res.status(400).json(response);
        }

        // Check if category already exists for this user
        const existing = await pool.query(
            "SELECT category_id FROM expense_categories WHERE user_id = $1 AND name = $2",
            [userId, name.trim()]
        );

        if (existing.rows.length > 0) {
            const response = createResponse(
                false,
                "Category already exists"
            );
            return res.status(400).json(response);
        }

        const result = await pool.query(
            "INSERT INTO expense_categories (user_id, name) VALUES ($1, $2) RETURNING category_id",
            [userId, name.trim()]
        );

        const response = createResponse(
            true,
            "Category added successfully",
            { category_id: result.rows[0].category_id, name: name.trim() }
        );
        res.status(201).json(response);
    } catch (error) {
        console.error("❌ Error adding category:", error.message);
        const response = createResponse(false, "Error adding category");
        res.status(500).json(response);
    }
});

// ======== UPDATE CATEGORY ========
router.put("/:category_id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category_id } = req.params;
        const { name } = req.body;

        if (!name || name.trim() === "") {
            const response = createResponse(false, "Category name is required");
            return res.status(400).json(response);
        }

        // Check if new name already exists for this user
        const existing = await pool.query(
            "SELECT category_id FROM expense_categories WHERE user_id = $1 AND name = $2 AND category_id != $3",
            [userId, name.trim(), category_id]
        );

        if (existing.rows.length > 0) {
            const response = createResponse(
                false,
                "Category name already exists"
            );
            return res.status(400).json(response);
        }

        const result = await pool.query(
            "UPDATE expense_categories SET name = $1 WHERE category_id = $2 AND user_id = $3",
            [name.trim(), category_id, userId]
        );

        if (result.rowCount === 0) {
            const response = createResponse(false, "Category not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "Category updated successfully");
        res.json(response);
    } catch (error) {
        console.error("❌ Error updating category:", error.message);
        const response = createResponse(false, "Error updating category");
        res.status(500).json(response);
    }
});

// ======== DELETE CATEGORY ========
router.delete("/:category_id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category_id } = req.params;

        // Check if category has expenses
        const expenses = await pool.query(
            "SELECT expense_id FROM expenses WHERE category_id = $1 AND user_id = $2 LIMIT 1",
            [category_id, userId]
        );

        if (expenses.rows.length > 0) {
            const response = createResponse(
                false,
                "Cannot delete category with existing expenses. Please reassign or delete expenses first."
            );
            return res.status(400).json(response);
        }

        const result = await pool.query(
            "DELETE FROM expense_categories WHERE category_id = $1 AND user_id = $2",
            [category_id, userId]
        );

        if (result.rowCount === 0) {
            const response = createResponse(false, "Category not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "Category deleted successfully");
        res.json(response);
    } catch (error) {
        console.error("❌ Error deleting category:", error.message);
        const response = createResponse(false, "Error deleting category");
        res.status(500).json(response);
    }
});

export default router;