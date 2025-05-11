import { Star } from "lucide-react";
import React, { useState } from "react"; // Import useState
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";

const ChatHeader = ({ selectedUser, isTyping, handleGroupInfoClick }) => {
  const { user } = useAuth();
  const [isFavourite, setIsFavourite] = useState(
    Array.isArray(JSON.parse(selectedUser?.favourites || "[]")) &&
    JSON.parse(selectedUser.favourites || "[]").includes(user.id)
  ); // Initial state based on selectedUser's favourites


  const handleFavourite = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chats/favourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser?.id,
          user_id: user.id,
          type: selectedUser?.type, // or "group"
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsFavourite(!isFavourite);
      } else {
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3  px-4 py-3 bg-orange-100 rounded-t-lg shadow-inner">
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
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-400 text-white text-xl font-bold shadow">
              {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 tracking-wide flex flex-col ml-2">
          <span className="flex items-center">
            {selectedUser?.name || "Unknown User"}
            <button onClick={handleFavourite}>
              <Star
                size={18}
                className={`ml-2 ${isFavourite ? "fill-yellow-500 text-yellow-500" : "text-gray-400"
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

      {selectedUser?.type == "group" && (
        <div className="flex justify-between items-center gap-3 px-4">
          <button
            onClick={() => { handleGroupInfoClick(selectedUser) }}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition"
          >
            Group Info
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition"
          >
            Leave Group
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
