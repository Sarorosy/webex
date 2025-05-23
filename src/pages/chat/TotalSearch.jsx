import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../utils/idb";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useSelectedUser } from "../../utils/SelectedUserContext";

const TotalSearch = ({ onClose }) => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("spaces"); //spaces, messages
  const [resultsLoading, setResultsLoading] = useState(false);

  const { selectedMessage, setSelectedMessage } = useSelectedUser();
  const { selectedUser, setSelectedUser } = useSelectedUser();

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
          "https://webexback.onrender.com/api/messages/totalfind",
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
  inputRef.current?.focus();
}, []);


  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed top-0 left-0 w-[28.6%] h-[100vh] bg-white shadow-xl border-l border-gray-300 z-50 overflow-y-auto"
      >
        <div className="p-4 py-2 border-b font-semibold text-lg bg-gray-300 flex justify-between items-center sticky top-0">
          <span>Search Globally</span>
          <button
            onClick={onClose}
            className="text-sm text-white bg-orange-600 px-1 py-1 rounded"
          >
            <X size={13} />
          </button>
        </div>
        <div className="p-4">
        <div className="relative" ref={searchRef}>
          {/* Search Input */}
          <div className="relative mb-3 flex items-center gap-2 px-2 py-1 rounded-full bg-white  shadow-sm transition duration-200  border border-orange-100 cursor-pointer focus-within:ring-2 focus-within:ring-orange-300">
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
          </div>

          {showResults && (
            <div className="w-full mt-2 topmost z-50">
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
                <div className="max-h-[75vh] overflow-y-auto">
                  {results?.results?.length > 0 ? (
                    results.results.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
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
                            src={`https://rapidcollaborate.in/webex${user.profile_pic}`}
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
                      {!query ? "Search Users and groups" : " No users found."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="max-h-[75vh] overflow-y-auto">
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
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {msg.profile_pic ? (
                            <img
                              src={`https://rapidcollaborate.in/webex${msg.profile_pic}`}
                              alt={msg.sender_name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-xs uppercase">
                              {msg.sender_name.charAt(0)}
                            </div>
                          )}
                          <div className="text-sm font-semibold flex items-center">
                            {msg.sender_id == user?.id
                              ? "You"
                              : msg.sender_name}{" "}
                            {msg.type == "group" && (
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TotalSearch;
