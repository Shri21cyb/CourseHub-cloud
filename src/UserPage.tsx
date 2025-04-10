import { useState, useEffect } from "react";
import { GraduationCap, Moon, Sun, User } from "lucide-react";
import { CourseCard } from "./components/CourseCard";
import { Course } from "./types";
import { useNavigate, useLocation } from "react-router-dom";

const UserPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [cart, setCart] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark" || false;
  });
  const [profile, setProfile] = useState<{
    username: string;
    role: string;
    enrolledCourseCount: number;
    darkMode: boolean;
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
    document.title = "CourseHub - User";
  }, [isDarkMode]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlToken = urlParams.get("token");
    const urlRole = urlParams.get("role");
    if (urlToken && urlRole === "user") {
      setToken(urlToken);
      setRole("user");
      localStorage.setItem("token", urlToken);
      fetchProfile(urlToken);
      fetchCourses(urlToken);
      fetchCart(urlToken);
      fetchEnrolledCourses(urlToken);
    } else {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decoded = JSON.parse(atob(storedToken.split(".")[1]));
          if (decoded.user?.role === "user") {
            setToken(storedToken);
            setRole("user");
            fetchProfile(storedToken);
            fetchCourses(storedToken);
            fetchCart(storedToken);
            fetchEnrolledCourses(storedToken);
          } else {
            navigate("/auth");
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
          navigate("/auth");
        }
      } else {
        navigate("/auth");
      }
    }
  }, [location, navigate]);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch("http://localhost:3000/auth/profile", {
        headers: { "x-auth-token": authToken },
      });
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
      const data = await res.json();
      setProfile(data);
      setIsDarkMode(data.darkMode);
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      setProfile(null);
    }
  };

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

  const fetchCart = async (authToken: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/cart", {
        headers: { "x-auth-token": authToken },
      });
      if (!res.ok) throw new Error(`Failed to fetch cart: ${res.status}`);
      const data = await res.json();
      setCart(
        data.map((course: any) => ({ ...course, id: course._id.toString() }))
      );
    } catch (error) {
      console.error("Fetch Cart Error:", error);
      setCart([]);
    }
  };

  const fetchEnrolledCourses = async (authToken: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/enrolled", {
        headers: { "x-auth-token": authToken },
      });
      if (!res.ok)
        throw new Error(`Failed to fetch enrolled courses: ${res.status}`);
      const data = await res.json();
      setEnrolledCourses(
        data.map((course: any) => ({ ...course, id: course._id.toString() }))
      );
    } catch (error) {
      console.error("Fetch Enrolled Courses Error:", error);
      setEnrolledCourses([]);
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
      if (profile) setProfile({ ...profile, darkMode: newDarkMode });
    } catch (error) {
      console.error("Toggle Dark Mode Error:", error);
      setIsDarkMode(!newDarkMode);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setIsDarkMode(false);
    localStorage.removeItem("token");
    setCourses([]);
    setCart([]);
    setEnrolledCourses([]);
    setProfile(null);
    navigate("/");
  };

  const handleAddToCart = async (courseId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/cart/${courseId}`, {
        method: "POST",
        headers: { "x-auth-token": token },
      });
      if (res.ok) {
        fetchCart(token);
      } else {
        const errorData = await res.json();
        alert(`Failed to add to cart: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Add to Cart Error:", error);
      alert("An error occurred while adding to cart");
    }
  };

  const handleRemoveFromCart = async (courseId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/cart/${courseId}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(
          updatedCart.map((course: any) => ({
            ...course,
            id: course._id.toString(),
          }))
        );
      } else {
        const errorData = await res.json();
        alert(
          `Failed to remove from cart: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Remove from Cart Error:", error);
      alert("An error occurred while removing from cart");
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/enroll/${courseId}`, {
        method: "POST",
        headers: { "x-auth-token": token },
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Enrolled successfully");
        fetchEnrolledCourses(token);
        fetchCourses(token);
        fetchCart(token);
        if (profile)
          setProfile({
            ...profile,
            enrolledCourseCount: profile.enrolledCourseCount + 1,
          });
      } else {
        const errorData = await res.json();
        alert(`Enrollment failed: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Enroll Error:", error);
      alert("An error occurred during enrollment");
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/enroll/${courseId}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.ok) {
        const updatedEnrolled = await res.json();
        setEnrolledCourses(
          updatedEnrolled.map((course: any) => ({
            ...course,
            id: course._id.toString(),
          }))
        );
        fetchCourses(token);
        if (profile)
          setProfile({
            ...profile,
            enrolledCourseCount: profile.enrolledCourseCount - 1,
          });
      } else {
        const errorData = await res.json();
        alert(`Failed to unenroll: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Unenroll Error:", error);
      alert("An error occurred while unenrolling");
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEnrolled = (courseId: string) =>
    enrolledCourses.some((course) => course.id === courseId);
  const isInCart = (courseId: string) =>
    cart.some((course) => course.id === courseId);

  if (!token || role !== "user") {
    return null; // Let useEffect handle redirect
  }

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
        {profile && (
          <div
            className={`p-6 rounded shadow-md mb-8 ${
              isDarkMode ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } mb-4 flex items-center`}
            >
              <User className="mr-2" /> Your Profile
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Username:</span>{" "}
                {profile.username}
              </p>
              <p>
                <span className="font-semibold">Role:</span> {profile.role}
              </p>
              <p>
                <span className="font-semibold">Enrolled Courses:</span>{" "}
                {profile.enrolledCourseCount}
              </p>
            </div>
          </div>
        )}
        <div
          className={`p-6 rounded shadow-md mb-8 ${
            isDarkMode ? "bg-gray-800" : "bg-gray-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            } mb-4`}
          >
            Your Cart
          </h2>
          {cart.length === 0 ? (
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Your cart is empty.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cart.map((course) => (
                  <div key={course.id} className="relative">
                    <CourseCard course={course} />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={isEnrolled(course.id)}
                      >
                        {isEnrolled(course.id) ? "Enrolled" : "Enroll"}
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(course.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Total: $
                  {cart
                    .reduce((sum, course) => sum + (course.price || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
            </>
          )}
        </div>
        <div
          className={`p-6 rounded shadow-md mb-8 ${
            isDarkMode ? "bg-gray-800" : "bg-gray-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            } mb-4`}
          >
            Enrolled Courses
          </h2>
          {enrolledCourses.length === 0 ? (
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              You have no enrolled courses.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="relative">
                  <CourseCard course={course} />
                  <button
                    onClick={() => handleUnenroll(course.id)}
                    className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Unenroll
                  </button>
                </div>
              ))}
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
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleAddToCart(course.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={isInCart(course.id)}
                  >
                    {isInCart(course.id) ? "In Cart" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserPage;
