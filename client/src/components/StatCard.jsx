import React from "react";

const StatCard = ({ title, value, description, icon: Icon, valueColor = "text-white", trend }) => {
    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <Icon className="w-5 h-5 text-gray-400" />
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        trend > 0 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
                <h3 className={`text-2xl font-bold ${valueColor}`}>{value}</h3>
                <p className="text-gray-500 text-xs">{description}</p>
            </div>
        </div>
    );
};

export default StatCard;