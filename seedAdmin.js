const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin"); // Adjust path
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdmin = async () => {
  try {
    const username = "admin";
    const password = "password"; // Change this!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      username,
      password: hashedPassword,
      role: "admin",
      darkMode: false,
      cart: [],
      enrolledCourses: [],
    });

    await admin.save();
    console.log("Admin created successfully:", username);
    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating admin:", error);
    mongoose.connection.close();
  }
};

createAdmin();
