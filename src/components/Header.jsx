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
import ManageUsers from '../pages/users/ManageUsers.jsx';
import Profile from '../pages/user/Profile.jsx';

import { getToken } from 'firebase/messaging';
import { messaging } from '../../firebase-config.js';
import { onMessage } from 'firebase/messaging';
import toast from "react-hot-toast";

export default function Header() {
  const { user,login, logout } = useAuth();
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

  const [permissionGranted, setPermissionGranted] = useState(false);
  const requestPermission = async () => {
    try {
      // Check if notification permission is already granted
      const permission = Notification.permission;

      if (permission === 'granted') {
        console.log('Notification permission already granted.');

        // Register the service worker with the correct scope
        if ('serviceWorker' in navigator) {
          // Register the service worker manually with the correct path
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered with scope:', registration.scope);

          // Now, get the token with the custom service worker registration
          const currentToken = await getToken(messaging, {
            vapidKey: 'BFEh52B2gdCHFyKNo71vgG3Vg5crEdg2H4b2FLLjiAizybXHlwy73MQTUI0FVA9h1PH3Oy9dtc1wSJ6FVmj7MUE',  // Your VAPID key here
            serviceWorkerRegistration: registration, // Pass the custom service worker registration
          });

          if (currentToken && user && user.id) {
            console.log('FCM Token:', currentToken);
            const requestData = {
              user_id:user.id,
              token: currentToken,
            };

            const response = await fetch("http://localhost:5000/api/saveFcmToken", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            });

            if (response.ok) {
              const result = await response.json();
              console.log("FCM token successfully saved:", result);
            } else {
              console.error("Failed to save FCM token:", response.status, response.statusText);
            }

          } else {
            console.log('No registration token available.');
          }
        } else {
          console.error('Service Workers are not supported in this browser.');
        }
      } else if (permission === 'default') {
        // Request permission if not already granted
        const permissionRequest = await Notification.requestPermission();
        if (permissionRequest === 'granted') {
          console.log('Notification permission granted.');
          setPermissionGranted(true);
          requestPermission();  // Re-run the permission request logic after granting
        } else {
          console.log('Notification permission denied.');
        }
      } else {
        console.log('Notification permission denied.');
      }

    } catch (error) {
      console.error('Error getting notification permission or token:', error);
    }
  };

  useEffect(() => {

    requestPermission();

    // onMessage(messaging, (payload) => {
    //   console.log('Message received. ', payload.notification.body);  // Check this log to see the incoming message
    //   if (payload && payload.notification) {
    //     toast.success(payload.notification.body);
    //   }
    // });
  }, []);

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("spaces"); //spaces, messages
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      try {
        setResultsLoading(true);
        const res = await fetch(
          "http://localhost:5000/api/messages/totalfind",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sender_id: user?.id, query }),
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Search error:", err);
      } finally {
        setResultsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchResults();
    }, 300); // debounce

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [query, user]);

  useEffect(() => {
  connectSocket();
  const socket = getSocket();

  const handleUserUpdated = (updatedUser) => {
    console.log("one")
    if (updatedUser?.id == user?.id) {
      console.log("two")
      login(updatedUser);
    }
  };

  socket.on("user_updated", handleUserUpdated);

  return () => {
    socket.off("user_updated", handleUserUpdated);
  };
}, [user?.id]);


  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <header className={`bg-white text-[#092e46] shadow-md ${messageLoading ? "cursor-wait pointer-events-none cur-wait" : ""}`}>
      <div className=" mx-auto flex flex-col items-center justify-between px-2 py-4 h-full">
        

        {user ? (
          <div className="flex flex-col justify-between items-center gap-4 text-sm h-full">
          <div className="flex flex-col items-center gap-5 text-sm">

            <div className="relative py-0.5" ref={searchRef}>
              {/* Search Input */}
              <div className="relative flex items-center p-3 f-13 rounded-full hover:bg-orange-200 text-black transition cursor-pointer">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  className="w-[0px] text-md text-gray-500 outline-none focus:border-none focus:ring-0 f-13"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                />
              </div>

              {/* Filters */}

              {/* Dropdown Results */}
              {showResults && (
                <div className="absolute w-[300px] n-bg-light shadow-lg border border-gray-200 rounded mt-2 topmost px-2 py-2 z-50">
                  <div className="flex gap-3 mb-1 mx-auto border-b pb-2">
                    <button
                      onClick={() => setActiveTab("spaces")}
                      className={`flex items-center gap-2 px-2 py-0.5 text-gray-700 border rounded-full hover:bg-gray-200 ${
                        activeTab === "spaces" ? "bg-orange-200" : "bg-gray-100"
                      }`}
                    >
                      Spaces
                    </button>
                    <button
                      onClick={() => setActiveTab("messages")}
                      className={`flex items-center gap-2 px-2 py-0.5 text-gray-700 border rounded-full hover:bg-gray-200 ${
                        activeTab === "messages"
                          ? "bg-orange-200"
                          : "bg-gray-100"
                      }`}
                    >
                      Messages
                    </button>
                  </div>

                  {resultsLoading ? (
                  <div className="mx-auto flex justify-center w-full py-4">
                    <ScaleLoader
                      className="mx-auto"
                      color="#ea580c"
                      height={14}
                      width={3}
                      radius={2}
                      margin={2}
                    />
                    </div>
                  ) : activeTab === "spaces" ? (
                    <div className="max-h-[300px] overflow-y-auto">
                      {results?.results?.length > 0 ? (
                        results.results.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => {
                              console.log("Clicked user:", user);
                              navigate("/chat", {
                                state: { type: "user", data: user },
                              });
                              setSelectedUser(user);
                              setQuery("");
                              setShowResults(false);
                            }}
                          >
                            {user.profile_pic ? (
                              <img
                                src={`http://localhost:5000${user.profile_pic}`}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold uppercase">
                                {user.name.charAt(0)}
                              </div>
                            )}
                            <span>{user.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm p-2">
                          {!query
                            ? "Search Users and groups"
                            : " No users found."}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                      {results?.messages?.length > 0 ? (
                        results.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className="p-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={() => {
                              console.log("Clicked message:", msg);
                              navigate("/chat", {
                                state: { type: "message", data: msg },
                              });
                              setSelectedMessage(msg);
                              setQuery("");
                              setShowResults(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {msg.profile_pic ? (
                                <img
                                  src={`http://localhost:5000${msg.profile_pic}`}
                                  alt={msg.sender_name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-xs uppercase">
                                  {msg.sender_name.charAt(0)}
                                </div>
                              )}
                              <div className="text-sm font-semibold flex items-center">
                                {(msg.sender_id == user?.id) ?  "You" : msg.sender_name} {msg.type == "group" && (
                                  <p className="font-bold">-{msg.user.name}</p>
                                )}
                              </div>
                            </div>
                            <div
                              className="text-sm text-gray-700 mt-1"
                              dangerouslySetInnerHTML={{ __html: msg.message }}
                            />
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(msg.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm p-2">
                          {!query ? "Search Messages" : " No messages found."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/chat")}
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Chat Board"
              className="flex items-center p-3 f-13 rounded-full hover:bg-orange-200 text-black transition"
            >
              <MessagesSquare size={18} className="text-gray-500" />
              {/* Chat */}
            </button>

            {(user.user_type == "admin" || user.user_type == "subadmin") && (
              <button
                onClick={() => setRequestsOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Admin Requests"
                className="flex items-center p-3 f-13 rounded-full hover:bg-orange-200 text-black transition"
              >
                <LayoutDashboard size={18} className="text-gray-500" />
                {/* Requests */}
              </button>
            )}
            {user.user_type == "admin" ? (
              <button
                onClick={() => setGroupsOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Manage groups"
                className="flex items-center p-3 f-13 rounded-full hover:bg-orange-200 text-black transition"
              >
                <Group size={18} className="text-gray-500" />
                {/* Groups */}
              </button>
            ) : (
              <button
                onClick={() => setCreateNewSpace(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Create New Space"
                className="flex items-center p-3 f-13 rounded-full hover:bg-orange-200 text-black transition"
              >
                <Group size={18} className="text-gray-500" />
                {/* New Space */}
              </button>
            )}
            {user.user_type == "admin" && (
              <button
                onClick={() => setUsersOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Manage Users"
                className="flex items-center p-3 f-13 rounded-full hover:bg-orange-200 text-black transition"
              >
                <Users size={18} className="text-gray-500" />
                {/* Manage Users */}
              </button>
            )}

          </div>
            <div className="flex items-center flex-col" ref={dropdownRef}>
              
              <button
                onClick={logout}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Logout"
                className="flex hover:bg-red-500 hover:text-white items-center p-3 rounded-full text-gray-500  transition"
              >
                <LogOut size={18} className="" />
              </button>
            </div>
          </div>
        ) : (
          navigate("/login")
        )}
      </div>

      <AnimatePresence>
        {createNewSpace && (
          <AddGroup
            onClose={() => {
              setCreateNewSpace(false);
            }}
          />
        )}
        {requestsOpen && (
          <Requests onClose={()=>{setRequestsOpen(false)}} />
        )}
        {groupsOpen && (
          <ManageGroups onClose={()=>{setGroupsOpen(false)}} />
        )}
        {usersOpen && (
          <ManageUsers onClose={()=>{setUsersOpen(false)}} />
        )}
        {profileOpen && (
          <Profile onClose={()=>{setProfileOpen(false)}} />
        )}
        <ReminderPopup />
      </AnimatePresence>
    </header>
  );
}
