import { useAuth } from "../utils/idb.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  CircleUserRound,
  CheckCircle,
  Folder,
  Bell,
  User,
  Flag,
  MoreHorizontal,
  Search,
  Users,
  LayoutDashboard,
  MessagesSquare,
  Group,
} from "lucide-react";
import logo from "../assets/rc.png";
import { AnimatePresence } from "framer-motion";
import AddGroup from "../pages/groups/AddGroup.jsx";
import { useSelectedUser } from "../utils/SelectedUserContext.jsx";
import { ScaleLoader } from "react-spinners";
import ReminderPopup from "../pages/chat/ReminderPopup.jsx";

import { getSocket, connectSocket } from "../utils/Socket.jsx";
import Requests from "../pages/requests/Requests.jsx";
import ManageGroups from "../pages/groups/ManageGroups.jsx";
import ManageUsers from "../pages/users/ManageUsers.jsx";
import Profile from "../pages/user/Profile.jsx";

import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase-config.js";
import { onMessage } from "firebase/messaging";
import toast from "react-hot-toast";

import "./toast.css";
import TotalSearch from "../pages/chat/TotalSearch.jsx";
import ConfirmationModal from "./ConfirmationModal.jsx";
export default function Header() {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const { selectedMessage, setSelectedMessage } = useSelectedUser();
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [createNewSpace, setCreateNewSpace] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { searchOpen, setSearchOpen } = useSelectedUser();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const toastRef = useRef(null);
  const requestPermission = async () => {
    try {
      // Check if notification permission is already granted
      const permission = Notification.permission;

      if (permission === "granted") {
        console.log("Notification permission already granted.");

        // Register the service worker with the correct scope
        if ("serviceWorker" in navigator) {
          // Register the service worker manually with the correct path
          const registration = await navigator.serviceWorker.register(
            "/ccp/firebase-messaging-sw.js"
          );
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );

          // Now, get the token with the custom service worker registration
          const currentToken = await getToken(messaging, {
            vapidKey:
              "BFEh52B2gdCHFyKNo71vgG3Vg5crEdg2H4b2FLLjiAizybXHlwy73MQTUI0FVA9h1PH3Oy9dtc1wSJ6FVmj7MUE", // Your VAPID key here
            serviceWorkerRegistration: registration, // Pass the custom service worker registration
          });

          if (currentToken && user && user.id) {
            console.log("FCM Token:", currentToken);
            const requestData = {
              user_id: user.id,
              token: currentToken,
            };

            const response = await fetch(
              "https://webexback.onrender.com/api/saveFcmToken",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
              }
            );

            if (response.ok) {
              const result = await response.json();
              console.log("FCM token successfully saved:", result);
            } else {
              console.error(
                "Failed to save FCM token:",
                response.status,
                response.statusText
              );
            }
          } else {
            console.log("No registration token available.");
          }
        } else {
          console.error("Service Workers are not supported in this browser.");
        }
      } else if (permission === "default") {
        // Request permission if not already granted
        const permissionRequest = await Notification.requestPermission();
        if (permissionRequest === "granted") {
          console.log("Notification permission granted.");
          setPermissionGranted(true);
          requestPermission(); // Re-run the permission request logic after granting
        } else {
          console.log("Notification permission denied.");
        }
      } else {
        console.log("Notification permission denied.");
      }
    } catch (error) {
      console.error("Error getting notification permission or token:", error);
    }
  };

  const selectedUserRef = useRef(selectedUser);

  // Keep ref updated on selectedUser changes
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    requestPermission();

    onMessage(messaging, (payload) => {
      console.log("Message received: ", payload.data);

      const currentSelectedUser = selectedUserRef.current;

      if (
        payload.data.user_type == "group" &&
        payload.data.receiver_id != currentSelectedUser?.id
      ) {
        console.log(selectedUser, "testt");
        const data = payload.data || {};
        const senderName = data.sender_name || "Unknown";
        const profilePic = data.profile_pic || null;
        const rawMessage = data.message || "";

        const trimmedMessage = rawMessage.split(" ").slice(0, 7).join(" ");
        const initial = senderName.charAt(0).toUpperCase();

        toast.custom((t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id),
                setSelectedUser({
                  id: data.receiver_id,
                  name: data.sender_name,
                  profile_pic: null,
                  type: "group",
                });
            }}
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } cursor-pointer max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                      {initial}
                    </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {senderName}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{trimmedMessage}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ));
      } else if (payload.data.sender_id != currentSelectedUser?.id) {
        console.log(selectedUser, "testt");
        const data = payload.data || {};
        const senderName = data.sender_name || "Unknown";
        const profilePic = data.profile_pic || null;
        const rawMessage = data.message || "";

        const trimmedMessage = rawMessage.split(" ").slice(0, 7).join(" ");
        const initial = senderName.charAt(0).toUpperCase();

        toast.custom((t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id),
                setSelectedUser({
                  id: data.sender_id,
                  name: data.sender_name,
                  profile_pic: data.profile_pic ?? null,
                  type: "user",
                });
            }}
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } cursor-pointer max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  {profilePic ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={profilePic}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                      {initial}
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {senderName}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{trimmedMessage}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ));
      }
    });
  }, []);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    const handleUserUpdated = (updatedUser) => {
      console.log("user" , updatedUser);
      if (updatedUser?.id == user?.id) {
        console.log("two");
        login(updatedUser);
      }
    };

    socket.on("user_updated", handleUserUpdated);

    return () => {
      socket.off("user_updated", handleUserUpdated);
    };
  }, [user?.id]);

  return (
    <header
      className={`bg-white text-[#092e46] shadow-md ${
        messageLoading ? "cursor-wait pointer-events-none cur-wait" : ""
      }`}
    >
      <div className=" mx-auto flex flex-col items-center justify-between px-2 py-4 h-full bg-gradient-to-b from-orange-50">
        {user ? (
          <div className="flex flex-col justify-between items-center gap-4 text-sm h-full">
            <div className="flex flex-col items-center gap-4 text-sm">
              <button
                onClick={() => setProfileOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Profile"
                className="flex items-center p-1 f-13 rounded-full hover:bg-orange-200 text-black transition"
              >
                
                  {user?.profile_pic ? (
                    <img
                      src={"https://rapidcollaborate.in/ccp" + user.profile_pic}
                      alt="Profile"
                      className="w-8 h-8 rounded-full mx-auto object-cover border"
                    />
                  ) : (
                    user.name[0]
                  )}
              </button>

              <button
                onClick={() => {
                      setSearchOpen(true);
                    }}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Search Globally"
                className="flex items-center p-2 f-13 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition"
              >
                <Search
                    
                    size={17}
                    className=""
                  />
                {/* Chat */}
              </button>
              <button
                onClick={() => navigate("/chat")}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Chat Board"
                className="flex items-center p-2 f-13 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition"
              >
                <MessagesSquare size={17} className="" />
                {/* Chat */}
              </button>

              {(user.user_type == "admin" || (user.user_type == "subadmin" && user.access_requests == 1)) && (
                <button
                  onClick={() => setRequestsOpen(true)}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Admin Requests"
                  className="flex items-center p-2 f-13 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition"
                >
                  <LayoutDashboard size={17} className="" />
                  {/* Requests */}
                </button>
              )}
              {user.user_type == "admin" ? (
                <button
                  onClick={() => setGroupsOpen(true)}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Manage groups"
                  className="flex items-center p-2 f-13 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition"
                >
                  <Group size={17} className="" />
                  {/* Groups */}
                </button>
              ) : (
                <button
                  onClick={() => setCreateNewSpace(true)}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Create New Space"
                  className="flex items-center p-2 f-13 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition"
                >
                  <Group size={17} className="" />
                  {/* New Space */}
                </button>
              )}
              {(user.user_type == "admin" || user.user_type == "subadmin" && user.view_users == 1) && (
                <button
                  onClick={() => setUsersOpen(true)}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Manage Users"
                  className="flex items-center p-2 f-13 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition"
                >
                  <Users size={17} className="" />
                  {/* Manage Users */}
                </button>
              )}
            </div>
            <div className="flex items-center flex-col" ref={dropdownRef}>
              <button
                // onClick={logout}
                onClick={() => setLogoutOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Logout"
                className="flex hover:bg-red-500 hover:text-white items-center p-3 rounded-full text-gray-500  transition"
              >
                <LogOut size={17} className="" />
              </button>
            </div>
          </div>
        ) : (
          navigate("/login")
        )}
      </div>

      <AnimatePresence>

        {logoutOpen && (
          <ConfirmationModal
          title="Are you Sure want to logout?"
          message="You will be logged Out"
          onYes={logout}
          onClose={()=>{setLogoutOpen(false)}}
          />
        )

        }
        {createNewSpace && (
          <AddGroup
            onClose={() => {
              setCreateNewSpace(false);
            }}
          />
        )}
        {requestsOpen && (
          <Requests
            onClose={() => {
              setRequestsOpen(false);
            }}
          />
        )}
        {groupsOpen && (
          <ManageGroups
            onClose={() => {
              setGroupsOpen(false);
            }}
          />
        )}
        {usersOpen && (
          <ManageUsers
            onClose={() => {
              setUsersOpen(false);
            }}
          />
        )}
        {profileOpen && (
          <Profile
            onClose={() => {
              setProfileOpen(false);
            }}
          />
        )}
        {searchOpen && (
          <TotalSearch
            onClose={() => {
              setSearchOpen(false);
            }}
            searchResults={[]}
          />
        )}
        <ReminderPopup />
      </AnimatePresence>
    </header>
  );
}
