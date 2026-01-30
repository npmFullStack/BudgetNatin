import express from "express";
import connection from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== GET EXPENSES ========
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, category_id } = req.query;

        let query = `
            SELECT e.*, ec.name as category_name 
            FROM expenses e
            LEFT JOIN expense_categories ec ON e.category_id = ec.category_id
            WHERE e.user_id = ?
        `;
        const params = [userId];

        if (month) {
            query += " AND DATE_FORMAT(e.expense_date, '%Y-%m') = ?";
            params.push(month);
        }

        if (category_id) {
            query += " AND e.category_id = ?";
            params.push(category_id);
        }

        query += " ORDER BY e.expense_date DESC, e.expense_id DESC";

        const [expenses] = await connection.query(query, params);

        const response = createResponse(
            true,
            "Expenses retrieved successfully",
            expenses
        );
        res.json(response);
    } catch (error) {
        console.error("❌ Error fetching expenses:", error.message);
        const response = createResponse(false, "Error fetching expenses");
        res.status(500).json(response);
    }
});

// In the ADD EXPENSE route, update the budget_month calculation:
router.post("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, category_id, expense_date, budget_month } = req.body;

        if (!amount || !category_id) {
            const response = createResponse(
                false,
                "Amount and category are required"
            );
            return res.status(400).json(response);
        }

        const date = expense_date ? new Date(expense_date) : new Date();
        // Use provided budget_month or calculate from expense_date
        const month = budget_month 
            ? new Date(budget_month)
            : new Date(date.getFullYear(), date.getMonth(), 1);

        const [result] = await connection.query(
            `INSERT INTO expenses 
            (user_id, amount, category_id, expense_date, budget_month) 
            VALUES (?, ?, ?, ?, ?)`,
            [userId, amount, category_id, date, month]
        );

        const response = createResponse(
            true,
            "Expense added successfully",
            { expense_id: result.insertId }
        );
        res.status(201).json(response);
    } catch (error) {
        console.error("❌ Error adding expense:", error.message);
        const response = createResponse(false, "Error adding expense");
        res.status(500).json(response);
    }
});

// Also update the BATCH route:
router.post("/batch", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = req.body;

        if (!Array.isArray(expenses) || expenses.length === 0) {
            const response = createResponse(false, "No expenses provided");
            return res.status(400).json(response);
        }

        const values = expenses.map(exp => [
            userId,
            exp.amount,
            exp.category_id,
            exp.expense_date ? new Date(exp.expense_date) : new Date(),
            exp.budget_month ? new Date(exp.budget_month) : new Date(new Date(exp.expense_date).getFullYear(), new Date(exp.expense_date).getMonth(), 1)
        ]);

        const [result] = await connection.query(
            `INSERT INTO expenses 
            (user_id, amount, category_id, expense_date, budget_month) 
            VALUES ?`,
            [values]
        );

        const response = createResponse(
            true,
            `${expenses.length} expenses added successfully`,
            { affectedRows: result.affectedRows }
        );
        res.status(201).json(response);
    } catch (error) {
        console.error("❌ Error adding multiple expenses:", error.message);
        const response = createResponse(false, "Error adding expenses");
        res.status(500).json(response);
    }
});

// Update the UPDATE route to remove description:
router.put("/:expense_id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { expense_id } = req.params;
        const { amount, category_id, expense_date } = req.body;

        if (!amount || !category_id) {
            const response = createResponse(
                false,
                "Amount and category are required"
            );
            return res.status(400).json(response);
        }

        const [result] = await connection.query(
            `UPDATE expenses SET 
            amount = ?, 
            category_id = ?, 
            expense_date = ?
            WHERE expense_id = ? AND user_id = ?`,
            [
                amount,
                category_id,
                expense_date ? new Date(expense_date) : new Date(),
                expense_id,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            const response = createResponse(false, "Expense not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "Expense updated successfully");
        res.json(response);
    } catch (error) {
        console.error("❌ Error updating expense:", error.message);
        const response = createResponse(false, "Error updating expense");
        res.status(500).json(response);
    }
});
// ======== DELETE EXPENSE ========
router.delete("/:expense_id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { expense_id } = req.params;

        const [result] = await connection.query(
            "DELETE FROM expenses WHERE expense_id = ? AND user_id = ?",
            [expense_id, userId]
        );

        if (result.affectedRows === 0) {
            const response = createResponse(false, "Expense not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "Expense deleted successfully");
        res.json(response);
    } catch (error) {
        console.error("❌ Error deleting expense:", error.message);
        const response = createResponse(false, "Error deleting expense");
        res.status(500).json(response);
    }
});

export default router;