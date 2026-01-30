import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import PrivateHeader from "@/components/layout/PrivateHeader"; // Correct import

const PrivateLayout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple loading simulation
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-bgColor flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!localStorage.getItem("token")) {
        return <Navigate to="/login" replace />;
    }

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-bgColor text-white flex">
            <Sidebar
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={toggleSidebarCollapse}
            />
            
            <div className="flex-1 flex flex-col min-h-screen">
                <div className={`sticky top-0 z-30 transition-all duration-300 ${
                    isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
                }`}>
                    <PrivateHeader
                        toggleDrawer={toggleDrawer}
                        toggleSidebarCollapse={toggleSidebarCollapse}
                        isSidebarCollapsed={isSidebarCollapsed}
                    />
                </div>
                
                <main className={`flex-1 overflow-auto transition-all duration-300 ${
                    isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
                }`}>
                    <div className="p-4 md:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PrivateLayout;