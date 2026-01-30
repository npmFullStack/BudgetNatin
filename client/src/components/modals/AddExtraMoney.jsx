import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { DollarSign, Calendar, Check } from "lucide-react";
import SharedUIModal from "./SharedUIModal";
import Button from "@/components/Button";

const AddExtraMoney = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        budget_month: ""
    });

    useEffect(() => {
        if (isOpen) {
            // Set current month as default
            const now = new Date();
            const currentMonth = now.toISOString().slice(0, 7);
            setFormData({
                amount: "",
                budget_month: currentMonth
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        try {
            setLoading(true);
            
            // Use the centralized api instance
            await api.post("/api/extra-money", {
                amount: amount,
                budget_month: formData.budget_month
                // Description removed as requested
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error adding extra money:", error);
            
            // Extract error message from response
            let errorMessage = "Failed to add extra money";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "amount") {
            // Ensure amount is non-negative
            const numValue = parseFloat(value);
            if (numValue < 0) return;
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
    };

    return (
        <SharedUIModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Extra Money"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Amount
                        </div>
                    </label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* Month Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            For Month
                        </div>
                    </label>
                    <input
                        type="month"
                        name="budget_month"
                        value={formData.budget_month}
                        onChange={handleChange}
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
                        {loading ? "Saving..." : "Add Money"}
                    </Button>
                </div>
            </form>
        </SharedUIModal>
    );
};

export default AddExtraMoney;