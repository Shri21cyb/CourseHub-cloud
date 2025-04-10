import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  darkMode: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

export default mongoose.model("User", userSchema, "users"); // Explicitly set collection name to "users"
