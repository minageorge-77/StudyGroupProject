import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaRegCommentDots,
  FaBookOpen,
  FaUsers,
  FaClock,
  FaDownload,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { addNotification } from "../utils/notifications";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // جلب كل الجروبات المضافة من صفحة CreateGroupPage
  const storedCreatorGroups =
    JSON.parse(localStorage.getItem("creatorGroups")) || [];

  // توحيد شكل الجروبات علشان يناسب صفحة التفاصيل
  const groups = storedCreatorGroups.map((group) => ({
    id: group.id,
    title: group.title,
    creator: group.creatorName || "Creator",
    creatorEmail: group.creatorEmail || "",
    members: group.members || `0/${group.maxMembers || 0}`,
    meeting: group.meeting || group.time || "Not specified",
    type: group.type || "Online",
    subject: group.subject || "General",
    description: group.description || "No description available.",
    image:
      group.image ||
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900",
    materials: group.materials || [],
    memberList: group.memberList || [],
  }));

  // تحديد الجروب حسب id من الرابط
  const group = groups.find((g) => g.id === Number(id));

  // التاب الحالي
  const [activeTab, setActiveTab] = useState("about");

  // الرسالة المكتوبة في الشات
  const [inputMessage, setInputMessage] = useState("");

  // الرسائل المعروضة في الشات
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "StudyBot",
      text: group
        ? `Hi! I can help you with info about ${group.title}.`
        : "Hi! I can help you with study group info.",
      type: "bot",
    },
  ]);

  // حالة الإرسال
  const [isSending, setIsSending] = useState(false);

  // لو الجروب غير موجود
  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border shadow-lg p-8 text-center max-w-xl w-full">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Group not found
          </h2>
          <p className="text-slate-500 mb-6">
            This group does not exist yet or may have been removed.
          </p>
          <Link
            to="/groups"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Back to Browse Groups
          </Link>
        </div>
      </div>
    );
  }

  // جلب المستخدم الحالي
  const getCurrentUser = () => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  };

  // جلب الطلبات
  const getJoinRequests = () => {
    const savedRequests = localStorage.getItem("joinRequests");
    return savedRequests ? JSON.parse(savedRequests) : [];
  };

  // جلب الجروبات المنضم لها المستخدمون
  const getJoinedGroups = () => {
    const savedJoinedGroups = localStorage.getItem("joinedGroups");
    return savedJoinedGroups ? JSON.parse(savedJoinedGroups) : [];
  };

  // هل المستخدم عضو في الجروب؟
  const isJoinedGroup = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const joinedGroups = getJoinedGroups();

    return joinedGroups.some(
      (item) => item.groupId === group.id && item.userEmail === currentUser.email
    );
  };

  // حالة الطلب الحالية
  const getCurrentRequestStatus = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const requests = getJoinRequests();

    const request = requests.find(
      (req) => req.groupId === group.id && req.userEmail === currentUser.email
    );

    return request ? request.status : null;
  };

  // إرسال طلب انضمام
  const handleJoinRequest = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUser = getCurrentUser();

    if (!isLoggedIn || !currentUser) {
      alert("Please login first to send a join request.");
      navigate("/login");
      return;
    }

    if (isJoinedGroup()) {
      alert("You are already a member of this group.");
      return;
    }

    const currentRequests = getJoinRequests();

    const alreadyRequested = currentRequests.some(
      (req) => req.groupId === group.id && req.userEmail === currentUser.email
    );

    if (alreadyRequested) {
      alert("You already sent a join request to this group.");
      return;
    }

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

    alert(`Join request sent to ${group.title}`);
  };

  // إلغاء الطلب
  const handleCancelJoinRequest = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    const currentRequests = getJoinRequests();

    const updatedRequests = currentRequests.filter(
      (req) => !(req.groupId === group.id && req.userEmail === currentUser.email)
    );

    localStorage.setItem("joinRequests", JSON.stringify(updatedRequests));
    alert("Join request cancelled successfully.");
  };

  // مغادرة الجروب
  const handleLeaveGroup = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    const currentJoinedGroups = getJoinedGroups();

    const updatedJoinedGroups = currentJoinedGroups.filter(
      (item) => !(item.groupId === group.id && item.userEmail === currentUser.email)
    );

    localStorage.setItem("joinedGroups", JSON.stringify(updatedJoinedGroups));

    // إشعار للكرياتور إن عضو خرج من الجروب
    addNotification({
      type: "left",
      title: "Member Left Group",
      message: `${currentUser.fullName} left "${group.title}".`,
      userEmail: group.creatorEmail || "",
      groupId: group.id,
      groupTitle: group.title,
    });

    // إشعار للطالب نفسه
    addNotification({
      type: "left-self",
      title: "You Left Group",
      message: `You left "${group.title}" successfully.`,
      userEmail: currentUser.email,
      groupId: group.id,
      groupTitle: group.title,
    });

    alert(`You left "${group.title}" successfully.`);
  };

  // عرض الزر المناسب حسب الحالة
  const renderRequestActionButton = () => {
    const requestStatus = getCurrentRequestStatus();

    if (isJoinedGroup()) {
      return (
        <button
          onClick={handleLeaveGroup}
          className="px-8 py-3 rounded-xl bg-red-500 text-white font-semibold transition duration-300 hover:bg-red-600 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
        >
          Leave Group
        </button>
      );
    }

    if (requestStatus === "Pending") {
      return (
        <button
          onClick={handleCancelJoinRequest}
          className="px-8 py-3 rounded-xl bg-amber-500 text-white font-semibold transition duration-300 hover:bg-amber-600 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
        >
          Cancel Request
        </button>
      );
    }

    return (
      <button
        onClick={handleJoinRequest}
        className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold transition duration-300 hover:bg-blue-700 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
      >
        Join Request
      </button>
    );
  };

  // رد احتياطي مؤقت للشات
  const getFallbackReply = (message) => {
    const lower = message.toLowerCase();

    if (lower.includes("meeting") || lower.includes("time")) {
      return `The meeting schedule is ${group.meeting}.`;
    }

    if (lower.includes("members")) {
      return `This group currently has ${group.members} members.`;
    }

    if (lower.includes("creator") || lower.includes("owner")) {
      return `This group was created by ${group.creator}.`;
    }

    if (lower.includes("subject")) {
      return `This group focuses on ${group.subject}.`;
    }

    if (lower.includes("materials")) {
      return `Available materials: ${
        group.materials.length
          ? group.materials.map((m) => m.name).join(", ")
          : "No materials uploaded yet"
      }.`;
    }

    return "The AI service is not connected yet. I can still answer basic group info for now.";
  };

  // الربط المستقبلي مع API
  const sendMessageToBot = async (messageText) => {
    const API_URL = "https://localhost:5001/api/chat/group-assistant";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: group.id,
          groupTitle: group.title,
          subject: group.subject,
          creator: group.creator,
          members: group.members,
          meeting: group.meeting,
          userMessage: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      return data.reply || "No reply received from AI.";
    } catch (error) {
      return getFallbackReply(messageText);
    }
  };

  // إرسال الرسالة
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessageText = inputMessage.trim();

    const userMessage = {
      id: Date.now(),
      sender: "You",
      text: userMessageText,
      type: "user-self",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsSending(true);

    const botReply = await sendMessageToBot(userMessageText);

    const botMessage = {
      id: Date.now() + 1,
      sender: "StudyBot",
      text: botReply,
      type: "bot",
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsSending(false);
  };

  // الإرسال بزر Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[32px] border shadow-lg p-5 md:p-8 transition duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 transition duration-300 hover:bg-blue-100 hover:text-blue-600 hover:scale-105"
            >
              <FaArrowLeft className="text-lg" />
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Group Details
            </h1>

            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition duration-300 hover:bg-blue-100 hover:text-blue-600">
              <FaRegCommentDots className="text-lg" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* كارت البيانات الأساسية */}
              <div className="bg-white border rounded-3xl p-5 md:p-6 transition duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={group.image}
                      alt={group.title}
                      className="w-full md:w-52 h-44 object-cover transition duration-500 hover:scale-110"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                          {group.title}
                        </h2>
                        <p className="text-slate-600 mt-2 text-lg">
                          Creator: {group.creator}
                        </p>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition duration-300 ${
                          group.type === "Online"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        }`}
                      >
                        {group.type}
                      </span>
                    </div>

                    <div className="mt-5 grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 transition duration-300 hover:bg-blue-50">
                        <FaUsers className="text-blue-600" />
                        <span className="text-slate-700 font-medium">
                          Members: {group.members}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 transition duration-300 hover:bg-blue-50">
                        <FaClock className="text-blue-600" />
                        <span className="text-slate-700 font-medium">
                          Meeting: {group.meeting}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* التابات */}
              <div className="flex flex-wrap items-center gap-6 border-b px-2">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`pb-3 text-sm md:text-base font-medium transition ${
                    activeTab === "about"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  About
                </button>

                <button
                  onClick={() => setActiveTab("members")}
                  className={`pb-3 text-sm md:text-base font-medium transition ${
                    activeTab === "members"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Members
                </button>

                <button
                  onClick={() => setActiveTab("materials")}
                  className={`pb-3 text-sm md:text-base font-medium transition ${
                    activeTab === "materials"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Materials
                </button>

                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`pb-3 text-sm md:text-base font-medium transition ${
                    activeTab === "discussion"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Discussion
                </button>
              </div>

              {/* About */}
              {activeTab === "about" && (
                <div className="bg-white border rounded-3xl p-5 md:p-6 transition duration-300 hover:shadow-md">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    About Group
                  </h3>

                  <p className="text-slate-700 leading-8 text-base md:text-lg">
                    {group.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {renderRequestActionButton()}
                  </div>
                </div>
              )}

              {/* Members */}
              {activeTab === "members" && (
                <div className="bg-white border rounded-3xl p-5 md:p-6 transition duration-300 hover:shadow-md">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    Members
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {(group.memberList || []).length === 0 ? (
                      <div className="text-slate-500">
                        No members listed yet.
                      </div>
                    ) : (
                      group.memberList.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 transition duration-300 hover:bg-blue-50 hover:-translate-y-1"
                        >
                          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaBookOpen className="text-blue-600" />
                          </div>

                          <p className="font-medium text-slate-800">{member}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Materials */}
              {activeTab === "materials" && (
                <div className="bg-white border rounded-3xl p-5 md:p-6 transition duration-300 hover:shadow-md">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    Materials
                  </h3>

                  <div className="space-y-3">
                    {group.materials.length === 0 ? (
                      <div className="text-slate-500">No materials uploaded yet.</div>
                    ) : (
                      group.materials.map((file) => (
                        <div
                          key={file.id}
                          className="p-4 rounded-2xl bg-slate-50 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition duration-300 hover:bg-blue-50 hover:border-blue-200"
                        >
                          <span className="text-slate-700 font-medium">
                            {file.name}
                          </span>

                          <div className="flex items-center gap-3">
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                            >
                              <FaExternalLinkAlt />
                              Open
                            </a>

                            <a
                              href={file.fileUrl}
                              download
                              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                            >
                              <FaDownload />
                              Download
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Discussion */}
              {activeTab === "discussion" && (
                <div className="bg-white border rounded-3xl p-5 md:p-6 transition duration-300 hover:shadow-md">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    Discussion
                  </h3>
                  <p className="text-slate-600">
                    This section can later be connected to realtime group chat.
                  </p>
                </div>
              )}
            </div>

            {/* الشات الجانبي */}
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-3xl p-5 md:p-6 h-full min-h-[650px] flex flex-col transition duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    StudyBot Chat
                  </h3>

                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    AI Ready
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1 mb-4 min-h-[420px]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user-self"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm transition duration-300 ${
                          message.type === "bot"
                            ? "bg-blue-50 text-slate-800 border border-blue-100 hover:bg-blue-100"
                            : message.type === "user-self"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1">
                          {message.sender}
                        </p>
                        <p className="text-sm leading-6">{message.text}</p>
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="max-w-[90%] rounded-2xl px-4 py-3 shadow-sm bg-blue-50 text-slate-800 border border-blue-100">
                        <p className="text-xs font-semibold mb-1">StudyBot</p>
                        <p className="text-sm leading-6">Typing...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-auto">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 hover:border-blue-400"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={isSending}
                    className={`w-12 h-12 rounded-xl text-white flex items-center justify-center transition duration-300 ${
                      isSending
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-md active:scale-[0.98]"
                    }`}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/groups"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
            >
              Back to Browse Groups
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}