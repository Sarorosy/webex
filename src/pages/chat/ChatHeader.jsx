import { Pin, Search, Star, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";
import SearchResults from "./SearchResults";

const ChatHeader = ({
  selectedUser,
  isTyping,
  handleGroupInfoClick,
  searchOpen,
  setSearchOpen,
  setPinMessagesOpen,
  setSelectedMessage,
  query,
  setQuery,
  setSearchResults,
  setLeftGroupOpen
}) => {
  const { user } = useAuth();
  
  
  const [isFavourite, setIsFavourite] = useState(
    Array.isArray(JSON.parse(selectedUser?.favourites || "[]")) &&
      JSON.parse(selectedUser.favourites || "[]").includes(user.id)
  );

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim() === "") {
        setSearchResults([]);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/messages/find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: selectedUser?.type,
            query,
            logged_in_userid: user.id,
            find_in_userid: selectedUser?.id,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.messages || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 400);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedUser?.id, user.id]);

  const handleFavourite = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chats/favourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser?.id,
          user_id: user.id,
          type: selectedUser?.type,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsFavourite(!isFavourite);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  useEffect(() => {
    setSearchOpen(false);
    setSelectedMessage(null);
    setQuery("");
  }, [selectedUser]);

  return (
    <div className="relative mb-1">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b pb-4 px-3 py-6 chat-header-bg rounded-t-lg shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedUser?.profile_pic ? (
              <img
                src={
                  selectedUser.profile_pic.startsWith("http")
                    ? selectedUser.profile_pic
                    : "http://localhost:5000" + selectedUser.profile_pic
                }
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-400 text-white text-lg font-bold shadow">
                {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-800 tracking-wide flex flex-col ml-2">
            <span className="flex items-center">
              {selectedUser?.name || "Unknown User"}
              <button onClick={handleFavourite}>
                <Star
                  size={18}
                  className={`ml-2 ${
                    isFavourite
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </span>
            {isTyping && (
              <div className="typing-indicator italic text-gray-800 f-11">
                Typing...
              </div>
            )}
          </h2>
        </div>

        {/* Right Section */}
        <div className="flex justify-between items-center gap-3 px-4">
          {selectedUser?.type == "group" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGroupInfoClick(selectedUser)}
                className="px-3 py-1 f-13 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
              >
                Group Info
              </button>
              <button 
              onClick={() => setLeftGroupOpen(true)}
              className="px-3 py-1 f-13 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">
                Leave Group
              </button>
            </div>
          )}

          {searchOpen ? (
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search..."
                className="px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 f-13"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                  setSearchResults([]);
                }}
                className="text-red-600 hover:text-red-800 font-bold text-lg"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1 bg-blue-500 text-white f-13 rounded-full hover:bg-blue-600 transition"
            >
              <Search size={15} />
            </button>
          )}
          <button
              onClick={() => setPinMessagesOpen(true)}
              className="p-1 bg-blue-500 text-white f-13 rounded-full hover:bg-blue-600 transition"
            >
              <Pin size={15} />
            </button>
        </div>
      </div>

      {/* FLOATING RESULTS */}
      
    </div>
  );
};

export default ChatHeader;
