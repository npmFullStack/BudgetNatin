module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                heading: ["Anton SC", "sans-serif"],
                sans: ["Montserrat", "sans-serif"]
            },
            colors: {
                bgColor: "#000022",
                primary: "#2176FF",
                primaryDark: "#003cac"
            }
        }
    },
    plugins: []
};