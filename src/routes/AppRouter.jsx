import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {SelectedUserProvider} from '../utils/SelectedUserContext';
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
import UserLayout from "../layouts/UserLayout";
import Dashboard from "../pages/Dashboard";
import ScrollToTop from "../components/ScrollToTop";
import Users from '../pages/users/Users';
import ChatPage from '../pages/chat/ChatPage';
import ManageGroups from "../pages/groups/ManageGroups";
import Requests from "../pages/requests/Requests";

export default function AppRouter() {
  return (
    <Router >
      <ScrollToTop />
      <SelectedUserProvider>
      <Routes>
        {/* Public Restaurant Routes (NO layout) */}
        <Route path="/login" index element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/manage-users" element={<Users />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:view_user_id/:view_user_name" element={<ChatPage />} />
            <Route path="/manage-groups" element={<ManageGroups />} />

            
            <Route path="/dashboard" element={<Requests />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      </SelectedUserProvider>
    </Router>
  );
}
