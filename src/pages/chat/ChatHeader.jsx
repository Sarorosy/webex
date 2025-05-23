import { Building, DoorOpen, InfoIcon, Pin, Search, Star, X } from "lucide-react";
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
  
  console.log(selectedUser)
  
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
    <div className="relative">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b pb-4 px-3 py-6 chat-header-bg rounded-t-lg shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedUser?.profile_pic ? (
              <img
                src={
                  selectedUser.profile_pic.startsWith("http")
                    ? selectedUser.profile_pic
                    : "https://rapidcollaborate.in/webex" + selectedUser.profile_pic
                }
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-400 text-white text-lg font-bold shadow">
                {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-800 tracking-wide flex flex-col ml-2">
            <span className="flex items-center">
              {selectedUser?.id == user?.id ? selectedUser?.name + " (You)" : selectedUser?.name || "Unknown User"}
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

          {selectedUser?.office_name && selectedUser?.city_name  && (
            <p className="flex items-center ml-6"><Building className="mr-2 text-gray-700" size={15} /> {selectedUser?.office_name} {selectedUser?.city_name ? ", " + selectedUser?.city_name : null}</p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex justify-between items-center gap-3">
          {searchOpen ? (
            <div className="flex items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search..."
                className="px-2 py-1 pr-9 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 f-13"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                  setSearchResults([]);
                }}
                className="bg-red-500 text-white rounded hover:bg-red-800 p-1 font-bold text-md ml-[-26px]"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Search Messages"
              onClick={() => setSearchOpen(true)}
              className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
            >
              <Search size={13} />
            </button>
          )}
          {selectedUser?.type == "group" && (
            <div className="flex items-center gap-3">
              <button
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Group Info"
                onClick={() => handleGroupInfoClick(selectedUser)}
                className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
              >
                <InfoIcon size={13} />
              </button>
              <button 
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Leave group"
              onClick={() => setLeftGroupOpen(true)}
              className="p-2 bg-red-300 text-black hover:text-white f-13 rounded-full hover:bg-red-600 transition">
                <DoorOpen size={13} />
              </button>
            </div>
          )}

          
          <button
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Pined Messages"
            onClick={() => setPinMessagesOpen(true)}
            className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
          >
            <Pin size={13} />
          </button>
        </div>
      </div>

      {/* FLOATING RESULTS */}
      
    </div>
  );
};

export default ChatHeader;
