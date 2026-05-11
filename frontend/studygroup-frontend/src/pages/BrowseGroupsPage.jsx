import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBookOpen, FaSearch, FaFilter } from "react-icons/fa";
import { addNotification } from "../utils/notifications";

export default function BrowseGroupsPage() {
  const navigate = useNavigate();

  // جلب الجروبات اللي الكرياتور أنشأها من localStorage
  const storedCreatorGroups =
    JSON.parse(localStorage.getItem("creatorGroups")) || [];

  // توحيد شكل الجروبات علشان يبقى مناسب للعرض في الصفحة
  const groups = storedCreatorGroups.map((group) => ({
    id: group.id,
    title: group.title,
    subject: group.subject,
    time: group.meeting || group.time || "Not specified",
    members: group.members || `0/${group.maxMembers || 0}`,
    type: group.type || "Online",
    image:
      group.image ||
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600",
    creatorEmail: group.creatorEmail || "",
  }));

  // state للبحث والفلاتر
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedType, setSelectedType] = useState("All Types");

  // state بسيط علشان نعمل refresh بعد أي تعديل على localStorage
  const [refreshKey, setRefreshKey] = useState(0);

  // فلترة الجروبات حسب البحث + المادة + النوع
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch =
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject =
        selectedSubject === "All Subjects" ||
        group.subject === selectedSubject;

      const matchesType =
        selectedType === "All Types" || group.type === selectedType;

      return matchesSearch && matchesSubject && matchesType;
    });
  }, [groups, searchTerm, selectedSubject, selectedType]);

  // مسح الفلاتر
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubject("All Subjects");
    setSelectedType("All Types");
  };

  // جلب بيانات المستخدم الحالي
  const getCurrentUser = () => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  };

  // جلب كل طلبات الانضمام
  const getJoinRequests = () => {
    const savedRequests = localStorage.getItem("joinRequests");
    return savedRequests ? JSON.parse(savedRequests) : [];
  };

  // جلب كل الجروبات المنضم لها المستخدمون
  const getJoinedGroups = () => {
    const savedJoinedGroups = localStorage.getItem("joinedGroups");
    return savedJoinedGroups ? JSON.parse(savedJoinedGroups) : [];
  };

  // هل المستخدم الحالي عضو بالفعل في الجروب؟
  const isJoined = (groupId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const joinedGroups = getJoinedGroups();

    return joinedGroups.some(
      (item) => item.groupId === groupId && item.userEmail === currentUser.email
    );
  };

  // هل المستخدم الحالي عنده طلب Pending؟
  const hasPendingRequest = (groupId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const joinRequests = getJoinRequests();

    return joinRequests.some(
      (req) =>
        req.groupId === groupId &&
        req.userEmail === currentUser.email &&
        req.status === "Pending"
    );
  };

  // إرسال طلب انضمام
  const handleJoinRequest = (group) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUser = getCurrentUser();

    // لو المستخدم مش عامل login
    if (!isLoggedIn || !currentUser) {
      alert("Please login first to join a group.");
      navigate("/login");
      return;
    }

    // لو منضم بالفعل
    if (isJoined(group.id)) {
      alert("You are already a member of this group.");
      return;
    }

    // لو عنده طلب pending بالفعل
    if (hasPendingRequest(group.id)) {
      alert("You already sent a join request.");
      return;
    }

    const currentRequests = getJoinRequests();

    const newRequest = {
      id: Date.now(),
      groupId: group.id,
      groupTitle: group.title,
      userEmail: currentUser.email,
      userName: currentUser.fullName || "Unknown User",
      status: "Pending",
    };

    const updatedRequests = [...currentRequests, newRequest];
    localStorage.setItem("joinRequests", JSON.stringify(updatedRequests));

    // إضافة نوتيفيكيشن للكرياتور
    addNotification({
      type: "join-request",
      title: "New Join Request",
      message: `${currentUser.fullName} sent a join request to "${group.title}"`,
      userEmail: group.creatorEmail || "",
      groupId: group.id,
      groupTitle: group.title,
    });

    // تحديث الواجهة
    setRefreshKey((prev) => prev + 1);

    alert(`Join request sent to "${group.title}" successfully!`);
  };

  // تحديد نص الزر
  const getJoinButtonText = (groupId) => {
    if (isJoined(groupId)) return "Joined";
    if (hasPendingRequest(groupId)) return "Requested";
    return "Join";
  };

  // تحديد شكل الزر
  const getJoinButtonClass = (groupId) => {
    if (isJoined(groupId)) {
      return "bg-slate-300 text-slate-600 cursor-not-allowed";
    }

    if (hasPendingRequest(groupId)) {
      return "bg-amber-400 text-white cursor-not-allowed";
    }

    return "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]";
  };

  return (
    <div className="min-h-screen bg-slate-50" key={refreshKey}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center transition duration-300 hover:scale-110 hover:bg-blue-200">
              <FaBookOpen className="text-blue-600 text-lg" />
            </div>

            <h1 className="text-2xl font-bold text-blue-600 transition duration-300 hover:text-blue-700">
              StudyGroup
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link to="/" className="transition duration-300 hover:text-blue-600">
              Home
            </Link>

            <Link to="/groups" className="text-blue-600">
              Browse
            </Link>

            <Link
              to="/login"
              className="transition duration-300 hover:text-blue-600"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900">
            Browse Study Groups
          </h2>
          <p className="text-slate-500 mt-2">
            Find the best study group based on subject, time, and learning style.
          </p>
        </div>

        {/* شريط البحث والفلاتر */}
        <div className="bg-white rounded-3xl border shadow-sm p-5 mb-8 transition duration-300 hover:shadow-md">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by group name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 hover:border-blue-400"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 hover:border-blue-400"
            >
              <option>All Subjects</option>
              {[...new Set(groups.map((group) => group.subject))].map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 hover:border-blue-400"
            >
              <option>All Types</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:scale-[1.03] transition duration-300 flex items-center gap-2 shadow-sm hover:shadow-md">
              <FaFilter />
              Filters Active
            </button>

            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-medium transition duration-300 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600"
            >
              Clear Filters
            </button>

            <span className="text-sm text-slate-500">
              {filteredGroups.length} group
              {filteredGroups.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* لو مفيش جروبات */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-3xl border shadow-sm p-10 text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              No groups available
            </h3>
            <p className="text-slate-500">
              No groups have been created yet.
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-3xl border shadow-sm p-10 text-center">
            <h3 className="text-2xl font-bold text-slate-800">
              No groups found
            </h3>
            <p className="text-slate-500 mt-2">
              Try changing the search text or filter options.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="group bg-white rounded-3xl border shadow-sm overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={group.image}
                    alt={group.title}
                    className="w-full h-48 object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <h3 className="text-xl font-bold text-slate-900 transition duration-300 group-hover:text-blue-600">
                      {group.title}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition duration-300 ${
                        group.type === "Online"
                          ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                          : "bg-orange-100 text-orange-700 group-hover:bg-orange-200"
                      }`}
                    >
                      {group.type}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mb-1">{group.subject}</p>
                  <p className="text-sm text-slate-500 mb-1">{group.time}</p>
                  <p className="text-sm text-slate-500 mb-4">{group.members}</p>

                  <div className="flex gap-3">
                    <Link
                      to={`/groups/${group.id}`}
                      className="flex-1 text-center py-2.5 rounded-xl border border-slate-300 font-medium transition duration-300 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm"
                    >
                      Details
                    </Link>

                    <button
                      onClick={() => handleJoinRequest(group)}
                      disabled={isJoined(group.id) || hasPendingRequest(group.id)}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition duration-300 ${getJoinButtonClass(
                        group.id
                      )}`}
                    >
                      {getJoinButtonText(group.id)}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}