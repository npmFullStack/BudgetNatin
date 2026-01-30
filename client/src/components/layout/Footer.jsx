import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Home, Users, Mail, LogIn, Info } from "lucide-react";

const Footer = () => {
    const quickLinks = [
        { label: "Login", href: "/login", icon: <LogIn className="h-4 w-4" /> },
        {
            label: "Learn More",
            href: "/learn-more",
            icon: <Info className="h-4 w-4" />
        }
    ];

    const sectionLinks = [
        { label: "Home", href: "#hero", icon: <Home className="h-4 w-4" /> },
        {
            label: "About Us",
            href: "#about",
            icon: <Users className="h-4 w-4" />
        },
        {
            label: "Contact Us",
            href: "#contact",
            icon: <Mail className="h-4 w-4" />
        }
    ];

    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link
                            to="/"
                            className="text-2xl font-heading uppercase text-primary flex items-center"
                        >
                            BudgetNatin
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your personal finance companion helping you track
                            expenses, set financial goals, and save smarter with
                            personalized insights.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        {link.icon}
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Section Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Navigation</h3>
                        <ul className="space-y-3">
                            {sectionLinks.map(link => (
                                <li key={link.label}>
                                    <HashLink
                                        to={link.href}
                                        smooth
                                        className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        {link.icon}
                                        {link.label}
                                    </HashLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact Info</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-400">Email</p>
                                <p className="text-white">
                                    budgetnatin@gmail.com
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Phone</p>
                                <p className="text-white">+63 994 443 5770</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-8"></div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        Developed by Norway Mangorangca
                    </p>
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} BudgetNatin. All
                        rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
