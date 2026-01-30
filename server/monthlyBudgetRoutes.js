import express from "express";
import pool from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== GET MONTHLY BUDGET ========
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query; // Format: YYYY-MM

        let query = "SELECT * FROM monthly_budget WHERE user_id = $1";
        const params = [userId];

        if (month) {
            query += " AND TO_CHAR(month, 'YYYY-MM') = $2";
            params.push(month);
        }

        query += " ORDER BY month DESC";

        const result = await pool.query(query, params);

        const response = createResponse(
            true,
            "Monthly budgets retrieved successfully",
            result.rows
        );
        res.json(response);
    } catch (error) {
        console.error("❌ Error fetching monthly budgets:", error.message);
        const response = createResponse(false, "Error fetching monthly budgets");
        res.status(500).json(response);
    }
});

// ======== ADD/MODIFY MONTHLY BUDGET ========
router.post("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, amount } = req.body;

        if (!month || !amount) {
            const response = createResponse(
                false,
                "Month and amount are required"
            );
            return res.status(400).json(response);
        }

        // Format month to first day of month
        const monthDate = new Date(month);
        const formattedMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

        // Check if budget exists for this month
        const existing = await pool.query(
            "SELECT budget_id FROM monthly_budget WHERE user_id = $1 AND month = $2",
            [userId, formattedMonth]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing budget
            result = await pool.query(
                "UPDATE monthly_budget SET amount = $1, updated_at = NOW() WHERE budget_id = $2 RETURNING budget_id",
                [amount, existing.rows[0].budget_id]
            );
        } else {
            // Insert new budget
            result = await pool.query(
                "INSERT INTO monthly_budget (user_id, month, amount) VALUES ($1, $2, $3) RETURNING budget_id",
                [userId, formattedMonth, amount]
            );
        }

        const response = createResponse(
            true,
            existing.rows.length > 0 ? "Monthly budget updated" : "Monthly budget added",
            { budget_id: result.rows[0].budget_id }
        );
        res.status(201).json(response);
    } catch (error) {
        console.error("❌ Error adding/updating monthly budget:", error.message);
        const response = createResponse(false, "Error processing budget request");
        res.status(500).json(response);
    }
});

// ======== DELETE MONTHLY BUDGET ========
router.delete("/:budget_id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { budget_id } = req.params;

        const result = await pool.query(
            "DELETE FROM monthly_budget WHERE budget_id = $1 AND user_id = $2",
            [budget_id, userId]
        );

        if (result.rowCount === 0) {
            const response = createResponse(false, "Budget not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "Monthly budget deleted successfully");
        res.json(response);
    } catch (error) {
        console.error("❌ Error deleting monthly budget:", error.message);
        const response = createResponse(false, "Error deleting monthly budget");
        res.status(500).json(response);
    }
});

export default router;