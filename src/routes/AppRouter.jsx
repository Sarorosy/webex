import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {SelectedUserProvider} from '../utils/SelectedUserContext';
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
import UserLayout from "../layouts/UserLayout";
import Dashboard from "../pages/Dashboard";
import ScrollToTop from "../components/ScrollToTop";
import ChatPage from '../pages/chat/ChatPage';
import ManageGroups from "../pages/groups/ManageGroups";
import Requests from "../pages/requests/Requests";
import Profile from "../pages/user/Profile";
import ForgotPassword from "../pages/ForgotPassword";
import ScreenSharing from "../components/ScreenSharing";

//basename="/ccp" 
export default function AppRouter() {
  return (
    <Router basename="/ccp" > 
      <ScrollToTop />
      <SelectedUserProvider>
      <Routes>
        {/* Public Restaurant Routes (NO layout) */}
        <Route path="/login" index element={<Login />} />
        <Route path="/forgot-password" index element={<ForgotPassword />} />

        <Route element={<PrivateRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:view_user_id/:view_user_name" element={<ChatPage />} />
            <Route path="/chat/go/:gouser/:gotype" element={<ChatPage />} />
            <Route path="/manage-groups" element={<ManageGroups />} />

            
            <Route path="/dashboard" element={<Requests />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      </SelectedUserProvider>
    </Router>
  );
}
