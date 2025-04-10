import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  darkMode: { type: Boolean, default: false },
  role: { type: String, default: "admin" }, // Added role
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // Added cart
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // Added enrolledCourses
});

export default mongoose.model("Admin", adminSchema, "admins");
