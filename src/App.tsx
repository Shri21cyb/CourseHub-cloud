import { useState, useEffect } from "react";
import { GraduationCap, Moon, Sun } from "lucide-react";
import { CourseCard } from "./components/CourseCard";
import { Course } from "./types";
import { useNavigate, useLocation } from "react-router-dom";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [role, setRole] = useState<"user" | "admin" | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = JSON.parse(atob(storedToken.split(".")[1]));
        return decoded.user?.role || null;
      } catch (error) {
        console.error("App: Invalid token on init", error);
        localStorage.removeItem("token");
        return null;
      }
    }
    return null;
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    instructor: "",
    category: "",
    price: 0,
    imageUrl: "",
    duration: "",
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark" || false;
  });
  const [activeForm, setActiveForm] = useState<"signIn" | "signUp" | null>(
    null
  );
  const [stats, setStats] = useState<
    { title: string; enrollmentCount: number; views: number }[]
  >([]);
  const [enrolledUsers, setEnrolledUsers] = useState<{
    courseTitle: string;
    users: string[];
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    document.title =
      token && role === "admin" ? "CourseHub - Admin" : "CourseHub";
  }, [isDarkMode, token, role]);

  useEffect(() => {
    console.log(
      "useEffect: token:",
      token,
      "role:",
      role,
      "path:",
      location.pathname
    );

    const urlParams = new URLSearchParams(location.search);
    const urlToken = urlParams.get("token");
    const urlRole = urlParams.get("role");

    if (urlToken && urlRole) {
      setToken(urlToken);
      setRole(urlRole as "user" | "admin");
      localStorage.setItem("token", urlToken);
      if (urlRole === "admin") {
        fetchCourses(urlToken);
        fetchStats(urlToken);
        navigate("/dashboard", { replace: true });
      } else if (urlRole === "user") {
        navigate("/user", { replace: true });
      }
      return;
    }

    if (token && role) {
      if (role === "admin" && location.pathname !== "/dashboard") {
        fetchCourses(token);
        fetchStats(token);
        navigate("/dashboard", { replace: true });
      } else if (role === "user" && location.pathname !== "/user") {
        navigate("/user", { replace: true });
      }
    } else if (!token && location.pathname !== "/auth") {
      navigate("/auth", { replace: true });
    }
  }, [location.pathname, token, role, navigate]);

  const fetchCourses = async (authToken: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/items", {
        headers: { "x-auth-token": authToken },
      });
      if (!res.ok) throw new Error(`Failed to fetch courses: ${res.status}`);
      const data = await res.json();
      setCourses(
        data.map((course: any) => ({ ...course, id: course._id.toString() }))
      );
    } catch (error) {
      console.error("Fetch Courses Error:", error);
      setCourses([]);
    }
  };

  const fetchStats = async (authToken: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/stats", {
        headers: { "x-auth-token": authToken },
      });
      if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Fetch Stats Error:", error);
      setStats([]);
    }
  };

  const fetchEnrolledUsers = async (courseId: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/enrollments/${courseId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      if (!res.ok)
        throw new Error(`Failed to fetch enrolled users: ${res.status}`);
      const data = await res.json();
      setEnrolledUsers({
        courseTitle: data.courseTitle,
        users: data.enrolledUsers,
      });
    } catch (error) {
      console.error("Fetch Enrolled Users Error:", error);
      setEnrolledUsers(null);
    }
  };

  const toggleDarkMode = async () => {
    if (!token) return;
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    try {
      await fetch("http://localhost:3000/auth/dark-mode", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ darkMode: newDarkMode }),
      });
    } catch (error) {
      console.error("Toggle Dark Mode Error:", error);
      setIsDarkMode(!newDarkMode);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setRole("user");
      setIsDarkMode(data.darkMode || false);
      localStorage.setItem("token", data.token);
      setUsername("");
      setPassword("");
      setActiveForm(null);
      navigate("/user", { replace: true });
    } else {
      alert(data.message || "Signup failed");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    console.log("Login response:", data);
    if (res.ok) {
      setToken(data.token);
      setRole(data.role);
      setIsDarkMode(data.darkMode || false);
      localStorage.setItem("token", data.token);
      setUsername("");
      setPassword("");
      setActiveForm(null);
      if (data.role === "admin") {
        fetchCourses(data.token);
        fetchStats(data.token);
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    } else {
      alert(data.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setIsDarkMode(false);
    localStorage.removeItem("token");
    setCourses([]);
    setStats([]);
    setEnrolledUsers(null);
    navigate("/", { replace: true });
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || role !== "admin") return;
    const method = editingCourse ? "PUT" : "POST";
    const url = editingCourse
      ? `http://localhost:3000/api/item/${editingCourse.id}`
      : "http://localhost:3000/api/item";
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newCourse),
      });
      if (res.ok) {
        fetchCourses(token);
        setNewCourse({
          title: "",
          description: "",
          instructor: "",
          category: "",
          price: 0,
          imageUrl: "",
          duration: "",
        });
        setEditingCourse(null);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save course");
      }
    } catch (error) {
      console.error("Save Course Error:", error);
      alert("An error occurred while saving the course");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!token || role !== "admin") return;
    const res = await fetch(`http://localhost:3000/api/item/${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });
    if (res.ok) {
      fetchCourses(token);
    } else {
      const errorData = await res.json();
      alert(`Failed to delete course: ${errorData.message || "Unknown error"}`);
    }
  };

  const handleEditCourse = (course: Course & { _id?: string }) => {
    if (role !== "admin") return;
    const courseId = course._id || course.id;
    setEditingCourse({ ...course, id: courseId });
    setNewCourse({ ...course, id: courseId });
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (location.pathname === "/auth" && !token) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"
        }`}
      >
        <div
          className={`p-8 rounded shadow-md w-full max-w-md ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h1 className="text-2xl font-bold mb-6 flex items-center justify-center">
            <GraduationCap className="mr-2" /> CourseHub
          </h1>
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveForm("signIn")}
              className={`px-4 py-2 rounded ${
                activeForm === "signIn"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveForm("signUp")}
              className={`px-4 py-2 rounded ${
                activeForm === "signUp"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Sign Up
            </button>
          </div>
          {activeForm === "signIn" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
              >
                Sign In
              </button>
            </form>
          )}
          {activeForm === "signUp" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
              >
                Sign Up
              </button>
            </form>
          )}
          <button
            onClick={handleGoogleLogin}
            className="w-full mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  if (location.pathname === "/dashboard" && role === "admin") {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"
        }`}
      >
        <header
          className={`${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <GraduationCap
                className={`h-8 w-8 ${
                  isDarkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              />
              <h1 className="ml-2 text-2xl font-bold">CourseHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className={`p-6 rounded shadow-md mb-8 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {editingCourse ? "Edit Course" : "Add New Course"}
            </h2>
            <form
              onSubmit={handleSaveCourse}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Title"
                value={newCourse.title || ""}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, title: e.target.value })
                }
                className={`p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <input
                type="text"
                placeholder="Description"
                value={newCourse.description || ""}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
                className={`p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <input
                type="text"
                placeholder="Instructor"
                value={newCourse.instructor || ""}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, instructor: e.target.value })
                }
                className={`p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <input
                type="text"
                placeholder="Category"
                value={newCourse.category || ""}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, category: e.target.value })
                }
                className={`p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <input
                type="number"
                placeholder="Price"
                value={newCourse.price || 0}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, price: Number(e.target.value) })
                }
                className={`p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newCourse.imageUrl || ""}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, imageUrl: e.target.value })
                }
                className={`p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <input
                type="text"
                placeholder="Duration"
                value={newCourse.duration || ""}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, duration: e.target.value })
                }
                className={`p-2 border rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              <button
                type="submit"
                className="col-span-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
              >
                {editingCourse ? "Update Course" : "Add Course"}
              </button>
              {editingCourse && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCourse(null);
                    setNewCourse({
                      title: "",
                      description: "",
                      instructor: "",
                      category: "",
                      price: 0,
                      imageUrl: "",
                      duration: "",
                    });
                  }}
                  className="col-span-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <div className="mt-8">
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Course Statistics
              </h2>
              {stats.length === 0 ? (
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  No statistics available.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.title}
                      className={`p-4 rounded shadow-md ${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      }`}
                    >
                      <h3 className="font-semibold">{stat.title}</h3>
                      <p>Enrollments: {stat.enrollmentCount}</p>
                      <p>Views: {stat.views}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {enrolledUsers && (
              <div className="mt-8">
                <h2
                  className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Enrolled Users for {enrolledUsers.courseTitle}
                </h2>
                {enrolledUsers.users.length === 0 ? (
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    No users enrolled in this course.
                  </p>
                ) : (
                  <ul
                    className={`list-disc pl-5 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {enrolledUsers.users.map((user, index) => (
                      <li key={index}>{user}</li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setEnrolledUsers(null)}
                  className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Courses</h2>
            <div className="flex space-x-2">
              <input
                type="search"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`px-4 py-2 border rounded ${
                  isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"
                }`}
              />
              <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Search
              </button>
            </div>
          </div>
          {courses.length === 0 ? (
            <p className="text-center">
              No courses available. Please try again later.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="relative">
                  <CourseCard course={course} />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => fetchEnrolledUsers(course.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View Enrollments
                    </button>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }
  if (!token || role !== "user") {
    return null;
  }
  return null;
}

export default App;
