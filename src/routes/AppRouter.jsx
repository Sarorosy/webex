import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
import UserLayout from "../layouts/UserLayout";
import Dashboard from "../pages/Dashboard";
import ScrollToTop from "../components/ScrollToTop";
import Users from '../pages/users/Users';
import ChatPage from '../pages/chat/ChatPage';
import ManageGroups from "../pages/groups/ManageGroups";

export default function AppRouter() {
  return (
    <Router >
      <ScrollToTop />
      <Routes>
        {/* Public Restaurant Routes (NO layout) */}
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/manage-users" element={<Users />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/manage-groups" element={<ManageGroups />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
