import React, { useState, useEffect } from "react";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    DollarSign,
    Tag,
    CreditCard,
    RefreshCw,
    Calendar,
    PieChart as PieChartIcon,
    ChevronDown
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Button from "@/components/Button";
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";

// Import new modals
import AddMonthlyBudget from "@/components/modals/AddMonthlyBudget";
import AddExpense from "@/components/modals/AddExpense";
import AddExpenseCategory from "@/components/modals/AddExpenseCategory";
import AddExtraMoney from "@/components/modals/AddExtraMoney";

// Import the API
import api from "@/api/api";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [budgetData, setBudgetData] = useState({ amount: 0 });
    const [expensesData, setExpensesData] = useState([]);
    const [allowanceData, setAllowanceData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [stats, setStats] = useState({
        currentBudget: 0,
        totalAllowance: 0,
        totalExpenses: 0,
        netChange: 0,
        expenseCount: 0,
        allowanceCount: 0
    });
  
    // Modal states
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showMonthlyBudgetModal, setShowMonthlyBudgetModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showExtraMoneyModal, setShowExtraMoneyModal] = useState(false);
    
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [userResponse, budgetResponse, expensesResponse, extraMoneyResponse, categoriesResponse] = 
                await Promise.all([
                    api.get("/api/auth/me"),
                    api.get("/api/monthly-budget"),
                    api.get("/api/expenses"),
                    api.get("/api/extra-money"),
                    api.get("/api/expense-categories"),
                ]);

            if (userResponse.data.success) {
                setUserData(userResponse.data.data);

                // Process budget data
                let currentBudget = 0;
                if (budgetResponse.data.success && budgetResponse.data.data.length > 0) {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    const currentBudgetData = budgetResponse.data.data.find(
                        budget => budget.month.startsWith(currentMonth)
                    ) || budgetResponse.data.data[0];
                    
                    setBudgetData(currentBudgetData || { amount: 0 });
                    currentBudget = parseFloat(currentBudgetData?.amount || 0);
                }

                // Process expenses data
                let expenses = [];
                let totalExpenses = 0;
                let expenseCount = 0;
                if (expensesResponse.data.success) {
                    expenses = expensesResponse.data.data || [];
                    setExpensesData(expenses);
                    totalExpenses = expenses.reduce(
                        (sum, item) => sum + parseFloat(item.amount || 0),
                        0
                    );
                    expenseCount = expenses.length;
                }

                // Process extra money data
                let allowance = [];
                let totalAllowance = 0;
                let allowanceCount = 0;
                if (extraMoneyResponse.data.success) {
                    allowance = extraMoneyResponse.data.data || [];
                    setAllowanceData(allowance);
                    totalAllowance = allowance.reduce(
                        (sum, item) => sum + parseFloat(item.amount || 0),
                        0
                    );
                    allowanceCount = allowance.length;
                }

                // Calculate expenses by category for summary
                const expensesByCategory = {};
                expenses.forEach(expense => {
                    const categoryName = expense.category_name || 'Uncategorized';
                    const amount = parseFloat(expense.amount || 0);
                    expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount;
                });

                // Transform to array format
                const summary = {
                    expenses_by_category: Object.entries(expensesByCategory).map(([category, total]) => ({
                        category,
                        total
                    }))
                };
                setSummaryData(summary);

                // Calculate net change
                const netChange = totalAllowance - totalExpenses;

                // Update stats
                setStats({
                    currentBudget: currentBudget,
                    totalAllowance: totalAllowance,
                    totalExpenses: totalExpenses,
                    netChange: netChange,
                    expenseCount: expenseCount,
                    allowanceCount: allowanceCount
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatCurrency = amount => {
        const num = parseFloat(amount);
        return `₱${num.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatDate = dateString => {
        if (!dateString) return "No date";
        return new Date(dateString).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric"
        });
    };

    // Prepare data for charts
    const prepareMonthlyData = () => {
        const monthlyData = {};

        // Process expenses by month
        expensesData.forEach(expense => {
            const date = new Date(expense.expense_date);
            const monthYear = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = {
                    month: date.toLocaleDateString("en-US", { month: "short" }),
                    expenses: 0,
                    allowance: 0,
                    net: 0
                };
            }
            monthlyData[monthYear].expenses += parseFloat(expense.amount);
        });

        // Process extra money by month
        allowanceData.forEach(item => {
            const date = new Date(item.budget_month || item.added_date);
            const monthYear = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = {
                    month: date.toLocaleDateString("en-US", { month: "short" }),
                    expenses: 0,
                    allowance: 0,
                    net: 0
                };
            }
            monthlyData[monthYear].allowance += parseFloat(item.amount);
        });

        // Calculate net and sort by date
        return Object.values(monthlyData)
            .map(item => ({
                ...item,
                net: item.allowance - item.expenses
            }))
            .sort((a, b) => {
                const monthA = new Date(
                    Date.parse(`1 ${a.month} 2000`)
                ).getMonth();
                const monthB = new Date(
                    Date.parse(`1 ${b.month} 2000`)
                ).getMonth();
                return monthA - monthB;
            })
            .slice(-6); // Last 6 months
    };

    const prepareCategoryData = () => {
        if (!summaryData?.expenses_by_category || summaryData.expenses_by_category.length === 0) {
            // Fallback: calculate from expenses data
            const categoryTotals = {};
            expensesData.forEach(expense => {
                const category = expense.category_name || expense.category || "Other";
                categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
            });

            return Object.entries(categoryTotals).map(([name, value]) => ({
                name,
                value,
                color: getCategoryColor(name)
            }));
        }

        return summaryData.expenses_by_category.map(item => ({
            name: item.category,
            value: parseFloat(item.total),
            color: getCategoryColor(item.category)
        }));
    };

    const getCategoryColor = category => {
        const colors = {
            kuryente: "#3B82F6",
            ulam: "#10B981",
            snack: "#F59E0B",
            load: "#8B5CF6",
            other: "#6B7280",
            "Food": "#3B82F6",
            "Transportation": "#10B981",
            "Entertainment": "#F59E0B",
            "Utilities": "#8B5CF6",
            "Shopping": "#EF4444",
            "Healthcare": "#EC4899",
            "Education": "#6366F1",
            "Other": "#6B7280"
        };
        return colors[category] || "#" + Math.floor(Math.random()*16777215).toString(16);
    };

    const monthlyChartData = prepareMonthlyData();
    const categoryChartData = prepareCategoryData();

    // Stats cards data
    const statsCards = [
        {
            title: "Current Budget",
            value: formatCurrency(stats.currentBudget),
            description:
                stats.currentBudget >= 0
                    ? "Positive balance"
                    : "Negative balance",
            icon: Wallet,
            valueColor:
                stats.currentBudget >= 0 ? "text-blue-400" : "text-red-400",
            trend: stats.currentBudget >= 0 ? "positive" : "negative"
        },
        {
            title: "Total Extra Money",
            value: formatCurrency(stats.totalAllowance),
            description: `${stats.allowanceCount} entries`,
            icon: TrendingUp,
            valueColor: "text-green-400",
            trend: "positive"
        },
        {
            title: "Total Expenses",
            value: formatCurrency(stats.totalExpenses),
            description: `${stats.expenseCount} transactions`,
            icon: TrendingDown,
            valueColor: "text-red-400",
            trend: "negative"
        },
        {
            title: "Net Change",
            value: formatCurrency(stats.netChange),
            description:
                stats.netChange >= 0
                    ? "More income than expenses"
                    : "More expenses than income",
            icon: PieChartIcon,
            valueColor:
                stats.netChange >= 0 ? "text-emerald-400" : "text-red-400",
            trend: stats.netChange >= 0 ? "positive" : "negative"
        }
    ];

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-400">Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section with New Add Button Dropdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back,{" "}
                        <span className="text-primary">
                            {userData?.username || "User"}!
                        </span>
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">
                        Track your budget and expenses in real-time
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="medium"
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                        onClick={handleRefresh}
                        isLoading={refreshing}
                    >
                        Refresh
                    </Button>
                    
                    {/* New Add Dropdown Button */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="medium"
                            leftIcon={<Plus className="w-4 h-4" />}
                            rightIcon={<ChevronDown className={`w-4 h-4 transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />}
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className="text-gray-300 hover:text-white border-gray-700 hover:border-gray-600"
                        >
                            Add New
                        </Button>
                        
                        {/* Dropdown Menu */}
                        {showAddMenu && (
                            <>
                                {/* Backdrop */}
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowAddMenu(false)}
                                />
                                
                                {/* Dropdown Content */}
                                <div className="absolute right-0 mt-2 w-56 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setShowMonthlyBudgetModal(true);
                                                setShowAddMenu(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-150"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            <span>Monthly Budget</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowExtraMoneyModal(true);
                                                setShowAddMenu(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-150"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            <span>Extra Money</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowExpenseModal(true);
                                                setShowAddMenu(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-150"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            <span>Expense</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowCategoryModal(true);
                                                setShowAddMenu(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-150 border-t border-gray-800 mt-1"
                                        >
                                            <Tag className="w-4 h-4" />
                                            <span>Expense Category</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <StatCard 
                        key={index} 
                        title={stat.title}
                        value={stat.value}
                        description={stat.description}
                        icon={stat.icon}
                        valueColor={stat.valueColor}
                        trend={stat.trend}
                    />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends Chart */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Monthly Trends
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Last 6 months overview
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-gray-400">Extra Money</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-gray-400">Expenses</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-72 min-h-[288px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyChartData}>
                                <defs>
                                    <linearGradient id="colorAllowance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1F2937"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6B7280"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#1F2937' }}
                                />
                                <YAxis
                                    stroke="#6B7280"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#1F2937' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111827',
                                        borderColor: '#1F2937',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value) => [`₱${value.toLocaleString()}`, '']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="allowance"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    fill="url(#colorAllowance)"
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    fill="url(#colorExpenses)"
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expenses by Category Chart */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Expenses by Category
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Breakdown of your spending
                            </p>
                        </div>
                    </div>

                    <div className="h-72 min-h-[288px]">
                        {categoryChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={categoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {categoryChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#111827',
                                            borderColor: '#1F2937',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                        formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-gray-400 text-xs">{value}</span>}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center">
                                <PieChartIcon className="w-16 h-16 text-gray-600 mb-4" />
                                <p className="text-gray-400">No expense data available</p>
                                <Button
                                    variant="ghost"
                                    size="small"
                                    leftIcon={<Plus className="w-4 h-4" />}
                                    onClick={() => setShowExpenseModal(true)}
                                    className="mt-2"
                                >
                                    Add First Expense
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Extra Money */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Recent Extra Money
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Latest money added
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="small"
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => setShowExtraMoneyModal(true)}
                        >
                            Add More
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {allowanceData.slice(0, 5).map(item => (
                            <div
                                key={item.extra_id || item.allowance_id}
                                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10 border border-green-500/20">
                                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm">
                                            {item.description || "Extra money added"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDate(item.added_date || item.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-green-400">
                                        +{formatCurrency(item.amount)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {allowanceData.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                    <DollarSign className="w-8 h-8 text-green-400" />
                                </div>
                                <p className="text-sm">No extra money added yet</p>
                                <Button
                                    variant="ghost"
                                    size="small"
                                    leftIcon={<Plus className="w-4 h-4" />}
                                    onClick={() => setShowExtraMoneyModal(true)}
                                    className="mt-2"
                                >
                                    Add your first extra money
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Recent Expenses
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Latest transactions
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="small"
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => setShowExpenseModal(true)}
                        >
                            Add Expense
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {expensesData.slice(0, 5).map(expense => (
                            <div
                                key={expense.expense_id}
                                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20">
                                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm">
                                            {expense.category_name || expense.category}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDate(expense.expense_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-red-400">
                                        -{formatCurrency(expense.amount)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {expensesData.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <CreditCard className="w-8 h-8 text-red-400" />
                                </div>
                                <p className="text-sm">No expenses recorded yet</p>
                                <Button
                                    variant="ghost"
                                    size="small"
                                    leftIcon={<Plus className="w-4 h-4" />}
                                    onClick={() => setShowExpenseModal(true)}
                                    className="mt-2"
                                >
                                    Add your first expense
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Modals */}
            <AddMonthlyBudget
                isOpen={showMonthlyBudgetModal}
                onClose={() => setShowMonthlyBudgetModal(false)}
                onSuccess={fetchDashboardData}
            />

            <AddExpense
                isOpen={showExpenseModal}
                onClose={() => setShowExpenseModal(false)}
                onSuccess={fetchDashboardData}
            />

            <AddExpenseCategory
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSuccess={() => {
                    fetchDashboardData();
                    // Refresh categories in expense modal if it's open
                }}
            />

            <AddExtraMoney
                isOpen={showExtraMoneyModal}
                onClose={() => setShowExtraMoneyModal(false)}
                onSuccess={fetchDashboardData}
            />
        </div>
    );
};

export default Dashboard;