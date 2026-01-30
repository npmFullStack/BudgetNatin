import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { DollarSign, Tag, Calendar, Plus, Trash2 } from "lucide-react";
import SharedUIModal from "./SharedUIModal";
import Button from "@/components/Button";

const AddExpense = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([
        { 
            amount: "", 
            category_id: "", 
            category_name: "", // For "Other" category
            expense_date: "" 
        }
    ]);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01 format
            
            setExpenses([{ 
                amount: "", 
                category_id: "", 
                category_name: "", 
                expense_date: today 
            }]);
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const response = await api.get(
                "/api/expense-categories"
            );
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const addExpenseField = () => {
        const today = new Date().toISOString().split('T')[0];
        setExpenses([...expenses, { 
            amount: "", 
            category_id: "", 
            category_name: "", 
            expense_date: today 
        }]);
    };

    const removeExpenseField = (index) => {
        if (expenses.length > 1) {
            const newExpenses = expenses.filter((_, i) => i !== index);
            setExpenses(newExpenses);
        }
    };

    const updateExpenseField = (index, field, value) => {
        const newExpenses = [...expenses];
        newExpenses[index][field] = value;
        
        // If category is changed to "other", reset category_name
        if (field === 'category_id' && value !== 'other') {
            newExpenses[index].category_name = "";
        }
        
        setExpenses(newExpenses);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare expenses for submission
        const expensesToSubmit = [];
        
        for (const exp of expenses) {
            // Basic validation
            if (!exp.amount || exp.amount <= 0 || !exp.category_id) {
                continue; // Skip invalid entries
            }

            const expenseData = {
                amount: parseFloat(exp.amount),
                category_id: exp.category_id === 'other' ? null : exp.category_id,
                expense_date: exp.expense_date,
                budget_month: new Date(exp.expense_date).toISOString().slice(0, 7) + '-01' // YYYY-MM-01 format
            };

            // If category is "other", we need to create the category first
            if (exp.category_id === 'other' && exp.category_name.trim()) {
                try {
                    // Create new category using api instance
                    const categoryResponse = await api.post(
                        "/api/expense-categories",
                        { name: exp.category_name.trim() }
                    );

                    if (categoryResponse.data.success) {
                        expenseData.category_id = categoryResponse.data.data.category_id;
                        expensesToSubmit.push(expenseData);
                    }
                } catch (error) {
                    console.error("Error creating category:", error);
                    alert(`Failed to create category "${exp.category_name}"`);
                    return;
                }
            } else if (exp.category_id !== 'other') {
                // For existing categories
                expensesToSubmit.push(expenseData);
            }
        }

        if (expensesToSubmit.length === 0) {
            alert("Please fill at least one expense with amount and category");
            return;
        }

        try {
            setLoading(true);

            const response = expensesToSubmit.length === 1
                ? await api.post(
                    "/api/expenses",
                    expensesToSubmit[0]
                  )
                : await api.post(
                    "/api/expenses/batch",
                    expensesToSubmit
                  );

            if (response.data.success) {
                onSuccess?.();
                onClose();
                // Reset form
                const today = new Date().toISOString().split('T')[0];
                setExpenses([{ 
                    amount: "", 
                    category_id: "", 
                    category_name: "", 
                    expense_date: today 
                }]);
            }
        } catch (error) {
            console.error("Error adding expense(s):", error);
            alert(error.response?.data?.message || "Failed to add expense(s)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SharedUIModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Add Expense${expenses.length > 1 ? 's' : ''}`}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {expenses.map((expense, index) => (
                    <div key={index} className="p-4 border border-gray-800 rounded-lg space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-300">
                                Expense #{index + 1}
                            </span>
                            {expenses.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeExpenseField(index)}
                                    className="p-1 hover:bg-red-500/10 rounded text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

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
                                value={expense.amount}
                                onChange={(e) => updateExpenseField(index, 'amount', e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Category Select with "Other" option */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Category
                                </div>
                            </label>
                            <select
                                value={expense.category_id}
                                onChange={(e) => updateExpenseField(index, 'category_id', e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.name}
                                    </option>
                                ))}
                                <option value="other">Other (Create New Category)</option>
                            </select>
                        </div>

                        {/* New Category Input (shown when "Other" is selected) */}
                        {expense.category_id === 'other' && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    New Category Name
                                </label>
                                <input
                                    type="text"
                                    value={expense.category_name || ''}
                                    onChange={(e) => updateExpenseField(index, 'category_name', e.target.value)}
                                    placeholder="Enter new category name"
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    This will create a new expense category
                                </p>
                            </div>
                        )}

                        {/* Date Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Date
                                </div>
                            </label>
                            <input
                                type="date"
                                value={expense.expense_date}
                                onChange={(e) => updateExpenseField(index, 'expense_date', e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                ))}

                {/* Add Another Expense Button */}
                <Button
                    type="button"
                    variant="ghost"
                    onClick={addExpenseField}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="w-full"
                >
                    Add Another Expense
                </Button>

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
                    >
                        {loading ? "Saving..." : `Save Expense${expenses.length > 1 ? 's' : ''}`}
                    </Button>
                </div>
            </form>
        </SharedUIModal>
    );
};

export default AddExpense;