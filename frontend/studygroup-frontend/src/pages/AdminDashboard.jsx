import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaUsers,
  FaLayerGroup,
  FaUserCheck,
  FaUserTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartBar,
} from "react-icons/fa";
import { addNotification } from "../utils/notifications";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // بيانات المستخدم الحالي
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || {
    fullName: "Admin",
    role: "admin",
    email: "",
  };

  // حماية الصفحة: لو مش أدمن يرجع للهوم
  useEffect(() => {
    if (currentUser.role !== "admin") {
      navigate("/");
    }
  }, [currentUser.role, navigate]);

  // جلب كل المستخدمين
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem("studygroupUsers")) || [];
  });

  // جلب كل الجروبات
  const [groups, setGroups] = useState(() => {
    return JSON.parse(localStorage.getItem("creatorGroups")) || [];
  });

  // القسم الحالي
  const [activeSection, setActiveSection] = useState("dashboard");

  // تحديث المستخدمين في state و localStorage
  const updateUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem("studygroupUsers", JSON.stringify(updatedUsers));
  };

  // تحديث الجروبات في state و localStorage
  const updateGroups = (updatedGroups) => {
    setGroups(updatedGroups);
    localStorage.setItem("creatorGroups", JSON.stringify(updatedGroups));
  };

  // مزامنة الصفحة لو حصل تعديل من صفحة تانية
  useEffect(() => {
    const syncData = () => {
      setUsers(JSON.parse(localStorage.getItem("studygroupUsers")) || []);
      setGroups(JSON.parse(localStorage.getItem("creatorGroups")) || []);
    };

    window.addEventListener("focus", syncData);
    window.addEventListener("storage", syncData);

    return () => {
      window.removeEventListener("focus", syncData);
      window.removeEventListener("storage", syncData);
    };
  }, []);

  // الكرياتورز فقط
  const creatorUsers = useMemo(() => {
    return users.filter((user) => user.role === "creator");
  }, [users]);

  // الطلاب فقط
  const studentUsers = useMemo(() => {
    return users.filter((user) => user.role === "student");
  }, [users]);

  // تقسيم الكرياتورز حسب الحالة
  const pendingCreators = useMemo(() => {
    return creatorUsers.filter((user) => user.status === "pending");
  }, [creatorUsers]);

  const approvedCreators = useMemo(() => {
    return creatorUsers.filter((user) => user.status === "approved");
  }, [creatorUsers]);

  const rejectedCreators = useMemo(() => {
    return creatorUsers.filter((user) => user.status === "rejected");
  }, [creatorUsers]);

  // توحيد حالة الجروبات القديمة لو status مش موجود
  const normalizedGroups = useMemo(() => {
    return groups.map((group) => ({
      ...group,
      status: group.status || "pending",
    }));
  }, [groups]);

  // تقسيم الجروبات حسب الحالة
  const pendingGroups = useMemo(() => {
    return normalizedGroups.filter((group) => group.status === "pending");
  }, [normalizedGroups]);

  const approvedGroups = useMemo(() => {
    return normalizedGroups.filter((group) => group.status === "approved");
  }, [normalizedGroups]);

  const rejectedGroups = useMemo(() => {
    return normalizedGroups.filter((group) => group.status === "rejected");
  }, [normalizedGroups]);

  // إحصائيات الداش بورد
  const dashboardStats = useMemo(() => {
    return {
      studentsCount: studentUsers.length,
      allCreatorsCount: creatorUsers.length,
      pendingCreatorsCount: pendingCreators.length,
      approvedCreatorsCount: approvedCreators.length,
      rejectedCreatorsCount: rejectedCreators.length,
      allGroupsCount: normalizedGroups.length,
      pendingGroupsCount: pendingGroups.length,
      approvedGroupsCount: approvedGroups.length,
      rejectedGroupsCount: rejectedGroups.length,
    };
  }, [
    studentUsers.length,
    creatorUsers.length,
    pendingCreators.length,
    approvedCreators.length,
    rejectedCreators.length,
    normalizedGroups.length,
    pendingGroups.length,
    approvedGroups.length,
    rejectedGroups.length,
  ]);

  // الموافقة على كرياتور
  const handleApproveCreator = (email) => {
    const targetCreator = users.find((user) => user.email === email);
    if (!targetCreator) return;

    const updatedUsers = users.map((user) =>
      user.email === email ? { ...user, status: "approved" } : user
    );

    updateUsers(updatedUsers);

    addNotification({
      type: "creator-approved",
      title: "Creator Account Approved",
      message: "Your creator account has been approved by admin.",
      userEmail: targetCreator.email,
    });

    alert("Creator approved successfully.");
  };

  // رفض كرياتور
  const handleRejectCreator = (email) => {
    const targetCreator = users.find((user) => user.email === email);
    if (!targetCreator) return;

    const updatedUsers = users.map((user) =>
      user.email === email ? { ...user, status: "rejected" } : user
    );

    updateUsers(updatedUsers);

    addNotification({
      type: "creator-rejected",
      title: "Creator Account Rejected",
      message: "Your creator account was rejected by admin.",
      userEmail: targetCreator.email,
    });

    alert("Creator rejected successfully.");
  };

  // الموافقة على جروب
  const handleApproveGroup = (groupId) => {
    const targetGroup = normalizedGroups.find((group) => group.id === groupId);
    if (!targetGroup) return;

    const updatedGroups = normalizedGroups.map((group) =>
      group.id === groupId ? { ...group, status: "approved" } : group
    );

    updateGroups(updatedGroups);

    addNotification({
      type: "group-approved",
      title: "Group Approved",
      message: `Your group "${targetGroup.title}" was approved by admin.`,
      userEmail: targetGroup.creatorEmail || "",
      groupId: targetGroup.id,
      groupTitle: targetGroup.title,
    });

    alert("Group approved successfully.");
  };

  // رفض جروب
  const handleRejectGroup = (groupId) => {
    const targetGroup = normalizedGroups.find((group) => group.id === groupId);
    if (!targetGroup) return;

    const updatedGroups = normalizedGroups.map((group) =>
      group.id === groupId ? { ...group, status: "rejected" } : group
    );

    updateGroups(updatedGroups);

    addNotification({
      type: "group-rejected",
      title: "Group Rejected",
      message: `Your group "${targetGroup.title}" was rejected by admin.`,
      userEmail: targetGroup.creatorEmail || "",
      groupId: targetGroup.id,
      groupTitle: targetGroup.title,
    });

    alert("Group rejected successfully.");
  };

  // كلاس البادج حسب الحالة
  const getStatusBadgeClass = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  // نص الحالة
  const getStatusText = (status) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
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
              <FaChartBar />
              Dashboard
            </button>

            <button
              onClick={() => setActiveSection("creators")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "creators"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaUsers />
              Creators
            </button>

            <button
              onClick={() => setActiveSection("groups")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "groups"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaLayerGroup />
              Groups
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3 bg-white rounded-3xl shadow-lg border p-5 md:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome:{" "}
              <span className="text-blue-600">{currentUser.fullName}</span>{" "}
              <span className="text-slate-500">(Admin)</span>
            </h2>
          </div>

          {/* Dashboard */}
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Students</p>
                  <h3 className="text-3xl font-bold text-blue-600 mt-2">
                    {dashboardStats.studentsCount}
                  </h3>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">All Creators</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2">
                    {dashboardStats.allCreatorsCount}
                  </h3>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Pending Creators</p>
                  <h3 className="text-3xl font-bold text-amber-500 mt-2">
                    {dashboardStats.pendingCreatorsCount}
                  </h3>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Approved Creators</p>
                  <h3 className="text-3xl font-bold text-green-600 mt-2">
                    {dashboardStats.approvedCreatorsCount}
                  </h3>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Rejected Creators</p>
                  <h3 className="text-3xl font-bold text-red-500 mt-2">
                    {dashboardStats.rejectedCreatorsCount}
                  </h3>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">All Groups</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2">
                    {dashboardStats.allGroupsCount}
                  </h3>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Pending Groups</p>
                  <h3 className="text-3xl font-bold text-amber-500 mt-2">
                    {dashboardStats.pendingGroupsCount}
                  </h3>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Approved Groups</p>
                  <h3 className="text-3xl font-bold text-green-600 mt-2">
                    {dashboardStats.approvedGroupsCount}
                  </h3>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Rejected Groups</p>
                  <h3 className="text-3xl font-bold text-red-500 mt-2">
                    {dashboardStats.rejectedGroupsCount}
                  </h3>
                </div>
              </div>

              {/* Pending Creator Requests */}
              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Pending Creator Requests
                </h3>

                {pendingCreators.length === 0 ? (
                  <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                    No pending creator requests.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCreators.map((creator) => (
                      <div
                        key={creator.email}
                        className="p-4 rounded-2xl border bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {creator.fullName}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {creator.email}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApproveCreator(creator.email)}
                            className="px-5 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleRejectCreator(creator.email)}
                            className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Pending Group Requests */}
              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Pending Group Requests
                </h3>

                {pendingGroups.length === 0 ? (
                  <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                    No pending groups.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingGroups.map((group) => (
                      <div
                        key={group.id}
                        className="p-4 rounded-2xl border bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={group.image}
                            alt={group.title}
                            className="w-14 h-14 rounded-xl object-cover"
                          />

                          <div>
                            <h4 className="font-bold text-slate-900">
                              {group.title}
                            </h4>
                            <p className="text-sm text-slate-500">
                              Creator: {group.creatorName}
                            </p>
                            <p className="text-sm text-slate-500">
                              Subject: {group.subject}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApproveGroup(group.id)}
                            className="px-5 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleRejectGroup(group.id)}
                            className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Creators */}
          {activeSection === "creators" && (
            <div className="space-y-8">
              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  All Creators
                </h3>

                {creatorUsers.length === 0 ? (
                  <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                    No creators found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creatorUsers.map((creator) => (
                      <div
                        key={creator.email}
                        className="p-4 rounded-2xl border bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {creator.fullName}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {creator.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                              creator.status
                            )}`}
                          >
                            {getStatusText(creator.status)}
                          </span>

                          {creator.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveCreator(creator.email)}
                                className="px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                              >
                                <FaUserCheck />
                              </button>

                              <button
                                onClick={() => handleRejectCreator(creator.email)}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                              >
                                <FaUserTimes />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Groups */}
          {activeSection === "groups" && (
            <div className="space-y-8">
              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  All Groups
                </h3>

                {normalizedGroups.length === 0 ? (
                  <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                    No groups found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {normalizedGroups.map((group) => (
                      <div
                        key={group.id}
                        className="p-4 rounded-2xl border bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={group.image}
                            alt={group.title}
                            className="w-14 h-14 rounded-xl object-cover"
                          />

                          <div>
                            <h4 className="font-bold text-slate-900">
                              {group.title}
                            </h4>
                            <p className="text-sm text-slate-500">
                              Creator: {group.creatorName}
                            </p>
                            <p className="text-sm text-slate-500">
                              Subject: {group.subject}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                              group.status
                            )}`}
                          >
                            {getStatusText(group.status)}
                          </span>

                          {group.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveGroup(group.id)}
                                className="px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                              >
                                <FaCheckCircle />
                              </button>

                              <button
                                onClick={() => handleRejectGroup(group.id)}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}

                          {group.status === "approved" && (
                            <span className="text-green-600">
                              <FaCheckCircle />
                            </span>
                          )}

                          {group.status === "rejected" && (
                            <span className="text-red-600">
                              <FaTimesCircle />
                            </span>
                          )}

                          {group.status === "pending" && (
                            <span className="text-amber-500">
                              <FaClock />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}