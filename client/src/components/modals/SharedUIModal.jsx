import React from "react";
import { X } from "lucide-react";

const SharedUIModal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md", // sm, md, lg, xl
    showCloseButton = true
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl"
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-xl bg-gray-900 border border-gray-800 shadow-2xl transition-all`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="border-b border-gray-800 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">
                                {title}
                            </h3>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-1.5 hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedUIModal;