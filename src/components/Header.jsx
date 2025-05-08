import { useAuth } from "../utils/idb.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { LogOut, CircleUserRound, Bell, Users, LayoutDashboard, MessagesSquare, Group } from "lucide-react";
import logo from "../assets/rc.png";
import { AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  return (
    <header className="bg-white text-[#092e46] shadow-md">
      <div className=" mx-auto flex items-center justify-between px-4 py-2">
        <h1
          className="text-2xl font-bold flex items-center cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        >
          <span role="img" aria-label="plate">
            <img src={logo} className="w-25 h-14" />
          </span>{" "}
        </h1>

        {user ? (
          <div className="flex items-center space-x-4 text-sm">
            <button
                onClick={() => navigate("/chat")}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Chat Board"
                className="flex items-center px-3 py-2 rounded-md bg-gray-100 text-black  transition mr-3"
              >
                <MessagesSquare className="w-4 h-4 mr-2" />
                Chat
              </button>
              
            {user.user_type == "admin" && (
              <button
                onClick={() => navigate("/dashboard")}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Admin Dashboard"
                className="flex items-center px-3 py-2 rounded-md bg-gray-100 text-black  transition mr-3"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashbaord
              </button>
            )}
            {user.user_type == "admin" && (
              <button
                onClick={() => navigate("/manage-groups")}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Manage groups"
                className="flex items-center px-3 py-2 rounded-md bg-gray-100 text-black  transition mr-3"
              >
                <Group className="w-4 h-4 mr-2" />
                Groups
              </button>
            )}
            {user.user_type == "admin" && (
              <button
                onClick={() => navigate("/manage-users")}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Manage Users"
                className="flex items-center px-3 py-2 rounded-md bg-gray-100 text-black  transition mr-3"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </button>
            )}
            <div className="flex items-center" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content={user.email}
                className="flex items-center px-3 py-2 rounded-md bg-gray-100 text-black  transition mr-3"
              >
                <CircleUserRound className="w-4 h-4 mr-2" />
                Welcome, <span className="font-semibold ml-1">{user.name}</span>
              </button>
              <button
                onClick={logout}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Logout"
                className="flex hover:bg-red-500 hover:text-white items-center px-3 py-2 rounded-md bg-gray-100 text-black  transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          navigate("/login")
        )}
      </div>

      <AnimatePresence></AnimatePresence>
    </header>
  );
}
