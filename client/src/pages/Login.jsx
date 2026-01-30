import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, LogIn, Eye, EyeOff } from "lucide-react";
import api from "@/api/api"; // Changed from axios
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [socialLoading, setSocialLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError(""); // Clear error when user starts typing
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Using the centralized api instance
            const response = await api.post(
                "/api/auth/login",
                formData
            );

            if (response.data.success) {
                // Store token in localStorage
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.data.user)
                );

                // Redirect to dashboard
                navigate("/dashboard");
            } else {
                setError(response.data.message || "Login failed");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "An error occurred. Please try again."
            );
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Social Login Handler
    const handleGoogleLogin = async () => {
        setSocialLoading(true);
        try {
            // Use the full URL for OAuth redirect
            const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
            window.location.href = `${apiUrl}/api/auth/google`;
        } catch (err) {
            setError("Failed to connect with Google");
            console.error("Google login error:", err);
        } finally {
            setSocialLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-16">
            <Header />
            <div className="container mx-auto px-4 py-16 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left column - Welcome message */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Link to="/" className="inline-block">
                                <h1 className="text-4xl md:text-5xl font-heading uppercase">
                                    Budget
                                    <span className="text-primary">Natin</span>
                                </h1>
                            </Link>
                            <h3 className="text-3xl md:text-4xl font-bold">
                                Welcome Back
                            </h3>
                            <p className="text-lg md:text-xl leading-relaxed">
                                Sign in to continue tracking your expenses,
                                managing budgets, and achieving your financial
                                goals with BudgetNatin.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h6 className="font-bold text-2xl">
                                Don't have an account?
                            </h6>
                            <div className="space-y-4">
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center gap-3 p-4 rounded-xl 
                                    shadow-sm hover:shadow-md transition-shadow duration-200 
                                    hover:bg-gray-50 border border-gray-200"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                                        <Mail className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">
                                            Create Account
                                        </p>
                                        <p className="text-gray-300">
                                            Join BudgetNatin and start your
                                            financial journey
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-sm text-gray-300">
                                By signing in, you agree to our Terms of Service
                                and Privacy Policy.
                            </p>
                        </div>
                    </div>

                    {/* Right column - Login Form */}
                    <div className="p-8 rounded-2xl shadow-lg">
                        <div className="mb-8">
                            <h3 className="text-3xl font-heading mb-2">
                                Sign In
                            </h3>
                            <p className="text-gray-300">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-red-600 font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="font-medium flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="px-4 py-3 rounded-lg w-full border border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-primary
                                            transition-all duration-200"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-medium flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="px-4 py-3 rounded-lg w-full border border-gray-300
                                                focus:outline-none focus:ring-2 focus:ring-primary
                                                transition-all duration-200 pr-12"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                                                text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="h-4 w-4 text-primary rounded focus:ring-primary"
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="ml-2 text-gray-300"
                                    >
                                        Remember me
                                    </label>
                                </div>
                                <Link
                                    to="/forgot-password"
                                    className="text-primary hover:text-primaryDark font-medium"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-primary text-white font-medium rounded-lg
                                    hover:bg-primaryDark transition-colors duration-200 inline-flex
                                    items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg
                                    disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <p className="text-gray-300">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/register"
                                        className="text-primary font-semibold hover:text-primaryDark"
                                    >
                                        Sign Up
                                    </Link>
                                </p>
                            </div>

                            {/* Divider for Social Login */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span
                                        className="px-4 bg-bgColor font-semibold
                                    text-gray-200"
                                    >
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Social Login Button */}
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={socialLoading}
                                    className="w-full py-3 px-4 bg-white text-gray-800 font-medium rounded-lg
                                        hover:bg-gray-50 transition-colors duration-200 inline-flex
                                        items-center justify-center gap-3 text-lg border border-gray-300
                                        shadow-sm hover:shadow-md disabled:opacity-70"
                                >
                                    <img
                                        src="https://www.google.com/favicon.ico"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />
                                    <span>Continue with Google</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
};

export default Login;