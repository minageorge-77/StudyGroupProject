import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { addNotification } from "../utils/notifications";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  // بيانات الفورم
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    maxMembers: "",
    type: "Online",
    meeting: "",
    image: "",
  });

  // أخطاء التحقق
  const [errors, setErrors] = useState({});

  // تغيير القيم داخل الفورم
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // التحقق من المدخلات
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Group name is required";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.maxMembers.trim()) {
      newErrors.maxMembers = "Max members is required";
    } else if (Number(formData.maxMembers) <= 0) {
      newErrors.maxMembers = "Max members must be greater than 0";
    }

    if (!formData.meeting.trim()) {
      newErrors.meeting = "Meeting time is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // إنشاء الجروب وتخزينه في localStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // المستخدم الحالي
    const currentUser =
      JSON.parse(localStorage.getItem("loggedInUser")) || null;

    if (!currentUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    // الجروبات الحالية المخزنة
    const savedGroups = localStorage.getItem("creatorGroups");
    const currentGroups = savedGroups ? JSON.parse(savedGroups) : [];

    // إنشاء الجروب الجديد
    const newGroup = {
      id: Date.now(),
      title: formData.title,
      subject: formData.subject,
      description: formData.description,
      members: `0/${formData.maxMembers}`,
      maxMembers: formData.maxMembers,
      type: formData.type,
      meeting: formData.meeting,
      time: formData.meeting,
      status: "pending",
      image:
        formData.image.trim() ||
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600",
      creatorName: currentUser.fullName,
      creatorEmail: currentUser.email,
      materials: [],
      messages: [],
      memberList: [],
};
    // حفظ الجروب
    const updatedGroups = [...currentGroups, newGroup];
    localStorage.setItem("creatorGroups", JSON.stringify(updatedGroups));

    // إشعار للأدمن إن فيه جروب جديد محتاج مراجعة
    addNotification({
      type: "new-group",
      title: "New Group Pending Approval",
      message: `"${newGroup.title}" was created by ${currentUser.fullName} and is waiting for admin approval.`,
      userEmail: "admin",
      groupId: newGroup.id,
      groupTitle: newGroup.title,
    });

    alert("Group created successfully and is pending admin approval.");

    // الرجوع للداش بورد
    navigate("/creator/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          {/* زر الرجوع */}
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-blue-100 hover:text-blue-600 transition"
          >
            <FaArrowLeft />
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Create New Group
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* اسم الجروب */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Group Name
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter group name"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* المادة */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter subject"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          {/* الوصف */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter group description"
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* الحد الأقصى للأعضاء */}
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Max Members
              </label>
              <input
                type="number"
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleChange}
                placeholder="Enter max members"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.maxMembers && (
                <p className="text-red-500 text-sm mt-1">{errors.maxMembers}</p>
              )}
            </div>

            {/* نوع الاجتماع */}
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Meeting Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          {/* وقت الاجتماع */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Meeting Schedule
            </label>
            <input
              type="text"
              name="meeting"
              value={formData.meeting}
              onChange={handleChange}
              placeholder="Example: Mon & Wed - 7PM"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.meeting && (
              <p className="text-red-500 text-sm mt-1">{errors.meeting}</p>
            )}
          </div>

          {/* صورة الجروب */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Paste image URL or leave empty"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* زر الإنشاء */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:scale-[1.01] transition duration-300"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
}