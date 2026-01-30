import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import connection from "./db.js";

// Debug logging
console.log(
    "Google Client ID:",
    process.env.GOOGLE_CLIENT_ID ? "Set" : "Not Set"
);
console.log("Google Callback URL:", process.env.GOOGLE_CALLBACK_URL);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await connection.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                process.env.GOOGLE_CALLBACK_URL ||
                "http://localhost:5000/api/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("Google profile received:", profile.id);

                const email = profile.emails[0].value;

                // Check if user exists
                const [existingUsers] = await connection.query(
                    "SELECT * FROM users WHERE email = ? OR provider_id = ?",
                    [email, profile.id]
                );

                if (existingUsers.length > 0) {
                    // Update provider info if needed
                    const user = existingUsers[0];
                    if (
                        user.auth_provider !== "google" ||
                        user.provider_id !== profile.id
                    ) {
                        await connection.query(
                            "UPDATE users SET auth_provider = 'google', provider_id = ? WHERE id = ?",
                            [profile.id, user.id]
                        );
                        user.auth_provider = "google";
                        user.provider_id = profile.id;
                    }
                    return done(null, user);
                }

                // Create new user
                const [result] = await connection.query(
                    "INSERT INTO users (firstname, lastname, username, email, auth_provider, provider_id) VALUES (?, ?, ?, ?, 'google', ?)",
                    [
                        profile.name.givenName || "",
                        profile.name.familyName || "",
                        profile.displayName || `user_${Date.now()}`,
                        email,
                        profile.id
                    ]
                );

                const newUser = {
                    id: result.insertId,
                    firstname: profile.name.givenName || "",
                    lastname: profile.name.familyName || "",
                    username: profile.displayName || `user_${Date.now()}`,
                    email: email,
                    auth_provider: "google",
                    provider_id: profile.id
                };

                console.log("New Google user created:", newUser.id);
                done(null, newUser);
            } catch (error) {
                console.error("Google Strategy Error:", error);
                done(error, null);
            }
        }
    )
);

export default passport;
