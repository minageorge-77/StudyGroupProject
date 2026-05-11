import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications } from "../utils/notifications";

import {
  FaBookOpen,
  FaThLarge,
  FaUsers,
  FaBell,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
} from "react-icons/fa";

export default function StudentDashboard() {
  // بيانات المستخدم الحالي
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || {
    fullName: "Student",
    email: "",
  };

  // القسم الحالي المفتوح
  const [activeSection, setActiveSection] = useState("dashboard");

  // كل الجروبات اللي أنشأها الـ creators
  const creatorGroups = JSON.parse(localStorage.getItem("creatorGroups")) || [];

  // كل الجروبات اللي الطالب انضم لها
  const joinedGroups = JSON.parse(localStorage.getItem("joinedGroups")) || [];

  // كل الطلبات
  const joinRequests = JSON.parse(localStorage.getItem("joinRequests")) || [];

  // جروبات الطالب الحالية
  const myGroups = useMemo(() => {
    const userJoinedGroups = joinedGroups.filter(
      (item) => item.userEmail === currentUser.email
    );

    return userJoinedGroups
      .map((joined) => {
        const fullGroup = creatorGroups.find(
          (group) => group.id === joined.groupId
        );

        if (!fullGroup) return null;

        return {
          id: fullGroup.id,
          title: fullGroup.title,
          subject: fullGroup.subject,
          image: fullGroup.image,
          type: fullGroup.type,
          meeting: fullGroup.meeting || fullGroup.time,
          members: fullGroup.members,
        };
      })
      .filter(Boolean);
  }, [creatorGroups, joinedGroups, currentUser.email]);

  // طلبات الطالب
  const myRequests = useMemo(() => {
    return joinRequests.filter((req) => req.userEmail === currentUser.email);
  }, [joinRequests, currentUser.email]);

  // الإشعارات الحقيقية من ملف notifications
  const notifications = useMemo(() => {
    return getNotifications().filter(
      (notification) => notification.userEmail === currentUser.email
    );
  }, [currentUser.email, activeSection]);

  // لون البادج حسب الحالة
  const getStatusBadge = (status) => {
    if (status === "Approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  // أيقونة الإشعار حسب النوع
  const renderNotificationIcon = (type) => {
    if (type === "approved" || type === "joined") {
      return <FaCheckCircle className="text-green-600 mt-1" />;
    }

    if (type === "join-request" || type === "left-self") {
      return <FaHourglassHalf className="text-amber-500 mt-1" />;
    }

    return <FaBell className="text-red-500 mt-1" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 bg-[#0F2747] text-white rounded-3xl p-5 shadow-lg">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaBookOpen className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">StudyGroup</h1>
          </Link>

          <nav className="space-y-3">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "dashboard"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaThLarge />
              Dashboard
            </button>

            <button
              onClick={() => setActiveSection("myGroups")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "myGroups"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaUsers />
              My Groups
            </button>

            <button
              onClick={() => setActiveSection("requests")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "requests"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaClock />
              Requests
            </button>

            <button
              onClick={() => setActiveSection("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "notifications"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaBell />
              Notifications
            </button>

            <button
              onClick={() => setActiveSection("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "profile"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaUser />
              Profile
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3 bg-white rounded-3xl shadow-lg border p-5 md:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome:{" "}
              <span className="text-amber-500">{currentUser.fullName}</span>
            </h2>
          </div>

          {/* Dashboard */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* My Groups Preview */}
              <section className="rounded-3xl border bg-slate-50 p-5">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  My Groups
                </h3>

                {myGroups.length === 0 ? (
                  <p className="text-slate-500">
                    You have not joined any groups yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {myGroups.slice(0, 3).map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white border"
                      >
                        <img
                          src={group.image}
                          alt={group.title}
                          className="w-12 h-12 rounded-xl object-cover"
                        />

                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            {group.title}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {group.subject}
                          </p>
                        </div>

                        <Link
                          to={`/groups/${group.id}`}
                          className="text-blue-600 font-medium hover:text-blue-700"
                        >
                          Open
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Requests Preview */}
              <section className="rounded-3xl border bg-slate-50 p-5">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Pending Requests
                </h3>

                {myRequests.length === 0 ? (
                  <p className="text-slate-500">No requests yet.</p>
                ) : (
                  <div className="space-y-4">
                    {myRequests.slice(0, 3).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white border"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {request.groupTitle}
                          </h4>
                          <p className="text-sm text-slate-500">
                            Request status
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Notifications Preview */}
              <section className="rounded-3xl border bg-slate-50 p-5">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Notifications
                </h3>

                {notifications.length === 0 ? (
                  <p className="text-slate-500">No notifications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-2xl bg-white border"
                      >
                        <p className="font-semibold text-slate-900">
                          {note.title}
                        </p>
                        <p className="text-slate-700 mt-1">{note.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* My Groups */}
          {activeSection === "myGroups" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                My Groups
              </h3>

              {myGroups.length === 0 ? (
                <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                  You have not joined any groups yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {myGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-2xl border bg-slate-50 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={group.image}
                          alt={group.title}
                          className="w-14 h-14 rounded-xl object-cover"
                        />

                        <div>
                          <h4 className="text-xl font-bold text-slate-900">
                            {group.title}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {group.subject}
                          </p>
                          <p className="text-sm text-slate-500">
                            {group.meeting}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/groups/${group.id}`}
                        className="px-5 py-2 rounded-xl bg-white border text-slate-700 font-medium hover:border-blue-400 hover:text-blue-600 transition"
                      >
                        Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Requests */}
          {activeSection === "requests" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                My Requests
              </h3>

              {myRequests.length === 0 ? (
                <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                  You have not sent any requests yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-2xl border bg-slate-50 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {request.groupTitle}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Request status for this group
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Notifications
              </h3>

              {notifications.length === 0 ? (
                <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                  No notifications available.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl border bg-slate-50 flex items-start gap-3"
                    >
                      {renderNotificationIcon(note.type)}

                      <div>
                        <p className="font-semibold text-slate-900">
                          {note.title}
                        </p>
                        <p className="text-slate-700 mt-1">{note.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Profile */}
          {activeSection === "profile" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Profile
              </h3>

              <div className="rounded-3xl border bg-slate-50 p-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {currentUser.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {currentUser.email || "No email found"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Role</p>
                  <p className="text-lg font-semibold text-slate-900">
                    Student
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}