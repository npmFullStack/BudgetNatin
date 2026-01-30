import express from "express";
import connection from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== GET EXTRA MONEY ========
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query;

        let query = "SELECT * FROM extra_money WHERE user_id = ?";
        const params = [userId];

        if (month) {
            query += " AND DATE_FORMAT(budget_month, '%Y-%m') = ?";
            params.push(month);
        }

        query += " ORDER BY added_date DESC";

        const [extraMoney] = await connection.query(query, params);

        const response = createResponse(
            true,
            "Extra money records retrieved successfully",
            extraMoney
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

        const [result] = await connection.query(
            `INSERT INTO extra_money 
            (user_id, amount, budget_month) 
            VALUES (?, ?, ?)`,
            [userId, amount, month]
        );

        const response = createResponse(
            true,
            "Extra money added successfully",
            { extra_id: result.insertId }
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

        const [result] = await connection.query(
            `UPDATE extra_money SET 
            amount = ?, 
            budget_month = ? 
            WHERE extra_id = ? AND user_id = ?`,
            [amount, month, extra_id, userId]
        );

        if (result.affectedRows === 0) {
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

        const [result] = await connection.query(
            "DELETE FROM extra_money WHERE extra_id = ? AND user_id = ?",
            [extra_id, userId]
        );

        if (result.affectedRows === 0) {
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