import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    X, Home, PieChart, Target, Settings, LogOut, 
    User, Bell, HelpCircle, BarChart3, Wallet, 
    CreditCard, TrendingUp, Calendar, ChevronLeft, ChevronRight,
    ChevronDown
} from "lucide-react";

const Sidebar = ({ isOpen, onClose, user, isCollapsed, toggleCollapse }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        onClose();
    };

    const menuItems = [
        { icon: <Home className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar - Fixed positioning to prevent scrolling */}
            <aside className={`
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
                fixed md:fixed
                inset-y-0 left-0 z-40
                transform transition-all duration-300 ease-in-out
                flex flex-col h-screen bg-bgColor border-r border-gray-700
                ${isCollapsed ? 'w-20' : 'w-72'}
                overflow-y-auto`}
            >
                {/* Header with Logo */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                            <h3 className={`font-heading uppercase text-primary ${isCollapsed ? 'text-2xl' : 'text-3xl'}`}>
                                BugetNatin
                            </h3>
                        </div>
                        
                        {/* Close button (mobile) and collapse toggle */}
                        <div className="flex items-center gap-2 ml-2">
                            <button
                                onClick={toggleCollapse}
                                className="hidden md:block p-2 hover:bg-white/10 rounded-lg"
                                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            </button>
                            
                            <button
                                onClick={onClose}
                                className="md:hidden p-2 hover:bg-white/10 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-4 overflow-y-auto">
                    <div className="px-2">
                        {!isCollapsed && (
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-4 px-3">
                                Main Menu
                            </p>
                        )}
                        <nav className="space-y-1 mb-8">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg
                                        text-gray-300 hover:text-white hover:bg-white/5
                                        transition-colors duration-200 group
                                        ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <div className="group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    {!isCollapsed && (
                                        <span className="font-medium">{item.label}</span>
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Settings Section */}
                        {!isCollapsed && (
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-4 px-3">
                                Settings
                            </p>
                        )}
                        <nav className="space-y-1">
                            <Link
                                to="/dashboard/settings"
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg
                                    text-gray-300 hover:text-white hover:bg-white/5
                                    transition-colors duration-200 group
                                    ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? "Settings" : ''}
                            >
                                <div className="group-hover:scale-110 transition-transform">
                                    <Settings className="w-5 h-5" />
                                </div>
                                {!isCollapsed && (
                                    <span className="font-medium">Settings</span>
                                )}
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Footer with User Menu */}
                <div className="p-4 border-t border-gray-700">
                    {/* User Menu Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className={`flex items-center w-full px-4 py-3 rounded-lg
                                bg-white/5 hover:bg-white/10 transition-colors duration-200
                                ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                            title={isCollapsed ? "User menu" : ""}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                {!isCollapsed && (
                                    <div className="text-left">
                                        <p className="text-sm font-medium truncate max-w-[120px]">
                                            {user?.username || "User"}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate max-w-[120px]">
                                            {user?.email || "user@email.com"}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {/* User Menu Dropdown */}
                        {showUserMenu && !isCollapsed && (
                            <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                                <div className="py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-red-300 hover:text-red-200"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Logout button for collapsed sidebar */}
                        {isCollapsed && (
                            <button
                                onClick={handleLogout}
                                className="mt-3 flex items-center justify-center w-full p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-colors duration-200"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    {!isCollapsed && (
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                © 2024 BudgetNatin. All rights reserved.
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;