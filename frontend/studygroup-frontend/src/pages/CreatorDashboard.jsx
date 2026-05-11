import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaClipboardList,
  FaFolderOpen,
  FaComments,
  FaPlus,
  FaArrowLeft,
  FaBell,
  FaCheckCircle,
  FaSignOutAlt,
  FaTrash,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { addNotification, getNotifications } from "../utils/notifications";

export default function CreatorDashboard() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || {
    fullName: "Creator",
    role: "creator",
    email: "",
  };

  const [creatorGroups, setCreatorGroups] = useState(() => {
    return (JSON.parse(localStorage.getItem("creatorGroups")) || []).filter(
      (group) => group.creatorEmail === currentUser.email
    );
  });

  const myGroups = creatorGroups;

  const getRequestsFromStorage = () => {
    const savedRequests = localStorage.getItem("joinRequests");
    return savedRequests ? JSON.parse(savedRequests) : [];
  };

  const [requests, setRequests] = useState(getRequestsFromStorage());
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [groupMessages, setGroupMessages] = useState(() => {
    return myGroups.reduce((acc, group) => {
      acc[group.id] = group.messages || [];
      return acc;
    }, {});
  });

  const [newMessages, setNewMessages] = useState({});

  const updateRequests = (updatedRequests) => {
    setRequests(updatedRequests);
    localStorage.setItem("joinRequests", JSON.stringify(updatedRequests));
  };

  const getJoinedGroups = () => {
    const savedJoinedGroups = localStorage.getItem("joinedGroups");
    return savedJoinedGroups ? JSON.parse(savedJoinedGroups) : [];
  };

  const updateJoinedGroups = (updatedJoinedGroups) => {
    localStorage.setItem("joinedGroups", JSON.stringify(updatedJoinedGroups));
  };

  const updateCreatorGroups = (updatedGroupsForCreator) => {
    const allGroups = JSON.parse(localStorage.getItem("creatorGroups")) || [];

    const mergedGroups = allGroups.map((group) => {
      const updatedGroup = updatedGroupsForCreator.find((g) => g.id === group.id);
      return updatedGroup ? updatedGroup : group;
    });

    localStorage.setItem("creatorGroups", JSON.stringify(mergedGroups));

    setCreatorGroups(
      mergedGroups.filter((group) => group.creatorEmail === currentUser.email)
    );
  };

  const addMemberToGroup = (groupId, userName) => {
    const updatedGroups = myGroups.map((group) => {
      if (group.id !== groupId) return group;

      const currentMemberList = group.memberList || [];
      const alreadyExists = currentMemberList.includes(userName);

      const [currentCountString, maxCountString] = String(
        group.members || "0/0"
      ).split("/");

      const currentCount = Number(currentCountString) || 0;
      const maxCount = Number(maxCountString) || Number(group.maxMembers) || 0;

      const newCount = alreadyExists ? currentCount : currentCount + 1;

      return {
        ...group,
        members: `${newCount}/${maxCount}`,
        memberList: alreadyExists
          ? currentMemberList
          : [...currentMemberList, userName],
      };
    });

    updateCreatorGroups(updatedGroups);

    if (selectedGroup && selectedGroup.id === groupId) {
      const updatedSelectedGroup = updatedGroups.find((g) => g.id === groupId);
      if (updatedSelectedGroup) {
        setSelectedGroup(updatedSelectedGroup);
      }
    }
  };

  const creatorGroupIds = myGroups.map((group) => group.id);
  const creatorRequests = requests.filter((req) =>
    creatorGroupIds.includes(req.groupId)
  );

  const pendingRequests = creatorRequests.filter(
    (req) => req.status === "Pending"
  );
  const approvedRequests = creatorRequests.filter(
    (req) => req.status === "Approved"
  );
  const rejectedRequests = creatorRequests.filter(
    (req) => req.status === "Rejected"
  );

  const creatorNotifications = useMemo(() => {
    return getNotifications().filter(
      (notification) => notification.userEmail === currentUser.email
    );
  }, [currentUser.email, activeSection, requests, creatorGroups]);

  const handleApprove = (requestId) => {
    const selectedRequest = requests.find((req) => req.id === requestId);
    if (!selectedRequest) return;

    const updatedRequests = requests.map((req) =>
      req.id === requestId ? { ...req, status: "Approved" } : req
    );

    updateRequests(updatedRequests);

    const currentJoinedGroups = getJoinedGroups();

    const alreadyJoined = currentJoinedGroups.some(
      (item) =>
        item.groupId === selectedRequest.groupId &&
        item.userEmail === selectedRequest.userEmail
    );

    if (!alreadyJoined) {
      const newJoinedGroup = {
        groupId: selectedRequest.groupId,
        userEmail: selectedRequest.userEmail,
        title: selectedRequest.groupTitle,
      };

      const updatedJoinedGroups = [...currentJoinedGroups, newJoinedGroup];
      updateJoinedGroups(updatedJoinedGroups);

      addMemberToGroup(selectedRequest.groupId, selectedRequest.userName);
    }

    addNotification({
      type: "approved",
      title: "Request Approved",
      message: `Your request to join "${selectedRequest.groupTitle}" was approved.`,
      userEmail: selectedRequest.userEmail,
      groupId: selectedRequest.groupId,
      groupTitle: selectedRequest.groupTitle,
    });

    addNotification({
      type: "joined",
      title: "New Member Joined",
      message: `${selectedRequest.userName} joined "${selectedRequest.groupTitle}".`,
      userEmail: currentUser.email,
      groupId: selectedRequest.groupId,
      groupTitle: selectedRequest.groupTitle,
    });

    alert(`Approved request for ${selectedRequest.userName}`);
  };

  const handleReject = (requestId) => {
    const selectedRequest = requests.find((req) => req.id === requestId);
    if (!selectedRequest) return;

    const updatedRequests = requests.map((req) =>
      req.id === requestId ? { ...req, status: "Rejected" } : req
    );

    updateRequests(updatedRequests);

    addNotification({
      type: "rejected",
      title: "Request Rejected",
      message: `Your request to join "${selectedRequest.groupTitle}" was rejected.`,
      userEmail: selectedRequest.userEmail,
      groupId: selectedRequest.groupId,
      groupTitle: selectedRequest.groupTitle,
    });

    alert(`Rejected request for ${selectedRequest.userName}`);
  };

  const handleManageGroup = (group) => {
    setSelectedGroup(group);
    setActiveSection("manageGroup");
  };

  const handleDeleteGroup = (groupId, groupTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${groupTitle}"?`
    );

    if (!confirmDelete) return;

    const allGroups = JSON.parse(localStorage.getItem("creatorGroups")) || [];
    const updatedAllGroups = allGroups.filter((group) => group.id !== groupId);
    localStorage.setItem("creatorGroups", JSON.stringify(updatedAllGroups));

    const allRequests = JSON.parse(localStorage.getItem("joinRequests")) || [];
    const updatedRequests = allRequests.filter((req) => req.groupId !== groupId);
    localStorage.setItem("joinRequests", JSON.stringify(updatedRequests));
    setRequests(updatedRequests);

    const allJoinedGroups = JSON.parse(localStorage.getItem("joinedGroups")) || [];
    const updatedJoinedGroups = allJoinedGroups.filter(
      (item) => item.groupId !== groupId
    );
    localStorage.setItem("joinedGroups", JSON.stringify(updatedJoinedGroups));

    const allNotifications =
      JSON.parse(localStorage.getItem("notifications")) || [];
    const updatedNotifications = allNotifications.filter(
      (note) => note.groupId !== groupId
    );
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

    const updatedCreatorOnlyGroups = updatedAllGroups.filter(
      (group) => group.creatorEmail === currentUser.email
    );
    setCreatorGroups(updatedCreatorOnlyGroups);

    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(null);
      setActiveSection("myGroups");
    }

    setGroupMessages((prev) => {
      const updated = { ...prev };
      delete updated[groupId];
      return updated;
    });

    setNewMessages((prev) => {
      const updated = { ...prev };
      delete updated[groupId];
      return updated;
    });

    alert(`"${groupTitle}" deleted successfully.`);
  };

  const handleSendMessage = (groupId) => {
    const messageText = (newMessages[groupId] || "").trim();
    if (!messageText) return;

    const targetGroup = myGroups.find((group) => group.id === groupId);

    if (targetGroup?.status !== "approved") {
      alert("You can send messages only after admin approves this group.");
      return;
    }

    const message = {
      id: Date.now(),
      sender: currentUser.fullName || "Creator",
      text: messageText,
    };

    setGroupMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), message],
    }));

    setNewMessages((prev) => ({
      ...prev,
      [groupId]: "",
    }));

    const allGroups = JSON.parse(localStorage.getItem("creatorGroups")) || [];

    const updatedAllGroups = allGroups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          messages: [...(group.messages || []), message],
        };
      }
      return group;
    });

    localStorage.setItem("creatorGroups", JSON.stringify(updatedAllGroups));

    setCreatorGroups(
      updatedAllGroups.filter((group) => group.creatorEmail === currentUser.email)
    );
  };

  const renderNotificationIcon = (type) => {
    if (type === "join-request") {
      return <FaBell className="text-amber-500 mt-1" />;
    }

    if (type === "joined") {
      return <FaCheckCircle className="text-green-600 mt-1" />;
    }

    if (type === "left") {
      return <FaSignOutAlt className="text-red-500 mt-1" />;
    }

    return <FaBell className="text-blue-600 mt-1" />;
  };

  const getGroupStatusBadge = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  const getGroupStatusText = (status) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const getGroupStatusIcon = (status) => {
    if (status === "approved") return <FaCheckCircle />;
    if (status === "rejected") return <FaTimesCircle />;
    return <FaClock />;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
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
              <FaBookOpen />
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
              <FaClipboardList />
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
              <FaClipboardList />
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
              onClick={() => setActiveSection("materials")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "materials"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaFolderOpen />
              Materials
            </button>

            <button
              onClick={() => setActiveSection("messages")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === "messages"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <FaComments />
              Messages
            </button>
          </nav>
        </aside>

        <main className="lg:col-span-3 bg-white rounded-3xl shadow-lg border p-5 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome:{" "}
              <span className="text-slate-900">{currentUser.fullName}</span>{" "}
              <span className="text-blue-600">(Creator)</span>
            </h2>

            <button
              onClick={() => navigate("/creator/create-group")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:scale-[1.02] transition duration-300 shadow-sm hover:shadow-md"
            >
              <FaPlus />
              Create New Group
            </button>
          </div>

          {activeSection === "dashboard" && (
            <div className="space-y-10">
              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  My Groups
                </h3>

                {myGroups.length === 0 ? (
                  <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                    You have not created any groups yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myGroups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-2xl border bg-slate-50 transition duration-300 hover:bg-blue-50 hover:shadow-md"
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

                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  group.type === "Online"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {group.type}
                              </span>

                              <span className="text-slate-600 font-medium">
                                {group.members}
                              </span>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${getGroupStatusBadge(
                                  group.status
                                )}`}
                              >
                                {getGroupStatusIcon(group.status)}
                                {getGroupStatusText(group.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleManageGroup(group)}
                            className="px-5 py-2 rounded-xl bg-white border text-slate-700 font-medium hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition duration-300"
                          >
                            Manage
                          </button>

                          <button
                            onClick={() => handleDeleteGroup(group.id, group.title)}
                            className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 transition duration-300 flex items-center justify-center"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Join Requests
                </h3>

                {pendingRequests.length === 0 ? (
                  <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                    No pending requests right now.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border bg-slate-50 transition duration-300 hover:bg-blue-50 hover:shadow-md"
                      >
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {request.userName}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">
                            {request.userEmail}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Requested to join:{" "}
                            <span className="font-semibold">
                              {request.groupTitle}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="px-5 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 hover:scale-[1.03] transition duration-300"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 hover:scale-[1.03] transition duration-300"
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

          {activeSection === "myGroups" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                My Groups
              </h3>

              {myGroups.length === 0 ? (
                <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                  You have not created any groups yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {myGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-2xl border bg-slate-50 transition duration-300 hover:bg-blue-50 hover:shadow-md"
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

                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                group.type === "Online"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {group.type}
                            </span>

                            <span className="text-slate-600 font-medium">
                              {group.members}
                            </span>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${getGroupStatusBadge(
                                group.status
                              )}`}
                            >
                              {getGroupStatusIcon(group.status)}
                              {getGroupStatusText(group.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleManageGroup(group)}
                          className="px-5 py-2 rounded-xl bg-white border text-slate-700 font-medium hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition duration-300"
                        >
                          Manage
                        </button>

                        <button
                          onClick={() => handleDeleteGroup(group.id, group.title)}
                          className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 transition duration-300 flex items-center justify-center"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "requests" && (
            <section className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Pending Requests
                </h3>
                {pendingRequests.length === 0 ? (
                  <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                    No pending requests.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-2xl border bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {request.userName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {request.userEmail}
                          </p>
                          <p className="text-sm text-slate-600">
                            {request.groupTitle}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="px-5 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Approved Requests
                </h3>
                <div className="space-y-3">
                  {approvedRequests.length === 0 ? (
                    <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                      No approved requests yet.
                    </div>
                  ) : (
                    approvedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-2xl border bg-white flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold">{request.userName}</p>
                          <p className="text-sm text-slate-500">
                            {request.groupTitle}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Approved
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Rejected Requests
                </h3>
                <div className="space-y-3">
                  {rejectedRequests.length === 0 ? (
                    <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                      No rejected requests yet.
                    </div>
                  ) : (
                    rejectedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-2xl border bg-white flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold">{request.userName}</p>
                          <p className="text-sm text-slate-500">
                            {request.groupTitle}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Rejected
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {activeSection === "notifications" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Notifications
              </h3>

              {creatorNotifications.length === 0 ? (
                <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                  No notifications available.
                </div>
              ) : (
                <div className="space-y-4">
                  {creatorNotifications.map((note) => (
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

          {activeSection === "materials" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Materials
              </h3>

              {myGroups.length === 0 ? (
                <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                  No groups available.
                </div>
              ) : (
                <div className="space-y-6">
                  {myGroups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-2xl border p-5 bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h4 className="text-xl font-bold text-slate-900">
                          {group.title}
                        </h4>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getGroupStatusBadge(
                            group.status
                          )}`}
                        >
                          {getGroupStatusText(group.status)}
                        </span>
                      </div>

                      {group.status !== "approved" ? (
                        <div className="text-slate-500">
                          Materials will be available after admin approves this
                          group.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(group.materials || []).length === 0 ? (
                            <div className="text-slate-500">
                              No materials uploaded yet.
                            </div>
                          ) : (
                            group.materials.map((material) => (
                              <div
                                key={material.id}
                                className="p-3 rounded-xl bg-white border flex items-center justify-between"
                              >
                                <span className="text-slate-700">
                                  {material.name}
                                </span>

                                <a
                                  href={material.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 font-medium hover:text-blue-700"
                                >
                                  Open
                                </a>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "messages" && (
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Group Messages
              </h3>

              {myGroups.length === 0 ? (
                <div className="p-6 rounded-2xl border bg-slate-50 text-slate-500">
                  No groups available.
                </div>
              ) : (
                <div className="space-y-6">
                  {myGroups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-2xl border p-5 bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h4 className="text-xl font-bold text-slate-900">
                          {group.title}
                        </h4>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getGroupStatusBadge(
                            group.status
                          )}`}
                        >
                          {getGroupStatusText(group.status)}
                        </span>
                      </div>

                      {group.status !== "approved" ? (
                        <div className="text-slate-500">
                          Messages will be enabled after admin approves this
                          group.
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            {(groupMessages[group.id] || []).length === 0 ? (
                              <div className="text-slate-500">
                                No messages yet.
                              </div>
                            ) : (
                              (groupMessages[group.id] || []).map((msg) => (
                                <div
                                  key={msg.id}
                                  className="p-3 rounded-xl bg-white border"
                                >
                                  <p className="font-semibold text-slate-800">
                                    {msg.sender}
                                  </p>
                                  <p className="text-slate-600 mt-1">{msg.text}</p>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={newMessages[group.id] || ""}
                              onChange={(e) =>
                                setNewMessages((prev) => ({
                                  ...prev,
                                  [group.id]: e.target.value,
                                }))
                              }
                              placeholder={`Send message to ${group.title}`}
                              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <button
                              onClick={() => handleSendMessage(group.id)}
                              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                              Send
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "manageGroup" && selectedGroup && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveSection("myGroups")}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-blue-100 hover:text-blue-600 transition"
                >
                  <FaArrowLeft />
                </button>

                <h3 className="text-2xl font-bold text-slate-900">
                  Manage Group: {selectedGroup.title}
                </h3>
              </div>

              <div className="rounded-2xl border p-5 bg-slate-50">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedGroup.image}
                    alt={selectedGroup.title}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />

                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">
                      {selectedGroup.title}
                    </h4>
                    <p className="text-slate-600 mt-1">
                      Members: {selectedGroup.members}
                    </p>
                    <p className="text-slate-600">
                      Type: {selectedGroup.type}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getGroupStatusBadge(
                          selectedGroup.status
                        )}`}
                      >
                        {getGroupStatusText(selectedGroup.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedGroup.status !== "approved" && (
                <div className="p-4 rounded-2xl border bg-amber-50 text-amber-700">
                  {selectedGroup.status === "pending"
                    ? "This group is waiting for admin approval."
                    : "This group was rejected by admin. You can delete it and create a new one."}
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveSection("requests")}
                  className="p-5 rounded-2xl border bg-white hover:bg-blue-50 hover:border-blue-300 transition text-left"
                >
                  <h4 className="text-lg font-bold text-slate-900">Requests</h4>
                  <p className="text-slate-500 mt-1">
                    Manage join requests for this group.
                  </p>
                </button>

                <button
                  onClick={() => setActiveSection("materials")}
                  className="p-5 rounded-2xl border bg-white hover:bg-blue-50 hover:border-blue-300 transition text-left"
                >
                  <h4 className="text-lg font-bold text-slate-900">Materials</h4>
                  <p className="text-slate-500 mt-1">
                    View and manage study materials.
                  </p>
                </button>

                <button
                  onClick={() => setActiveSection("messages")}
                  className="p-5 rounded-2xl border bg-white hover:bg-blue-50 hover:border-blue-300 transition text-left"
                >
                  <h4 className="text-lg font-bold text-slate-900">Messages</h4>
                  <p className="text-slate-500 mt-1">
                    Check group conversations.
                  </p>
                </button>
              </div>

              <button
                onClick={() =>
                  handleDeleteGroup(selectedGroup.id, selectedGroup.title)
                }
                className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Delete Group
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}