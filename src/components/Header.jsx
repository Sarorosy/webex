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
  MoonIcon,
  Sun,
  X,
  Circle,
  CircleMinus,
} from "lucide-react";
import logo from "../assets/ccp-logo.png";
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
import notificationsound from "../assets/notification-sound.mp3";

export default function Header() {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user, login, logout, theme, updateTheme , updateAvailability} = useAuth();
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
              "http://localhost:5000/api/saveFcmToken",
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

  useEffect(() => {
    if (!user) return;

    connectSocket(user.id);
    const socket = getSocket();

    

    const handleAvailabilityUpdated = ({ userId, availability_status }) => {
      if(user?.id == userId ){
        updateAvailability(availability_status);
      }
    };

    socket.on("availability_updated", handleAvailabilityUpdated);

    return () => {
      socket.off("availability_updated", handleAvailabilityUpdated);
    };
  }, [user]);

  const selectedUserRef = useRef(selectedUser);

  // Keep ref updated on selectedUser changes
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);
  const audioRef = useRef(new Audio(notificationsound));
  useEffect(() => {
    requestPermission();

    onMessage(messaging, (payload) => {
      console.log("Message received: ", payload.data);

      const currentSelectedUser = selectedUserRef.current;

      if (
        payload.data.user_type == "group" &&
        payload.data.receiver_id != currentSelectedUser?.id
      ) {
        // try {
        //   audioRef.current.currentTime = 0;
        //   audioRef.current.play();
        // } catch (e) {
        //   console.warn("Notification sound playback failed:", e);
        // }
        const data = payload.data || {};
        const senderName = data.sender_name || "Unknown";
        const profilePic = data.profile_pic || null;
        const rawMessage = data.message || "";

        const maxLetters = 40;
        const cleanedMessage = rawMessage.replace(/<br\s*\/?>/gi, "");

        const trimmedMessage =
          cleanedMessage.length > maxLetters
            ? cleanedMessage.slice(0, maxLetters) + "..."
            : cleanedMessage;

        const initial = senderName.charAt(0).toUpperCase();

        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } cursor-pointer max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
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
              className="flex-1 w-0 p-4 cursor-pointer"
            >
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
            <div className=" border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X size={14} />
              </button>
              <button
                onClick={() => toast.dismiss()}
                className="text-xs text-red-500 hover:underline px-2 pb-2"
              >
                Clear All
              </button>
            </div>
          </div>
        ));
      } else if (payload.data.sender_id != currentSelectedUser?.id) {
        // try {
        //   audioRef.current.currentTime = 0;
        //   audioRef.current.play();
        // } catch (e) {
        //   console.warn("Notification sound playback failed:", e);
        // }

        const data = payload.data || {};
        const senderName = data.sender_name || "Unknown";
        const profilePic = data.profile_pic || null;
        const rawMessage = data.message || "";

        const maxLetters = 40;
        const cleanedMessage = rawMessage.replace(/<br\s*\/?>/gi, "");

        const trimmedMessage =
          cleanedMessage.length > maxLetters
            ? cleanedMessage.slice(0, maxLetters) + "..."
            : cleanedMessage;

        const initial = senderName.charAt(0).toUpperCase();

        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } cursor-pointer max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
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
              className="flex-1 w-0 p-4 cursor-pointer"
            >
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
            <div className=" border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X size={14} />
              </button>
              <button
                onClick={() => toast.dismiss()}
                className="text-xs text-red-500 hover:underline px-2 pb-2"
              >
                Clear All
              </button>
            </div>
          </div>
        ));
      }
    });
  }, []);

  useEffect(() => {
    connectSocket(user?.id);
    const socket = getSocket();

    const handleUserUpdated = (updatedUser) => {
      console.log("user", updatedUser);
      if (updatedUser?.id == user?.id) {
        login(updatedUser);
      }
    };

    socket.on("user_updated", handleUserUpdated);

    return () => {
      socket.off("user_updated", handleUserUpdated);
    };
  }, [user?.id]);

  const [onlineUserIds, setOnlineUserIds] = useState([]);
  useEffect(() => {
    connectSocket(user?.id);
    const socket = getSocket();

    const handleOnlineUsers = (userIds) => {
      setOnlineUserIds(userIds); // userIds is assumed to be an array from server
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, [user?.id, selectedUser]);

  return (
    <header
      className={`${
        theme == "dark" ? "bg-gray-800 text-white" : "bg-white text-[#092e46]"
      } shadow-md ${
        messageLoading ? "cursor-wait pointer-events-none cur-wait" : ""
      }`}
    >
      <div className={`${
        theme == "dark" ? "border-gray-700" : ""
      } mx-auto flex flex-col items-center justify-between px-2 py-4 h-full border-r`}>
        {user ? (
          <div className="flex flex-col justify-between items-center gap-4 text-sm h-full">
            <div className="flex flex-col items-center gap-4 text-sm">
              <div>
                <span
                  onClick={() => {
                    navigate("/chat");
                  }}
                  role="img"
                  aria-label="plate"
                >
                  <img src={logo} className="logo-n" />
                </span>
              </div>
              <button
                onClick={() => setProfileOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Profile"
                className="flex items-center p-1 f-13 rounded-full hover:bg-orange-200  transition relative"
              >
                {user?.profile_pic ? (
                  <div>
                    <img
                    src={"https://rapidcollaborate.in/ccp" + user.profile_pic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mx-auto object-cover border"
                  />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full mx-auto object-cover border bg-blue-600 text-white flex items-center justify-center">
                    {user.name[0]}
                  </div>
                )}
                {onlineUserIds.includes(user?.id) &&( user?.availability != "busy" || user?.availability != "dnd") && (
                  <span className="absolute bottom-[4px] right-[4px] w-2 h-2 bg-green-500 rounded-full border border-white" />
                )}
                {user?.availability == "busy" && (
                  <span 
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Busy"
                  className="absolute bottom-[4px] right-[4px] bg-white " >
                    <Circle size={8} strokeWidth={6} className="text-red-600"/>
                  </span>
                )}

                {user?.availability == "dnd" && (
                  <span 
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Do Not Disturb"
                  className="absolute bottom-[4px] right-[4px] bg-white" >
                    <CircleMinus size={8} strokeWidth={5} className="text-red-600"/>
                  </span>
                )}
              </button>

              {/* <button
                onClick={() => navigate("/chat")}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Chat Board"
                className={`flex items-center p-2 f-13 rounded-full ${theme == "dark" ? "text-white" : "text-gray-800 hover:text-gray-900"} hover:bg-orange-500  transition`}
              >
                <MessagesSquare size={17} className="" />
              
              </button> */}

              {(user.user_type == "admin" ||
                (user.user_type == "subadmin" &&
                  user.access_requests == 1)) && (
                <button
                  onClick={() => setRequestsOpen(true)}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Admin Requests"
                  className={`flex items-center p-2 f-13 rounded-full ${
                    theme == "dark"
                      ? "text-white"
                      : "text-gray-800 hover:text-gray-900"
                  } hover:bg-orange-500  transition`}
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
                  className={`flex items-center p-2 f-13 rounded-full ${
                    theme == "dark"
                      ? "text-white"
                      : "text-gray-800 hover:text-gray-900"
                  } hover:bg-orange-500  transition`}
                >
                  <Group size={17} className="" />
                  {/* Groups */}
                </button>
              ) : (
                <button
                  onClick={() => setCreateNewSpace(true)}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Create New Group"
                  className={`flex items-center p-2 f-13 rounded-full ${
                    theme == "dark"
                      ? "text-white"
                      : "text-gray-800 hover:text-gray-900"
                  } hover:bg-orange-500  transition`}
                >
                  <Group size={17} className="" />
                  {/* New Space */}
                </button>
              )}
              {(user.user_type == "admin" ||
                (user.user_type == "subadmin" && user.view_users == 1)) && (
                <button
                  onClick={() => setUsersOpen(true)}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Manage Users"
                  className={`flex items-center p-2 f-13 rounded-full ${
                    theme == "dark"
                      ? "text-white"
                      : "text-gray-800 hover:text-gray-900"
                  } hover:bg-orange-500  transition`}
                >
                  <Users size={17} className="" />
                  {/* Manage Users */}
                </button>
              )}
            </div>
            <div className="flex items-center flex-col gap-3" ref={dropdownRef}>
              {theme == "dark" ? (
                <button
                  onClick={() => updateTheme("light")}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Switch to Light Theme"
                  className="flex hover:bg-gray-200 bg-gray-100 hover:text-black items-center p-2 rounded-full text-gray-500  transition"
                >
                  <Sun size={17} className="" />
                </button>
              ) : (
                <button
                  onClick={() => updateTheme("dark")}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Switch to Dark Theme"
                  className="flex hover:bg-gray-800 border border-gray-600  hover:text-white items-center p-2 rounded-full text-gray-500  transition"
                >
                  <MoonIcon size={17} className="" />
                </button>
              )}
              <button
                // onClick={logout}
                onClick={() => setLogoutOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Logout"
                className="flex hover:bg-red-500 hover:text-white items-center p-2 rounded-full text-gray-500  transition"
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
            onClose={() => {
              setLogoutOpen(false);
            }}
          />
        )}
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
        {/* {searchOpen && (
          <TotalSearch
            onClose={() => {
              setSearchOpen(false);
            }}
            searchResults={[]}
          />
        )} */}
        <ReminderPopup />
      </AnimatePresence>
    </header>
  );
}
