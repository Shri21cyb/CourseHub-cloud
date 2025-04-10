import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import auth from "../middleware/auth.js";
import "dotenv/config";
import passport from "passport";

const router = express.Router();

// Regular Signup Route
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      username,
      password,
      role: "user",
      darkMode: false,
      cart: [],
      enrolledCourses: [],
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("User signup success:", { username, role: user.role });
    res.json({ token, role: user.role, darkMode: user.darkMode });
  } catch (error) {
    console.error("Signup Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    let admin = await Admin.findOne({ username });
    const account = user || admin;
    if (!account) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: account.id,
        role: account.role,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login success:", { username, role: account.role });
    res.json({ token, role: account.role, darkMode: account.darkMode });
  } catch (error) {
    console.error("Login Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Google Authentication Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/auth?error=auth_failed`,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error("No user found in req.user after Google auth");
        return res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/auth?error=auth_failed`
        );
      }

      const payload = {
        user: { id: req.user._id, role: req.user.role },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      console.log("Google callback success:", {
        username: req.user.username,
        role: req.user.role,
        token,
      });

      // Redirect based on role
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const redirectUrl =
        req.user.role === "admin"
          ? `${baseUrl}/dashboard?token=${token}&role=${req.user.role}&darkMode=${req.user.darkMode}`
          : `${baseUrl}/user?token=${token}&role=${req.user.role}&darkMode=${req.user.darkMode}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google Callback Error:", error.message, error.stack);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/auth?error=server_error`
      );
    }
  }
);

// Dark Mode Routes
router.get("/dark-mode", auth, async (req, res) => {
  try {
    const Model = req.user.role === "admin" ? Admin : User;
    const user = await Model.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ darkMode: user.darkMode });
  } catch (error) {
    console.error("Dark Mode Get Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error fetching dark mode" });
  }
});

router.put("/dark-mode", auth, async (req, res) => {
  try {
    const Model = req.user.role === "admin" ? Admin : User;
    const user = await Model.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.darkMode = req.body.darkMode;
    await user.save();
    res.json({ darkMode: user.darkMode });
  } catch (error) {
    console.error("Dark Mode Update Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error updating dark mode" });
  }
});

// Profile Route
router.get("/profile", auth, async (req, res) => {
  try {
    const Model = req.user.role === "admin" ? Admin : User;
    const user = await Model.findById(req.user.id).select(
      "username role darkMode enrolledCourses"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      username: user.username,
      role: user.role,
      darkMode: user.darkMode,
      enrolledCourseCount: user.enrolledCourses.length,
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

export default router;
