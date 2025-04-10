import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import path from "path";
import { fileURLToPath } from "url";
import "./config/passport.js";
import Course from "./models/Course.js";
import initialCourses from "./initialCourses.json" with { type: "json" };
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic URLs from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Seed database on startup
const seedDatabase = async () => {
  try {
    const count = await Course.countDocuments();
    console.log("Course count on startup:", count);
    if (count === 0) {
      await Course.insertMany(initialCourses);
      console.log("Database seeded with initial courses");
    }
  } catch (error) {
    console.error("Seeding error on startup:", error);
  }
};

connectDB().then(() => seedDatabase());

// Routes
app.use("/auth", authRoutes);
app.use("/api", courseRoutes);

// Serve React app
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../dist", "index.html")));
} else {
  app.get("/", (req, res) => res.send("API is running..."));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const startServer = () => {
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is in use. Please free the port or set a different PORT in .env.`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
    }
  });
};

if (!process.env.JEST_WORKER_ID) {
  startServer();
}

export default app;