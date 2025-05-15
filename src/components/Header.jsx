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
  const [usersOpen, setUsersOpen] = useState(false)

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
      <div className=" mx-auto flex items-center justify-between px-4 py-2">
        <h1
          className="text-2xl font-bold flex items-center cursor-pointer"
          onClick={() => {
            navigate("/chat");
          }}
        >
          <span role="img" aria-label="plate">
            <img src={logo} className="logo-n" />
          </span>{" "}
        </h1>

        {user ? (
          <div className="flex items-center space-x-4 text-sm">
            <div className="relative py-0.5" ref={searchRef}>
              {/* Search Input */}
              <div className="relative flex items-center border border-gray-300 rounded shadow-sm bg-white px-2 py-1">
                <Search size={15} className="text-gray-500" />
                <input
                  type="text"
                  className="w-full px-3 text-md text-gray-500 outline-none focus:border-none focus:ring-0 f-13"
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
                  <div className="flex gap-3 mb-3 mx-auto">
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
              className="flex items-center px-2 py-1 f-13 rounded bg-gray-100 text-black  transition mr-3"
            >
              <MessagesSquare size={12} className="mr-1" />
              Chat
            </button>

            {(user.user_type == "admin" || user.user_type == "subadmin") && (
              <button
                onClick={() => setRequestsOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Admin Requests"
                className="flex items-center px-2 py-1 f-13 rounded bg-gray-100 text-black  transition mr-3"
              >
                <LayoutDashboard size={12} className="mr-1" />
                Requests
              </button>
            )}
            {user.user_type == "admin" ? (
              <button
                onClick={() => setGroupsOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Manage groups"
                className="flex items-center px-2 py-1 f-13 rounded bg-gray-100 text-black  transition mr-3"
              >
                <Group size={12} className="mr-1" />
                Groups
              </button>
            ) : (
              <button
                onClick={() => setCreateNewSpace(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Create New Space"
                className="flex items-center px-2 py-1 f-13 rounded bg-gray-100 text-black  transition mr-3"
              >
                <Group size={12} className="mr-1" />
                New Space
              </button>
            )}
            {user.user_type == "admin" && (
              <button
                onClick={() => setUsersOpen(true)}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Manage Users"
                className="flex items-center px-2 py-1 f-13 rounded bg-gray-100 text-black  transition mr-3"
              >
                <Users size={12} className="mr-1" />
                Manage Users
              </button>
            )}
            <div className="flex items-center" ref={dropdownRef}>
              <button
                onClick={() => navigate('/profile')}
                data-tooltip-id="my-tooltip"
                data-tooltip-content={user.email}
                className="flex items-center px-2 py-1 f-13 rounded bg-gray-100 text-black  transition mr-3"
              >
                <CircleUserRound size={12} className="mr-1" />
                Welcome, <span className="font-semibold ml-1">{user.name}</span>
              </button>
              <button
                onClick={logout}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Logout"
                className="flex hover:bg-red-500 hover:text-white items-center px-2 py-2 rounded-md bg-gray-100 text-black  transition"
              >
                <LogOut size={15} className="" />
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
        <ReminderPopup />
      </AnimatePresence>
    </header>
  );
}
