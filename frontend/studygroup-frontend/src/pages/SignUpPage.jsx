import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBookOpen } from "react-icons/fa";
import { addNotification } from "../utils/notifications";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^_-])[A-Za-z\d@$!%*?&.#^_-]{8,}$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!strongPasswordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // جلب كل المستخدمين
    const allUsers = JSON.parse(localStorage.getItem("studygroupUsers")) || [];

    // التحقق من وجود الإيميل مسبقًا
    const emailExists = allUsers.some(
      (user) => user.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (emailExists) {
      setErrors((prev) => ({
        ...prev,
        email: "This email is already registered",
      }));
      return;
    }

    // المستخدم الجديد
    const newUser = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      status: formData.role === "creator" ? "pending" : "approved",
    };

    const updatedUsers = [...allUsers, newUser];

    localStorage.setItem("studygroupUsers", JSON.stringify(updatedUsers));

    // إشعار للأدمن لو التسجيل كرياتور
    if (newUser.role === "creator") {
      addNotification({
        type: "creator-request",
        title: "New Creator Request",
        message: `${newUser.fullName} registered as a creator and is waiting for approval.`,
        userEmail: "admin",
      });

      alert(
        "Sign up successful! Your creator account is pending admin approval."
      );
    } else {
      alert("Sign up successful! Now login with your email and password.");
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-3">
            <FaBookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-2">
            Join StudyGroup and start learning together
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

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
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
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
                placeholder="Create a strong password"
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

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}

            <p className="text-xs text-slate-500 mt-1">
              Must contain 8+ characters, uppercase, lowercase, number, and
              special character.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="creator">Group Creator</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
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