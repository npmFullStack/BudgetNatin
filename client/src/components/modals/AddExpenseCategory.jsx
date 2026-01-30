import React, { useState } from "react";
import api from "@/api/api";
import { Tag, Check } from "lucide-react";
import SharedUIModal from "./SharedUIModal";
import Button from "@/components/Button";

const AddExpenseCategory = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Category name is required");
            return;
        }

        try {
            setLoading(true);
            
            await api.post(
                "/api/expense-categories",
                { name: name.trim() }
            );

            setName("");
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error adding category:", error);
            alert(error.response?.data?.message || "Failed to add category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SharedUIModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Expense Category"
            size="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Category Name
                        </div>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Food, Transportation, Entertainment"
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
                        {loading ? "Saving..." : "Add Category"}
                    </Button>
                </div>
            </form>
        </SharedUIModal>
    );
};

export default AddExpenseCategory;