import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { 
    Target, 
    TrendingUp, 
    Shield, 
    Users, 
    BarChart, 
    Clock,
    CheckCircle,
    ArrowRight
} from "lucide-react";

const LearnMore = () => {
    const features = [
        {
            icon: <Target className="h-8 w-8" />,
            title: "Smart Goal Setting",
            description: "Set achievable financial goals with our smart tracking system that breaks down your targets into manageable steps."
        },
        {
            icon: <TrendingUp className="h-8 w-8" />,
            title: "Expense Analytics",
            description: "Visualize your spending patterns with detailed charts and insights to identify areas for improvement."
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "Secure & Private",
            description: "Your financial data is encrypted and secure. We never share your information with third parties."
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: "Family Budgeting",
            description: "Manage household expenses with shared budgets and collaborative financial planning features."
        },
        {
            icon: <BarChart className="h-8 w-8" />,
            title: "Investment Tracking",
            description: "Monitor your investments and savings growth with real-time updates and projections."
        },
        {
            icon: <Clock className="h-8 w-8" />,
            title: "Real-time Updates",
            description: "Get instant notifications about your spending habits and budget progress throughout the day."
        }
    ];

    const benefits = [
        "Save up to 30% more each month",
        "Reduce unnecessary expenses by 40%",
        "Achieve financial goals 2x faster",
        "Better understanding of spending habits",
        "Peace of mind with organized finances"
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-16">
                {/* Hero Section */}
                <section className="bg-gradient-to-b from-bgColor to-gray-900 py-16">
                    <div className="container mx-auto px-4 text-center max-w-4xl">
                        <h1 className="text-4xl md:text-5xl font-heading uppercase mb-6">
                            Master Your <span className="text-primary">Finances</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Learn how BudgetNatin transforms your financial management with 
                            intuitive tools and smart insights.
                        </p>
                        <Link
                            to="/login"
                            className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primaryDark transition-colors duration-200 inline-flex items-center gap-2"
                        >
                            Start Your Journey
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-heading uppercase text-center mb-12">
                            Powerful <span className="text-primary">Features</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className="bg-gray-900 rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300"
                                >
                                    <div className="text-primary mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-heading uppercase mb-6">
                                    Transform Your <span className="text-primary">Financial Life</span>
                                </h2>
                                <p className="text-gray-300 mb-6">
                                    BudgetNatin users consistently report significant improvements in their 
                                    financial health within just 3 months of regular use.
                                </p>
                                <ul className="space-y-4">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                                            <span className="text-lg">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gradient-to-br from-primary/20 to-primaryDark/20 rounded-xl p-8">
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-primary mb-4">93%</div>
                                    <p className="text-xl font-medium">User Satisfaction Rate</p>
                                    <p className="text-gray-400 mt-2">
                                        Based on 10,000+ active users who achieved their financial goals
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-primaryDark/10 rounded-2xl p-8">
                            <h2 className="text-3xl font-heading uppercase mb-6">
                                Ready to Take Control?
                            </h2>
                            <p className="text-gray-300 mb-8">
                                Join thousands of users who have transformed their financial lives with BudgetNatin.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/login"
                                    className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primaryDark transition-colors duration-200"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    to="/"
                                    className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition-colors duration-200"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LearnMore;