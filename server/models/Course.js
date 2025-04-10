import mongoose from "mongoose";
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: String,
  category: String,
  price: Number,
  imageUrl: String,
  duration: String,
  enrollmentCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, // New field
});

export default mongoose.model("Course", courseSchema);
