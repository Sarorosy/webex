import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getSocket, connectSocket } from "../../utils/Socket";
import { useAuth } from "../../utils/idb";
import { format } from "date-fns";

const ReadPersons = ({ messageId }) => {
  const [readUsers, setReadUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, theme } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const fetchReadUsers = async (load = true) => {
    try {
      setLoading(load);
      const res = await axios.get(
        `https://webexback-06cc.onrender.com/api/chats/read-persons/${messageId}`
      );
      if (res.data.status) {
        setReadUsers(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching read users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!messageId) return;
    fetchReadUsers(true);
  }, [messageId]);

  useEffect(() => {
    if (!messageId) return;
    connectSocket(user?.id);
    const socket = getSocket();

    const handleReadMessage = (payload) => {
      if (payload?.message_ids?.includes(messageId)) {
        fetchReadUsers(false);
      }
    };

    socket.on("read_message", handleReadMessage);
    return () => {
      socket.off("read_message", handleReadMessage);
    };
  }, [messageId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatReadTime = (readAt) => {
    if (!readAt) return "";
    const readDate = new Date(readAt);
    const now = new Date();
    const diffInSeconds = (now - readDate) / 1000;
    return diffInSeconds < 60 ? "just now" : format(readDate, "MMM d, h:mm a");
  };

  if (loading) return <p className="text-gray-500 text-sm text-center">...</p>;

  const otherUsers = readUsers.filter((u) => u.id !== user?.id);
  if (otherUsers.length === 0) return null;

  const displayUsers = otherUsers.slice(0, 10);
  const remainingUsers = otherUsers.slice(10);

  return (
    <div className="flex justify-center items-center mt-2 gap-1 relative">
      <p className="text-gray-500 f-11">Seen by</p>
      <div className="flex items-center gap-1 relative">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            className="w-6 h-6 rounded-full overflow-hidden border border-gray-900"
            title={`${user.name} • ${formatReadTime(user.read_at)}`}
            data-tooltip-content={`${user.name} • ${formatReadTime(
              user.read_at
            )}`}
            data-tooltip-id="my-tooltip"
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
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-xs uppercase">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        ))}

        {remainingUsers.length > 0 && (
          <div
            ref={triggerRef}
            className="relative w-6 h-6 rounded-full bg-gray-300 text-xs flex items-center justify-center cursor-pointer border border-gray-900"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            +{remainingUsers.length}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className={`absolute bottom-8 -right-20 z-50 w-48 max-h-64 overflow-y-auto p-2 rounded-md border shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-600 text-white border-gray-400"
                    : "bg-white border-gray-300"
                }`}
              >
                {remainingUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-400">
                      {user.profile_pic ? (
                        <img
                          src={
                            user.profile_pic.startsWith("http")
                              ? user.profile_pic
                              : `https://rapidcollaborate.in/ccp${user.profile_pic}`
                          }
                          alt={user.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-xs uppercase">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">{user.name}</p>
                      <p
                        className={`${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {formatReadTime(user.read_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadPersons;
