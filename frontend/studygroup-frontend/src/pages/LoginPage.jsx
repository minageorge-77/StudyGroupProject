import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaBookOpen } from "react-icons/fa";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");

    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setError("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // جلب كل المستخدمين
    const savedUsers = JSON.parse(localStorage.getItem("studygroupUsers")) || [];

    // البحث عن المستخدم
    const matchedUser = savedUsers.find(
      (user) =>
        user.email.toLowerCase() === formData.email.toLowerCase() &&
        user.password === formData.password
    );

    // لو المستخدم غير موجود
    if (!matchedUser) {
      setError("Invalid email or password");
      return;
    }

    // لو الكرياتور مازال pending
    if (matchedUser.role === "creator" && matchedUser.status === "pending") {
      setError("Your creator account is still pending admin approval.");
      return;
    }

    // لو الكرياتور مرفوض
    if (matchedUser.role === "creator" && matchedUser.status === "rejected") {
      setError("Your creator account was rejected by admin.");
      return;
    }

    // تسجيل الدخول
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));

    // تذكر الإيميل
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    alert("Login successful!");

    // التوجيه حسب الدور
    if (matchedUser.role === "student") {
      navigate("/student/dashboard");
    } else if (matchedUser.role === "creator") {
      navigate("/creator/dashboard");
    } else if (matchedUser.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-3">
            <FaBookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-2">
            Login to your StudyGroup account
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4"
              />
              Remember me
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-slate-500 hover:text-blue-600">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}