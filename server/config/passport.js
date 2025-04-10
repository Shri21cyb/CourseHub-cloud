import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const CALLBACK_URL = `${
  process.env.BACKEND_URL || "http://localhost:3000"
}/auth/google/callback`;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            username: profile.emails?.[0]?.value || profile.displayName,
            googleId: profile.id,
            role: "user",
            darkMode: false,
            cart: [],
            enrolledCourses: [],
          });
          await user.save();
          console.log("New user created:", user);
        } else {
          console.log("Existing user found:", user);
        }
        done(null, user);
      } catch (err) {
        console.error("Passport Error:", err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error("User not found"), null);
    }
    done(null, user);
  } catch (err) {
    console.error("Deserialize Error:", err);
    done(err, null);
  }
});

export default passport;
