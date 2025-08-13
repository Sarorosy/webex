import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../utils/idb";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useSelectedUser } from "../../utils/SelectedUserContext";

const TotalSearch = ({ onClose, query, setQuery }) => {
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [showResults, setShowResults] = useState(true);
  const searchRef = useRef(null);

  const [results, setResults] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activeTab, setActiveTab] = useState("spaces"); //spaces, messages
  const [resultsLoading, setResultsLoading] = useState(false);
  const [spaceLoading, setSpaceLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  const { selectedMessage, setSelectedMessage } = useSelectedUser();
  const { selectedUser, setSelectedUser } = useSelectedUser();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSpaces([]);
      setMessages([]);
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      try {
        setResultsLoading(true);
        const res = await fetch(
          "https://webexback-06cc.onrender.com/api/messages/totalfind",
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

    const fetchSpaces = async () => {
      try {
        setSpaceLoading(true);
        const res = await fetch(
          "https://webexback-06cc.onrender.com/api/messages/searchUsersAndGroups",
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
        setSpaces(data.results ?? []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Search error:", err);
      } finally {
        setSpaceLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        setMessageLoading(true);
        const res = await fetch(
          "https://webexback-06cc.onrender.com/api/messages/searchMessages",
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
        setMessages(data.messages ?? []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Search error:", err);
      } finally {
        setMessageLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      // fetchResults();
      fetchSpaces();
      fetchMessages();
    }, 300); // debounce

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [query, user]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <AnimatePresence>
      {/* <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: "tween", duration: 0.3 }}
        className={`fixed top-0 left-0 w-[28.6%] h-[100vh] ${theme == "dark" ? "bg-gray-800 text-white" : "bg-white"} shadow-xl border-l border-gray-300 z-[100] overflow-y-auto`}
      > */}
      <div
        className={` h-[100vh] ${
          theme == "dark" ? "bg-gray-800 text-white" : ""
        }   border-gray-300 z-[100] overflow-y-auto`}
      >
        <div className="">
          <div className="relative" ref={searchRef}>
            {/* Search Input */}
            {/* <div className="relative mb-3 flex items-center gap-2 px-2 py-1 rounded bg-white  shadow-sm transition duration-200  border border-orange-100 cursor-pointer focus-within:ring-2 focus-within:ring-gray-400">
              <Search
                onClick={() => setSearchOpen(true)}
                size={17}
                className="text-gray-400 hover:text-orange-500 transition"
              />
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-0"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
              />
              <button
                onClick={onClose}
                className="text-sm text-white bg-orange-600 px-1 py-1 rounded"
              >
                <X size={13} />
              </button>
            </div> */}

            {showResults && (
              <div className="w-full  topmost z-50">
                <div className="flex gap-3 mb-1 mx-auto border-b pb-2">
                  <button
                    onClick={() => setActiveTab("spaces")}
                    className={`flex items-center gap-2 px-3 py-1 text-gray-700 border rounded-full hover:bg-gray-200 ${
                      activeTab === "spaces" ? "bg-orange-200" : "bg-gray-100"
                    }`}
                  >
                    Spaces
                  </button>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className={`flex items-center gap-2 px-3 py-1 text-gray-700 border rounded-full hover:bg-gray-200 ${
                      activeTab === "messages" ? "bg-orange-200" : "bg-gray-100"
                    }`}
                  >
                    Messages
                  </button>
                </div>

                {spaceLoading ? (
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
                  <div className="max-h-[85vh] overflow-y-auto">
                    {spaces.length > 0 ? (
                      spaces.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 p-2 me-1 ${
                            theme == "dark"
                              ? "hover:bg-gray-700 text-white"
                              : "hover:bg-gray-300"
                          } rounded cursor-pointer`}
                          onClick={() => {
                            onClose();
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
                              src={
                                user.profile_pic.startsWith("http")
                                  ? user.profile_pic
                                  : `https://rapidcollaborate.in/ccp${user.profile_pic}`
                              }
                              alt={user.name}
                              loading="lazy"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold uppercase">
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
                  <div className="max-h-[85vh] overflow-y-auto f-12">
                    {messages?.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2 me-1 border-b  last:border-b-0 ${
                            theme == "dark"
                              ? "bg-gray-800 hover:bg-gray-600 text-white mw-dark "
                              : "hover:bg-gray-300"
                          } cursor-pointer rounded`}
                          onClick={() => {
                            console.log("Clicked message:", msg);
                            // navigate("/chat", {
                            //   state: { type: "message", data: msg },
                            // });
                            if (
                              selectedUser &&
                              selectedUser?.id == msg.user.id &&
                              selectedUser?.type == msg.user.type
                            ) {
                            } else {
                              setSelectedUser(null);
                            }
                            setTimeout(() => {
                              setSelectedUser(msg.user);
                              setSelectedMessage(msg);
                            }, 100);
                          }}
                        >
                          <div className="flex items-start  gap-2">
                            <div>
                              {msg.profile_pic ? (
                                <img
                                  src={`https://rapidcollaborate.in/ccp${msg.profile_pic}`}
                                  alt={msg.sender_name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-xs uppercase">
                                  {msg.sender_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="font-semibold ">
                              {msg.sender_id == user?.id
                                ? "You"
                                : msg.sender_name}{" "}
                              {msg.type == "group" && (
                                <p className="font-bold">-{msg.user.name}</p>
                              )}
                            </div>
                          </div>
                          <div
                            className={` ${
                              theme == "dark" ? " text-white" : "text-gray-700"
                            } mt-1  prose`}
                            dangerouslySetInnerHTML={{ __html: msg.message }}
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(msg.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-50 p-2">
                        {!query
                          ? "Search Messages"
                          : messageLoading
                          ? "Loading..."
                          : " No messages found."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* </motion.div> */}
    </AnimatePresence>
  );
};

export default TotalSearch;
