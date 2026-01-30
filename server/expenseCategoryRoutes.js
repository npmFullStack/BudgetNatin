import express from "express";
import connection from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== GET CATEGORIES ========
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [categories] = await connection.query(
            "SELECT * FROM expense_categories WHERE user_id = ? ORDER BY name ASC",
            [userId]
        );

        const response = createResponse(
            true,
            "Categories retrieved successfully",
            categories
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
        const [existing] = await connection.query(
            "SELECT category_id FROM expense_categories WHERE user_id = ? AND name = ?",
            [userId, name.trim()]
        );

        if (existing.length > 0) {
            const response = createResponse(
                false,
                "Category already exists"
            );
            return res.status(400).json(response);
        }

        const [result] = await connection.query(
            "INSERT INTO expense_categories (user_id, name) VALUES (?, ?)",
            [userId, name.trim()]
        );

        const response = createResponse(
            true,
            "Category added successfully",
            { category_id: result.insertId, name: name.trim() }
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
        const [existing] = await connection.query(
            "SELECT category_id FROM expense_categories WHERE user_id = ? AND name = ? AND category_id != ?",
            [userId, name.trim(), category_id]
        );

        if (existing.length > 0) {
            const response = createResponse(
                false,
                "Category name already exists"
            );
            return res.status(400).json(response);
        }

        const [result] = await connection.query(
            "UPDATE expense_categories SET name = ? WHERE category_id = ? AND user_id = ?",
            [name.trim(), category_id, userId]
        );

        if (result.affectedRows === 0) {
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
        const [expenses] = await connection.query(
            "SELECT expense_id FROM expenses WHERE category_id = ? AND user_id = ? LIMIT 1",
            [category_id, userId]
        );

        if (expenses.length > 0) {
            const response = createResponse(
                false,
                "Cannot delete category with existing expenses. Please reassign or delete expenses first."
            );
            return res.status(400).json(response);
        }

        const [result] = await connection.query(
            "DELETE FROM expense_categories WHERE category_id = ? AND user_id = ?",
            [category_id, userId]
        );

        if (result.affectedRows === 0) {
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