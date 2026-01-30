import express from "express";
import connection from "./db.js";
import createResponse from "./helper.js";
import verifyToken from "./authMiddleware.js";

const router = express.Router();

// ======== GET ALL NOTIFICATIONS FOR USER ========
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [notifications] = await connection.query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        const response = createResponse(true, "Notifications retrieved", notifications);
        res.json(response);
    } catch (error) {
        console.log("❌ Error fetching notifications:", error.message);
        const response = createResponse(false, "Error fetching notifications");
        res.status(500).json(response);
    }
});

// ======== MARK NOTIFICATION AS READ ========
router.put("/:id/read", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        // Check if notification exists and belongs to user
        const [existingNotification] = await connection.query(
            "SELECT * FROM notifications WHERE notification_id = ? AND user_id = ?",
            [notificationId, userId]
        );

        if (existingNotification.length === 0) {
            const response = createResponse(false, "Notification not found");
            return res.status(404).json(response);
        }

        // Mark as read
        await connection.query(
            "UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?",
            [notificationId, userId]
        );

        const response = createResponse(true, "Notification marked as read");
        res.json(response);
    } catch (error) {
        console.log("❌ Error marking notification as read:", error.message);
        const response = createResponse(false, "Error updating notification");
        res.status(500).json(response);
    }
});

// ======== MARK ALL NOTIFICATIONS AS READ ========
router.put("/read-all", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        await connection.query(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
            [userId]
        );

        const response = createResponse(true, "All notifications marked as read");
        res.json(response);
    } catch (error) {
        console.log("❌ Error marking all notifications as read:", error.message);
        const response = createResponse(false, "Error updating notifications");
        res.status(500).json(response);
    }
});

// ======== DELETE NOTIFICATION ========
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        // Check if notification exists and belongs to user
        const [existingNotification] = await connection.query(
            "SELECT * FROM notifications WHERE notification_id = ? AND user_id = ?",
            [notificationId, userId]
        );

        if (existingNotification.length === 0) {
            const response = createResponse(false, "Notification not found");
            return res.status(404).json(response);
        }

        // Delete notification
        await connection.query(
            "DELETE FROM notifications WHERE notification_id = ? AND user_id = ?",
            [notificationId, userId]
        );

        const response = createResponse(true, "Notification deleted");
        res.json(response);
    } catch (error) {
        console.log("❌ Error deleting notification:", error.message);
        const response = createResponse(false, "Error deleting notification");
        res.status(500).json(response);
    }
});

// ======== CREATE OVERDUE NOTIFICATIONS (Admin/System endpoint) ========
router.post("/check-overdue", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        // Find overdue expenses
        const [overdueExpenses] = await connection.query(
            "SELECT * FROM expenses WHERE user_id = ? AND is_paid = FALSE AND due_date < ?",
            [userId, today]
        );

        // Find expenses due soon (within 3 days)
        const [dueSoonExpenses] = await connection.query(
            `SELECT * FROM expenses WHERE user_id = ? AND is_paid = FALSE 
             AND due_date >= ? AND due_date <= DATE_ADD(?, INTERVAL 3 DAY)`,
            [userId, today, today]
        );

        let createdCount = 0;

        // Create overdue notifications
        for (const expense of overdueExpenses) {
            // Check if notification already exists
            const [existing] = await connection.query(
                "SELECT * FROM notifications WHERE user_id = ? AND related_id = ? AND related_type = 'expense' AND type = 'overdue'",
                [userId, expense.expense_id]
            );

            if (existing.length === 0) {
                await connection.query(
                    "INSERT INTO notifications (user_id, title, message, type, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)",
                    [
                        userId,
                        "Expense Overdue!",
                        `Your expense "${expense.description || 'Untitled'}" is overdue. Amount: ₱${expense.amount}`,
                        "overdue",
                        expense.expense_id,
                        "expense"
                    ]
                );
                createdCount++;
            }
        }

        // Create due soon notifications
        for (const expense of dueSoonExpenses) {
            const daysUntilDue = Math.ceil((new Date(expense.due_date) - new Date(today)) / (1000 * 60 * 60 * 24));
            
            const [existing] = await connection.query(
                "SELECT * FROM notifications WHERE user_id = ? AND related_id = ? AND related_type = 'expense' AND type = 'due_soon'",
                [userId, expense.expense_id]
            );

            if (existing.length === 0) {
                await connection.query(
                    "INSERT INTO notifications (user_id, title, message, type, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)",
                    [
                        userId,
                        "Expense Due Soon",
                        `Your expense "${expense.description || 'Untitled'}" is due in ${daysUntilDue} day(s). Amount: ₱${expense.amount}`,
                        "due_soon",
                        expense.expense_id,
                        "expense"
                    ]
                );
                createdCount++;
            }
        }

        const response = createResponse(true, "Notifications checked", { created: createdCount });
        res.json(response);
    } catch (error) {
        console.log("❌ Error checking overdue expenses:", error.message);
        const response = createResponse(false, "Error checking notifications");
        res.status(500).json(response);
    }
});

export default router;
