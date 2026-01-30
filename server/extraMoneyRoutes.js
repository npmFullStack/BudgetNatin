import express from "express";
import pool from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== GET EXTRA MONEY ========
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query;

        let query = "SELECT * FROM extra_money WHERE user_id = $1";
        const params = [userId];

        if (month) {
            query += " AND TO_CHAR(budget_month, 'YYYY-MM') = $2";
            params.push(month);
        }

        query += " ORDER BY added_date DESC";

        const result = await pool.query(query, params);

        const response = createResponse(
            true,
            "Extra money records retrieved successfully",
            result.rows
        );
        res.json(response);
    } catch (error) {
        console.error("❌ Error fetching extra money:", error.message);
        const response = createResponse(false, "Error fetching extra money");
        res.status(500).json(response);
    }
});

// ======== ADD EXTRA MONEY ========
router.post("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, budget_month } = req.body;

        if (!amount || amount <= 0) {
            const response = createResponse(
                false,
                "Valid amount is required"
            );
            return res.status(400).json(response);
        }

        const month = budget_month ? new Date(budget_month) : new Date();

        const result = await pool.query(
            `INSERT INTO extra_money 
            (user_id, amount, budget_month) 
            VALUES ($1, $2, $3) RETURNING extra_id`,
            [userId, amount, month]
        );

        const response = createResponse(
            true,
            "Extra money added successfully",
            { extra_id: result.rows[0].extra_id }
        );
        res.status(201).json(response);
    } catch (error) {
        console.error("❌ Error adding extra money:", error.message);
        const response = createResponse(false, "Error adding extra money");
        res.status(500).json(response);
    }
});

// ======== UPDATE EXTRA MONEY ========
router.put("/:extra_id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { extra_id } = req.params;
        const { amount, budget_month } = req.body;

        if (!amount || amount <= 0) {
            const response = createResponse(
                false,
                "Valid amount is required"
            );
            return res.status(400).json(response);
        }

        const month = budget_month ? new Date(budget_month) : new Date();

        const result = await pool.query(
            `UPDATE extra_money SET 
            amount = $1, 
            budget_month = $2 
            WHERE extra_id = $3 AND user_id = $4`,
            [amount, month, extra_id, userId]
        );

        if (result.rowCount === 0) {
            const response = createResponse(false, "Record not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "Extra money updated successfully");
        res.json(response);
    } catch (error) {
        console.error("❌ Error updating extra money:", error.message);
        const response = createResponse(false, "Error updating extra money");
        res.status(500).json(response);
    }
});

// ======== DELETE EXTRA MONEY ========
router.delete("/:extra_id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { extra_id } = req.params;

        const result = await pool.query(
            "DELETE FROM extra_money WHERE extra_id = $1 AND user_id = $2",
            [extra_id, userId]
        );

        if (result.rowCount === 0) {
            const response = createResponse(false, "Record not found");
            return res.status(404).json(response);
        }

        const response = createResponse(true, "Extra money deleted successfully");
        res.json(response);
    } catch (error) {
        console.error("❌ Error deleting extra money:", error.message);
        const response = createResponse(false, "Error deleting extra money");
        res.status(500).json(response);
    }
});

export default router;