import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import StudentDashboard from "../pages/StudentDashboard";
import CreatorDashboard from "../pages/CreatorDashboard";
import BrowseGroupsPage from "../pages/BrowseGroupsPage";
import GroupDetailsPage from "../pages/GroupDetailsPage";
import CreateGroupPage from "../pages/CreateGroupPage";
import AdminDashboard from "../pages/AdminDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/creator/dashboard" element={<CreatorDashboard />} />
      <Route path="/creator/create-group" element={<CreateGroupPage />} />
      <Route path="/groups" element={<BrowseGroupsPage />} />
      <Route path="/groups/:id" element={<GroupDetailsPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}