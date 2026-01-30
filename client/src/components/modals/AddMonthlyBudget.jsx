import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { Calendar, DollarSign, Check } from "lucide-react";
import SharedUIModal from "./SharedUIModal";
import Button from "@/components/Button";

const AddMonthlyBudget = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        month: "",
        amount: ""
    });

    useEffect(() => {
        if (isOpen) {
            // Set current month as default
            const now = new Date();
            const currentMonth = now.toISOString().slice(0, 7);
            setFormData({
                month: currentMonth,
                amount: ""
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            await api.post(
                "/api/monthly-budget",
                formData
            );

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error adding monthly budget:", error);
            alert(error.response?.data?.message || "Failed to add monthly budget");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <SharedUIModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Monthly Budget"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Month Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Month
                        </div>
                    </label>
                    <input
                        type="month"
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Budget Amount
                        </div>
                    </label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        isLoading={loading}
                        leftIcon={<Check className="w-4 h-4" />}
                    >
                        {loading ? "Saving..." : "Save Budget"}
                    </Button>
                </div>
            </form>
        </SharedUIModal>
    );
};

export default AddMonthlyBudget;