import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Adjust path to your connectDB file
import User from "./models/User.js"; // Adjust path to your User model

dotenv.config();

// Predefined admin credentials
const preHashAdminPasswords = async () => {
  const adminCredentials = [
    { username: "admin1", password: "adminpass1" },
    { username: "admin2", password: "passadmin123" }, // For your professor
  ];

  try {
    // Connect to the database
    await connectDB();

    // Loop through and seed admins
    for (const admin of adminCredentials) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Check if the admin already exists
      const existingUser = await User.findOne({ username: admin.username });
      if (!existingUser) {
        const newAdmin = new User({
          username: admin.username,
          password: hashedPassword,
          role: "admin", // Set role to admin
          darkMode: false, // Default values
          cart: [],
          enrolledCourses: [],
        });
        await newAdmin.save();
        console.log(`Admin ${admin.username} added to database`);
      } else {
        console.log(`Admin ${admin.username} already exists`);
      }
    }
  } catch (error) {
    console.error("Error seeding admins:", error);
  } finally {
    // Disconnect after seeding
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seeding function
preHashAdminPasswords();
