import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react";
import api from "@/api/api"; // Changed from axios
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError("");
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // Validation
        const requiredFields = [
            "firstname",
            "lastname",
            "username",
            "email",
            "password",
            "confirmPassword"
        ];
        for (const field of requiredFields) {
            if (!formData[field]) {
                setError("Please fill in all required fields");
                return;
            }
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Using the centralized api instance
            const response = await api.post(
                "/api/auth/register",
                {
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }
            );

            if (response.data.success) {
                setSuccess(
                    "Account created successfully! Redirecting to login..."
                );

                // Store token and user data
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.data.user)
                );

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            } else {
                setError(response.data.message || "Registration failed");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "An error occurred. Please try again."
            );
            console.error("Registration error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Social Registration Handler
    const handleGoogleRegister = async () => {
        setSocialLoading(true);
        try {
            // Use the full URL for OAuth redirect
            const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
            window.location.href = `${apiUrl}/api/auth/google`;
        } catch (err) {
            setError("Failed to connect with Google");
            console.error("Google registration error:", err);
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
                                Start Your Financial Journey
                            </h3>
                            <p className="text-lg md:text-xl leading-relaxed">
                                Join thousands of users who are taking control
                                of their finances with BudgetNatin's powerful
                                budgeting tools.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h6 className="font-bold text-2xl">
                                Already have an account?
                            </h6>
                            <div className="space-y-4">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-3 p-4 rounded-xl 
                                    shadow-sm hover:shadow-md transition-shadow duration-200 
                                    hover:bg-gray-50 border border-gray-200"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">
                                            Sign In
                                        </p>
                                        <p className="text-gray-300">
                                            Access your account and continue
                                            your financial journey
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-sm text-gray-300">
                                By creating an account, you agree to our Terms
                                of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>

                    {/* Right column - Registration Form */}
                    <div className="p-8 rounded-2xl shadow-lg">
                        <div className="mb-8">
                            <h3 className="text-3xl font-heading mb-2">
                                Create Account
                            </h3>
                            <p className="text-gray-300">
                                Fill in your details to get started
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

                            {success && (
                                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                    <p className="text-green-600 font-medium">
                                        {success}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-medium">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        className="px-4 py-3 rounded-lg w-full border border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-primary
                                            transition-all duration-200"
                                        placeholder="John"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-medium">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                        className="px-4 py-3 rounded-lg w-full border border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-primary
                                            transition-all duration-200"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="font-medium flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="px-4 py-3 rounded-lg w-full border border-gray-300
                                            focus:outline-none focus:ring-2 focus:ring-primary
                                            transition-all duration-200"
                                        placeholder="Choose a username"
                                        required
                                    />
                                </div>

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
                                            placeholder="At least 6 characters"
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
                                    <p className="text-sm text-gray-500 mt-1">
                                        Password must be at least 6 characters
                                        long
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-medium flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="px-4 py-3 rounded-lg w-full border border-gray-300
                                                focus:outline-none focus:ring-2 focus:ring-primary
                                                transition-all duration-200 pr-12"
                                            placeholder="Confirm your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                                                text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="h-4 w-4 text-primary rounded focus:ring-primary"
                                    required
                                />
                                <label
                                    htmlFor="terms"
                                    className="ml-2 text-gray-300"
                                >
                                    I agree to the{" "}
                                    <Link
                                        to="/terms"
                                        className="text-primary hover:text-primaryDark"
                                    >
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        to="/privacy"
                                        className="text-primary hover:text-primaryDark"
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
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
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        <span>Create Account</span>
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <p className="text-gray-300">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="text-primary font-semibold hover:text-primaryDark"
                                    >
                                        Sign In
                                    </Link>
                                </p>
                            </div>

                            {/* Divider for Social Registration */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span
                                        className="px-4 bg-bgColor text-gray-200
                                    font-semibold"
                                    >
                                        Or sign up with
                                    </span>
                                </div>
                            </div>

                            {/* Social Registration Button */}
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleRegister}
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
                                    <span>Sign up with Google</span>
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

export default Register;