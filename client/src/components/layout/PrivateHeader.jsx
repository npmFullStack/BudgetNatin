import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    Bell,
    User,
    ChevronDown,
    LogOut,
    Settings,
    HelpCircle
} from "lucide-react";
import api from "@/api/api"; // Changed from axios
import SearchBar from "@/components/SearchBar";

const PrivateHeader = ({
    toggleDrawer,
    toggleSidebarCollapse,
    isSidebarCollapsed
}) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        fetchUserData();
        fetchNotifications();

        // Set up interval to check for new notifications
        const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchUserData = () => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    };

const fetchNotifications = async () => {
    try {
        const response = await api.get(
            "/api/notifications" // Using relative path with api instance
        );

        if (response.data.success) {
            setNotifications(response.data.data);
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
        // Silently fail, notifications are not critical
    }
};

    const markNotificationAsRead = async notificationId => {
        try {
            await api.put(
                `/api/notifications/${notificationId}/read`,
                {}
            );

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.notification_id === notificationId
                        ? { ...notif, is_read: true }
                        : notif
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await api.put(
                "/api/notifications/read-all",
                {}
            );

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, is_read: true }))
            );
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const deleteNotification = async notificationId => {
        try {
            await api.delete(
                `/api/notifications/${notificationId}`
            );

            // Update local state
            setNotifications(prev =>
                prev.filter(notif => notif.notification_id !== notificationId)
            );
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleSearch = (searchQuery) => {
        if (searchQuery.trim()) {
            // Implement search functionality
            console.log("Searching for:", searchQuery);
            // Example: navigate to search results
            // navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const getUnreadCount = () => {
        return notifications.filter(n => !n.is_read).length;
    };

    const getNotificationIcon = type => {
        switch (type) {
            case "overdue":
                return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
            case "due_soon":
                return (
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                );
            default:
                return <div className="w-3 h-3 rounded-full bg-blue-500"></div>;
        }
    };

    const formatNotificationTime = timestamp => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric"
            });
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-bgColor/80 backdrop-blur-md border-b border-gray-700 px-4 md:px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleDrawer}
                        className="md:hidden p-2 hover:bg-white/10 rounded-lg"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <button
                        onClick={toggleSidebarCollapse}
                        className="hidden md:block p-2 hover:bg-white/10 rounded-lg"
                        title={
                            isSidebarCollapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden md:block w-64">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setShowNotifications(!showNotifications)
                            }
                            className="relative p-2 hover:bg-white/10 rounded-lg"
                            aria-label="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            {getUnreadCount() > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center">
                                    {getUnreadCount()}
                                </span>
                            )}
                        </button>

                        {/* Notifications dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        Notifications
                                    </h3>
                                    {getUnreadCount() > 0 && (
                                        <button
                                            onClick={markAllNotificationsAsRead}
                                            className="text-sm text-primary hover:text-primaryDark"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div
                                                key={
                                                    notification.notification_id
                                                }
                                                className={`p-4 border-b border-gray-700 hover:bg-white/5 transition-colors ${
                                                    !notification.is_read
                                                        ? "bg-white/5"
                                                        : ""
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1">
                                                        {getNotificationIcon(
                                                            notification.type
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <p className="font-medium truncate">
                                                                {
                                                                    notification.title
                                                                }
                                                            </p>
                                                            <button
                                                                onClick={() =>
                                                                    deleteNotification(
                                                                        notification.notification_id
                                                                    )
                                                                }
                                                                className="text-gray-400 hover:text-white ml-2"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-xs text-gray-500">
                                                                {formatNotificationTime(
                                                                    notification.created_at
                                                                )}
                                                            </span>
                                                            {!notification.is_read && (
                                                                <button
                                                                    onClick={() =>
                                                                        markNotificationAsRead(
                                                                            notification.notification_id
                                                                        )
                                                                    }
                                                                    className="text-xs text-primary hover:text-primaryDark"
                                                                >
                                                                    Mark as read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                            <p className="text-gray-400">
                                                No notifications
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                You're all caught up!
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-gray-700">
                                    <button
                                        onClick={() =>
                                            navigate("/dashboard/expenses")
                                        }
                                        className="w-full py-2 text-center text-primary hover:text-primaryDark"
                                    >
                                        View all expenses →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg"
                            aria-label="User menu"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium">
                                    {user?.username || "User"}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {user?.email || "user@email.com"}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 hidden md:block" />
                        </button>

                        {/* User dropdown menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                                <div className="p-4 border-b border-gray-700">
                                    <p className="font-semibold">
                                        {user?.username || "User"}
                                    </p>
                                    <p className="text-sm text-gray-400 truncate">
                                        {user?.email || "user@email.com"}
                                    </p>
                                </div>


                                <div className="p-4 border-t border-gray-700">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile search */}
            <div className="mt-3 md:hidden">
                <SearchBar onSearch={handleSearch} />
            </div>

            {/* Close dropdowns when clicking outside */}
            {(showNotifications || showUserMenu) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowNotifications(false);
                        setShowUserMenu(false);
                    }}
                />
            )}
        </header>
    );
};

export default PrivateHeader;