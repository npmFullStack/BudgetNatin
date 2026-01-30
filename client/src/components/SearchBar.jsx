import React, { useState } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ placeholder = "Search expenses, budgets...", onSearch }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim() && onSearch) {
            onSearch(searchQuery.trim());
        }
    };

    const handleChange = (e) => {
        setSearchQuery(e.target.value);
        // Optional: Add debounced search here for real-time search
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={searchQuery}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
        </form>
    );
};

export default SearchBar;