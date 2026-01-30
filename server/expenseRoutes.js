import express from "express";
import pool from "./db.js";
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
            WHERE e.user_id = $1
        `;
        const params = [userId];

        let paramCount = 2;

        if (month) {
            query += ` AND TO_CHAR(e.expense_date, 'YYYY-MM') = $${paramCount}`;
            params.push(month);
            paramCount++;
        }

        if (category_id) {
            query += ` AND e.category_id = $${paramCount}`;
            params.push(category_id);
            paramCount++;
        }

        query += " ORDER BY e.expense_date DESC, e.expense_id DESC";

        const result = await pool.query(query, params);

        const response = createResponse(
            true,
            "Expenses retrieved successfully",
            result.rows
        );
        res.json(response);
    } catch (error) {
        console.error("❌ Error fetching expenses:", error.message);
        const response = createResponse(false, "Error fetching expenses");
        res.status(500).json(response);
    }
});

// ======== ADD EXPENSE ========
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
        const month = budget_month 
            ? new Date(budget_month)
            : new Date(date.getFullYear(), date.getMonth(), 1);

        const result = await pool.query(
            `INSERT INTO expenses 
            (user_id, amount, category_id, expense_date, budget_month) 
            VALUES ($1, $2, $3, $4, $5) RETURNING expense_id`,
            [userId, amount, category_id, date, month]
        );

        const response = createResponse(
            true,
            "Expense added successfully",
            { expense_id: result.rows[0].expense_id }
        );
        res.status(201).json(response);
    } catch (error) {
        console.error("❌ Error adding expense:", error.message);
        const response = createResponse(false, "Error adding expense");
        res.status(500).json(response);
    }
});

// ======== BATCH ADD EXPENSES ========
router.post("/batch", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = req.body;

        if (!Array.isArray(expenses) || expenses.length === 0) {
            const response = createResponse(false, "No expenses provided");
            return res.status(400).json(response);
        }

        const values = [];
        const valueStrings = [];
        let paramCount = 1;

        expenses.forEach((exp, index) => {
            const date = exp.expense_date ? new Date(exp.expense_date) : new Date();
            const month = exp.budget_month 
                ? new Date(exp.budget_month)
                : new Date(date.getFullYear(), date.getMonth(), 1);
            
            values.push(userId, exp.amount, exp.category_id, date, month);
            valueStrings.push(`($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4})`);
            paramCount += 5;
        });

        const query = `
            INSERT INTO expenses 
            (user_id, amount, category_id, expense_date, budget_month) 
            VALUES ${valueStrings.join(', ')}
        `;

        const result = await pool.query(query, values);

        const response = createResponse(
            true,
            `${expenses.length} expenses added successfully`,
            { affectedRows: result.rowCount }
        );
        res.status(201).json(response);
    } catch (error) {
        console.error("❌ Error adding multiple expenses:", error.message);
        const response = createResponse(false, "Error adding expenses");
        res.status(500).json(response);
    }
});

// ======== UPDATE EXPENSE ========
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

        const result = await pool.query(
            `UPDATE expenses SET 
            amount = $1, 
            category_id = $2, 
            expense_date = $3
            WHERE expense_id = $4 AND user_id = $5`,
            [
                amount,
                category_id,
                expense_date ? new Date(expense_date) : new Date(),
                expense_id,
                userId
            ]
        );

        if (result.rowCount === 0) {
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

        const result = await pool.query(
            "DELETE FROM expenses WHERE expense_id = $1 AND user_id = $2",
            [expense_id, userId]
        );

        if (result.rowCount === 0) {
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