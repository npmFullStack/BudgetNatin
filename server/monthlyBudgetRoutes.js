import express from "express";
import connection from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== GET MONTHLY BUDGET ========
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query; // Format: YYYY-MM

        let query = "SELECT * FROM monthly_budget WHERE user_id = ?";
        const params = [userId];

        if (month) {
            query += " AND DATE_FORMAT(month, '%Y-%m') = ?";
            params.push(month);
        }

        query += " ORDER BY month DESC";

        const [budgets] = await connection.query(query, params);

        const response = createResponse(
            true,
            "Monthly budgets retrieved successfully",
            budgets
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
        const [existing] = await connection.query(
            "SELECT budget_id FROM monthly_budget WHERE user_id = ? AND month = ?",
            [userId, formattedMonth]
        );

        let result;
        if (existing.length > 0) {
            // Update existing budget
            [result] = await connection.query(
                "UPDATE monthly_budget SET amount = ?, updated_at = NOW() WHERE budget_id = ?",
                [amount, existing[0].budget_id]
            );
        } else {
            // Insert new budget
            [result] = await connection.query(
                "INSERT INTO monthly_budget (user_id, month, amount) VALUES (?, ?, ?)",
                [userId, formattedMonth, amount]
            );
        }

        const response = createResponse(
            true,
            existing.length > 0 ? "Monthly budget updated" : "Monthly budget added",
            { budget_id: existing.length > 0 ? existing[0].budget_id : result.insertId }
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

        const [result] = await connection.query(
            "DELETE FROM monthly_budget WHERE budget_id = ? AND user_id = ?",
            [budget_id, userId]
        );

        if (result.affectedRows === 0) {
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