import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// Public endpoint for landing page
router.get("/public/items", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error("Fetch Public Courses Error:", error);
    res.status(500).json({ message: "Server error while fetching courses" });
  }
});

// Authenticated endpoint for users/admins
router.get("/items", auth, async (req, res) => {
  try {
    const courseId = req.query.id;
    let query = Course.find();
    if (courseId) {
      query = query.where("_id").equals(courseId);
    }
    const courses = await query;
    await Promise.all(
      courses.map(async (course) => {
        course.views += 1;
        await course.save();
      })
    );
    res.json(courses);
  } catch (error) {
    console.error("Fetch Courses Error:", error);
    res.status(500).json({ message: "Server error while fetching courses" });
  }
});

// Stats for admin
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().select("title enrollmentCount views");
    res.json(courses);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
});

// Admin routes
router.post("/item", auth, adminOnly, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.json(course);
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({ message: "Server error while creating course" });
  }
});

router.put("/item/:id", auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: "Server error while updating course" });
  }
});

router.delete("/item/:id", auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.sendStatus(204);
  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ message: "Server error while deleting course" });
  }
});

// User cart routes
router.post("/cart/:courseId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart");
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Users only" });
    if (!user.cart.includes(req.params.courseId)) {
      user.cart.push(req.params.courseId);
      await user.save();
    }
    res.json(user.cart);
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ message: "Server error while adding to cart" });
  }
});

router.delete("/cart/:courseId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.cart = user.cart.filter((id) => id.toString() !== req.params.courseId);
    await user.save();
    const updatedCart = await Course.find({ _id: { $in: user.cart } });
    res.json(updatedCart);
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({ message: "Server error while removing from cart" });
  }
});

router.get("/cart", auth, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Users only" });
    const user = await User.findById(req.user.id).populate("cart");
    res.json(user.cart);
  } catch (error) {
    console.error("Fetch Cart Error:", error);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
});

// Enrollment routes
router.post("/enroll/:courseId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const course = await Course.findById(req.params.courseId);
    if (!user || !course)
      return res.status(404).json({ message: "User or course not found" });
    if (!user.enrolledCourses.includes(course._id)) {
      user.enrolledCourses.push(course._id);
      course.enrollmentCount += 1;
      user.cart = user.cart.filter(
        (id) => id.toString() !== course._id.toString()
      );
      await user.save();
      await course.save();
    }
    res.json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error("Enroll Error:", error);
    res.status(500).json({ message: "Server error while enrolling" });
  }
});

router.get("/enrolled", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("enrolledCourses");
    res.json(user.enrolledCourses);
  } catch (error) {
    console.error("Fetch Enrolled Courses Error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching enrolled courses" });
  }
});

router.delete("/enroll/:courseId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const course = await Course.findById(req.params.courseId);
    if (!user || !course) {
      return res.status(404).json({ message: "User or course not found" });
    }
    user.enrolledCourses = user.enrolledCourses.filter(
      (id) => id.toString() !== course._id.toString()
    );
    course.enrollmentCount -= 1;
    await user.save();
    await course.save();
    res.json(user.enrolledCourses);
  } catch (error) {
    console.error("Unenroll Error:", error);
    res.status(500).json({ message: "Server error while unenrolling" });
  }
});

router.get("/enrollments/:courseId", auth, adminOnly, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrolledUsers = await User.find({
      enrolledCourses: courseId,
    }).select("username");

    res.json({
      courseTitle: course.title,
      enrolledUsers: enrolledUsers.map((user) => user.username),
    });
  } catch (error) {
    console.error("Fetch Enrolled Users Error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching enrolled users" });
  }
});

router.get("/admin", auth, adminOnly, (req, res) => {
  res.json({ message: "Welcome to the admin page" });
});

export default router;
