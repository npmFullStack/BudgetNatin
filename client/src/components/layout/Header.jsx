import React, { useState } from "react";
import { Menu, X, Home, Users, Mail, LogIn } from "lucide-react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { label: "Home", href: "#hero", icon: <Home className="h-5 w-5" /> },
        {
            label: "About Us",
            href: "#about",
            icon: <Users className="h-5 w-5" />
        },
        {
            label: "Contact Us",
            href: "#contact",
            icon: <Mail className="h-5 w-5" />
        }
    ];

    return (
        <header className="fixed top-0 left-0 w-full h-16 bg-bgColor z-50">
            <div className="container mx-auto h-full px-4 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl font-heading uppercase text-primary flex items-center gap-2"
                >
                    BudgetNatin
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navItems.map(item => (
                        <HashLink
                            key={item.label}
                            to={item.href}
                            smooth
                            className="text-white hover:text-primary transition-colors duration-200 font-medium flex items-center gap-2"
                        >
                            {item.icon}
                            {item.label}
                        </HashLink>
                    ))}
                    <Link
                        to="/login"
                        className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primaryDark transition-colors duration-200 font-medium flex items-center gap-2"
                    >
                        <LogIn className="h-5 w-5" />
                        Get Started
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden text-white p-2"
                >
                    {isMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-bgColor px-4 py-4 border-t border-gray-800">
                    <div className="flex flex-col gap-4">
                        {navItems.map(item => (
                            <HashLink
                                key={item.label}
                                to={item.href}
                                smooth
                                className="text-white hover:text-primary transition-colors duration-200 font-medium py-2 flex items-center gap-3"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.icon}
                                {item.label}
                            </HashLink>
                        ))}
                        <Link
                            to="/login"
                            className="bg-primary text-white py-3 rounded-lg hover:bg-primaryDark transition-colors duration-200 font-medium mt-2 flex items-center justify-center gap-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <LogIn className="h-5 w-5" />
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;
