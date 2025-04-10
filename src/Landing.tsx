import { useState, useEffect } from "react";
import { GraduationCap, Moon, Sun } from "lucide-react";
import { CourseCard } from "./components/CourseCard";
import { Course } from "./types";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark" || false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    document.title = "CourseHub";
  }, [isDarkMode]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        const role = decoded.user?.role; // Access nested role
        console.log("Landing: token found, decoded:", decoded, "role:", role);
        if (role === "admin") {
          navigate("/dashboard", { replace: true });
        } else if (role === "user") {
          navigate("/user", { replace: true });
        } else {
          console.warn("Landing: Role not recognized, clearing token");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Landing: Invalid token format", error);
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/public/items");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setCourses(
          data.map((course: any) => ({ ...course, id: course._id.toString() }))
        );
      } catch (error) {
        console.error("Fetch Courses Error:", error);
      }
    };
    fetchCourses();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onClick={() => navigate("/auth")}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Courses</h2>
          <div className="flex space-x-2">
            <input
              type="search"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Landing;
