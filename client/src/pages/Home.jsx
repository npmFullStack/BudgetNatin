import { Link } from "react-router-dom";
import { ChartPie, Info, CheckCircle, Phone, Mail, Send } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import aboutImg from "@/assets/images/aboutImg.png";

const Home = () => {
    return (
        <main>
            <Header />

            {/* HERO SECTION */}
            <section id="hero" className="min-h-screen flex pt-16">
                <div
                    className="container mx-auto flex flex-col
                    items-center justify-center space-y-10 max-w-5xl text-center px-4"
                >
                    {/* Hero title */}
                    <h1 className="text-5xl md:text-6xl font-heading uppercase">
                        Bitin ang <span className="text-primary">budget?</span>
                    </h1>

                    {/* Hero subtitle */}
                    <p className="text-2xl">
                        Discover smarter ways to save and manage your money with
                        BudgetNatin, your personal finance companion
                    </p>

                    {/* CTA buttons container */}
                    <div
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6
                        justify-center items-center w-full max-w-xl"
                    >
                        {/* Primary CTA button */}
                        <Link
                            to="/login"
                            className="bg-primary text-white rounded-full px-6 py-3
                            inline-flex items-center gap-2 cursor-pointer
                            hover:bg-primaryDark transition-colors duration-200
                            w-full sm:w-auto justify-center"
                        >
                            <ChartPie className="h-6 w-6" />
                            <span className="text-lg font-medium">
                                Start Tracking
                            </span>
                        </Link>

                        {/* Secondary CTA button */}
                        <Link
                            to="/learn-more"
                            className="bg-gray-100 rounded-full px-6 py-3
                            text-gray-700 inline-flex items-center gap-2 cursor-pointer
                            hover:bg-gray-200 transition-colors duration-200
                            w-full sm:w-auto justify-center"
                        >
                            <Info className="h-6 w-6" />
                            <span className="text-lg font-medium">
                                Learn More
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section
                id="about"
                className="min-h-screen flex items-center
            justify-center pt-16"
            >
                {/* Main container - Grid layout */}
                <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    {/* Left column - Text content */}
                    <div className="order-2 md:order-1">
                        {/* About title */}
                        <h3 className="text-4xl md:text-5xl font-heading uppercase mb-6 text-center md:text-left">
                            About{" "}
                            <span className="text-primary">BudgetNatin</span>
                        </h3>

                        {/* About description */}
                        <p className="text-lg md:text-xl text-left leading-relaxed mb-8">
                            BudgetNatin is a user-friendly budgeting app that
                            helps you track expenses, set financial goals, and
                            save smarter with personalized insights.
                        </p>

                        {/* Features title */}
                        <span className="text-xl md:text-2xl font-bold block mb-6 text-center md:text-left">
                            Why Choose BudgetNatin?
                        </span>

                        {/* Features list */}
                        <ul className="space-y-4">
                            {[
                                "Easy tracking",
                                "Personalized budgets",
                                "Real-time expense alerts",
                                "Boost your savings"
                            ].map((reason, index) => (
                                <li
                                    key={index}
                                    className="text-lg md:text-xl inline-flex items-center gap-3 w-full"
                                >
                                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                                    <span>{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right column - Image */}
                    <div className="order-1 md:order-2 flex justify-center md:justify-end">
                        <img
                            src={aboutImg}
                            alt="BudgetNatin App Preview"
                            className="w-full max-w-md md:max-w-lg object-contain rounded-lg"
                        />
                    </div>
                </div>
            </section>
            <section
                id="contact"
                className="min-h-screen flex pt-16 items-center justify-center"
            >
                <div
                    className="container mx-auto max-w-6xl px-4 grid grid-cols-1
                    md:grid-cols-2 gap-12 md:gap-16 items-center"
                >
                    {/* Left column - Contact Information */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-4xl md:text-5xl font-heading">
                                Get in{" "}
                                <span className="text-primary">Touch</span>
                            </h3>
                            <p className="text-lg md:text-xl leading-relaxed">
                                Have questions about BudgetNatin? We're here to
                                help you achieve your financial goals. Reach out
                                to us for support or feedback.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h6 className="font-bold text-2xl">
                                Contact Information
                            </h6>
                            <div className="space-y-4">
                                {[
                                    {
                                        icon: (
                                            <Mail className="w-6 h-6 text-primary" />
                                        ),
                                        label: "Email",
                                        value: "budgetnatin@email.com",
                                        link: "mailto:budgetnatin@email.com"
                                    },
                                    {
                                        icon: (
                                            <Phone className="w-6 h-6 text-primary" />
                                        ),
                                        label: "Phone",
                                        value: "+63 994 443 5770",
                                        link: "tel:+639944435770"
                                    }
                                ].map((info, index) => (
                                    <a
                                        key={index}
                                        href={info.link}
                                        className="flex items-center gap-4 p-4 rounded-xl 
                                     shadow-sm hover:shadow-md transition-shadow duration-200 
                                     hover:bg-gray-50"
                                    >
                                        <div
                                            className="flex items-center justify-center w-12 h-12 
                                         rounded-full bg-primary/10"
                                        >
                                            {info.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium ">
                                                {info.label}
                                            </p>
                                            <p className=" font-semibold">
                                                {info.value}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-sm">
                                We typically respond within 24 hours on business
                                days.
                            </p>
                        </div>
                    </div>

                    {/* Right column - Contact Form */}
                    <div className="p-8 rounded-2xl shadow-lg">
                        <div className="mb-8">
                            <h3
                                className="text-3xl font-heading 
                            mb-2"
                            >
                                Send us a message
                            </h3>
                            <p>
                                Fill out the form below and we'll get back to
                                you soon.
                            </p>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className=" font-medium">Name</label>
                                    <input
                                        type="text"
                                        className="px-4 py-3 rounded-lg w-full
                                     focus:outline-none focus:ring-2 focus:ring-primary
                                     transition-all duration-200  "
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className=" font-medium">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="px-4 py-3 rounded-lg w-full
                                     focus:outline-none focus:ring-2 focus:ring-primary
                                  transition-all   duration-200"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className=" font-medium">Subject</label>
                                <input
                                    type="text"
                                    className="px-4 py-3 rounded-lg w-full
                                 focus:outline-none   focus:ring-2 focus:ring-primary
                            transition-all duration-200"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className=" font-medium">Message</label>
                                <textarea
                                    rows="5"
                                    className="px-4 py-3 rounded-lg w-full
                                     
                                 focus:outline-none focus:ring-2 focus:ring-primary
                            transition-all duration-200 resize-none"
                                    placeholder="Tell us about your inquiry..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 px-6 bg-primary text-white font-medium rounded-lg
                             hover:bg-primaryDark transition-colors duration-200 inline-flex
                             items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg"
                            >
                                <Send className="w-5 h-5" />
                                <span>Send Message</span>
                            </button>

                            <p className="text-sm text-center pt-2">
                                By submitting this form, you agree to our
                                Privacy Policy.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <Footer />
        </main>
    );
};

export default Home;
