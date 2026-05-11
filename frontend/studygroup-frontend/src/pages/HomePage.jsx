import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import GroupCard from "../components/home/GroupCard";
import HeroImage from "../assets/images/Hero.png";

export default function HomePage() {
  const navigate = useNavigate();

  // بيانات المستخدم الحالي
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;

  // جلب كل الجروبات من localStorage
  const creatorGroups = JSON.parse(localStorage.getItem("creatorGroups")) || [];

  // state للبحث والفلاتر
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedType, setSelectedType] = useState("All Types");

  // توحيد شكل الجروبات
  const allGroups = useMemo(() => {
    return creatorGroups.map((group) => ({
      id: group.id,
      title: group.title,
      subject: group.subject || "General",
      time: group.meeting || group.time || "Not specified",
      members: group.members || `0/${group.maxMembers || 0}`,
      status: group.type || "Online",
      image:
        group.image ||
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600",
      creatorName: group.creatorName || "Creator",
    }));
  }, [creatorGroups]);

  // المواد المتاحة في الفلاتر
  const availableSubjects = useMemo(() => {
    return [...new Set(allGroups.map((group) => group.subject))];
  }, [allGroups]);

  // فلترة الجروبات
  const filteredGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesSearch =
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.creatorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject =
        selectedSubject === "All Subjects" ||
        group.subject === selectedSubject;

      const matchesType =
        selectedType === "All Types" || group.status === selectedType;

      return matchesSearch && matchesSubject && matchesType;
    });
  }, [allGroups, searchTerm, selectedSubject, selectedType]);

  // عرض أول 3 جروبات في الهوم
  const popularGroups = filteredGroups.slice(0, 3);

  const handleBrowseGroups = () => {
    navigate("/groups");
  };

  const handleCreateGroup = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role === "creator") {
      navigate("/creator/create-group");
      return;
    }

    alert("Only creators can create groups.");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedSubject("All Subjects");
    setSelectedType("All Types");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-10 items-center bg-white rounded-3xl shadow-sm border p-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
              Learn Together, <br />
              <span className="text-blue-600">Grow Together</span>
            </h2>

            <p className="mt-5 text-slate-600 text-lg">
              Create or join study groups easily for collaborative learning.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={handleBrowseGroups}
                className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Browse Groups
              </button>

              <button
                onClick={handleCreateGroup}
                className="px-6 py-3 rounded-2xl border border-slate-300 font-semibold hover:bg-slate-100 transition"
              >
                Create Group
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="bg-slate-100 rounded-3xl h-80 flex items-center justify-center text-slate-400 text-lg overflow-hidden">
            <img
              src={HeroImage}
              alt="Hero"
              className="h-full w-full object-cover rounded-3xl"
            />
          </div>
        </section>

        {/* Profile / Welcome Section */}
        <section className="mt-8 bg-white rounded-2xl shadow-sm border p-5">
          {currentUser ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Welcome back,{" "}
                  <span className="text-blue-600">{currentUser.fullName}</span>
                </h3>
                <p className="text-slate-500 mt-1">
                  Role:{" "}
                  <span className="font-medium capitalize">
                    {currentUser.role || "student"}
                  </span>
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {currentUser.email}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {currentUser.role === "creator" ? (
                  <button
                    onClick={() => navigate("/creator/dashboard")}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/student/dashboard")}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Welcome to StudyGroup
                </h3>
                <p className="text-slate-500 mt-1">
                  Login or sign up to join and manage study groups.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold hover:bg-slate-100 transition"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Search Section */}
        <section className="mt-8 bg-white rounded-2xl shadow-sm border p-5">
          <input
            type="text"
            placeholder="Search by group name, subject, creator, or time..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Subjects</option>
              {availableSubjects.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Types</option>
              <option>Online</option>
              <option>Offline</option>
            </select>

            <button
              onClick={handleClearFilters}
              className="px-4 py-3 rounded-xl bg-slate-100 text-sm font-medium hover:bg-slate-200 transition"
            >
              Clear Filters
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {filteredGroups.length} group
            {filteredGroups.length !== 1 ? "s" : ""} found
          </p>
        </section>

        {/* Popular Groups Section */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-2xl font-bold">Popular Groups</h3>

            <button
              onClick={() => navigate("/groups")}
              className="text-blue-600 font-medium hover:text-blue-700 transition"
            >
              View All
            </button>
          </div>

          {allGroups.length === 0 ? (
            <div className="bg-white rounded-3xl border shadow-sm p-10 text-center">
              <h4 className="text-2xl font-bold text-slate-900">
                No groups created yet
              </h4>
              <p className="text-slate-500 mt-2">
                Start by creating the first study group.
              </p>

              <button
                onClick={handleCreateGroup}
                className="mt-5 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Create Group
              </button>
            </div>
          ) : popularGroups.length === 0 ? (
            <div className="bg-white rounded-3xl border shadow-sm p-10 text-center">
              <h4 className="text-2xl font-bold text-slate-900">
                No matching groups
              </h4>
              <p className="text-slate-500 mt-2">
                Try changing the search or filters.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {popularGroups.map((group) => (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <GroupCard
                    title={group.title}
                    time={group.time}
                    members={`${group.members} Members`}
                    status={group.status}
                    image={group.image}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}