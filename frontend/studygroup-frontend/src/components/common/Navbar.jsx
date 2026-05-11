import { Link, useNavigate } from "react-router-dom";
import { MdMenuBook } from "react-icons/md";

export default function Navbar() {
  const navigate = useNavigate();

  // نحدد هل المستخدم عامل login ولا لا
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const currentUser = isLoggedIn
    ? JSON.parse(localStorage.getItem("loggedInUser"))
    : null;

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  // تحديد رابط الداشبورد حسب نوع المستخدم
  const dashboardPath =
    currentUser?.role === "creator"
      ? "/creator/dashboard"
      : "/student/dashboard";

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <MdMenuBook className="w-8 h-8 object-contain text-blue-600" />
          <h1 className="text-2xl font-bold text-blue-600">StudyGroup</h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link to="/groups" className="hover:text-blue-600 transition">
            Browse
          </Link>
          <Link to="/" className="hover:text-blue-600 transition">
            About
          </Link>
        </nav>

        {!isLoggedIn || !currentUser ? (
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium hover:bg-slate-50 transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block px-4 py-2 rounded-xl bg-slate-100 text-sm font-medium text-slate-700">
              {currentUser.fullName}
            </span>

            <Link
              to={dashboardPath}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium hover:bg-slate-50 transition"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}