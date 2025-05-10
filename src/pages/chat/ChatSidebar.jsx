import React, { useState, useEffect } from "react";
import {
  Users,
  User,
  Users2,
  Search,
  Star,
  UserRound,
  UserCircle,
} from "lucide-react"; // Lucide icons
import { useAuth } from "../../utils/idb";
import { getSocket, connectSocket } from "../../utils/Socket";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ChatSidebar = ({
  view_user_id,
  view_user_name,
  selectedUser,
  onSelect,
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]); // Will store groups and users
  const [filteredData, setFilteredData] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    socket.emit("user-connected", user.id);

    socket.on("online-users", (ids) => {
      setOnlineUserIds(ids);
      console.log(ids)
    });

    socket.on("favouriteUpdated", ({ id, favourites, type }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === id && chat.type === type
            ? { ...chat, favourites: JSON.stringify(favourites) }
            : chat
        )
      );
    });

    return () => {
      socket.off("favouriteUpdated");
      socket.off("online-users");
    };
  }, []);

  useEffect(() => {
    if (view_user_id && user.user_type) {
      if (user.user_type != "admin") {
        navigate("/chat");
        toast.error("User not Allowed");
      }
    }
  }, [view_user_id, user]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/chats/getGroupsAndUsersInteracted",
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              userId: view_user_id ? view_user_id : user.id,
            }),
          }
        );
        const data = await res.json();
        if (data.status) {
          setChats(data.data || []);
        } else {
          console.error("Error fetching chats data");
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [view_user_id]);

  useEffect(() => {
    onSelect(null);
  }, [view_user_id]);

  // Filter chats based on the selected tab and search query
  useEffect(() => {
    const filtered = chats.filter((chat) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "direct" && chat.type === "user") ||
        (activeTab === "group" && chat.type === "group");

      const matchesSearch = chat.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });

    // Only sort in "all" tab
    if (activeTab === "all") {
      const favourites = [];
      const others = [];

      filtered.forEach((chat) => {
        const favs = JSON.parse(chat.favourites || "[]");
        if (Array.isArray(favs) && favs.includes(user.id)) {
          favourites.push(chat);
        } else {
          others.push(chat);
        }
      });

      setFilteredData([...favourites, ...others]);
    } else {
      setFilteredData(filtered);
    }
  }, [chats, activeTab, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    socket.on("favouriteUpdated", ({ id, favourites, type }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === id && chat.type === type
            ? { ...chat, favourites: JSON.stringify(favourites) }
            : chat
        )
      );
    });

    return () => {
      socket.off("favouriteUpdated");
    };
  }, []);

  return (
    <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r sticky top-0">
      <div>
        {view_user_name && (
          <div className="flex items-center gap-2 mb-1   rounded">
            Chats of{" "}
            <span className="flex items-center bg-orange-300 px-1 py-0.5 rounded">
              <UserCircle className=" mr-1" size={18} />
              {view_user_name}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search Spaces, Persons"
            className="p-2 border rounded-md w-full "
          />
        </div>
        <div className="flex justify-start gap-2 mb-4 bg-white p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
              activeTab === "all"
                ? "bg-gray-200 text-black font-semibold"
                : "text-gray-600"
            }`}
          >
            <Users size={16} />
            All
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
              activeTab === "direct"
                ? "bg-gray-200 text-black font-semibold"
                : "text-gray-600"
            }`}
          >
            <User size={16} />
            Direct
          </button>
          <button
            onClick={() => setActiveTab("group")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
              activeTab === "group"
                ? "bg-gray-200 text-black font-semibold"
                : "text-gray-600"
            }`}
          >
            <Users2 size={16} />
            Group
          </button>
        </div>
      </div>

      {/* Render filtered data */}
      {activeTab === "all" ? (
        <>
          {filteredData.some((chat) =>
            JSON.parse(chat.favourites || "[]").includes(user.id)
          ) && (
            <div className="text-xs text-gray-500 mt-2 mb-1">Favourites</div>
          )}
          {filteredData.map((chat, idx) => {
            const isFavourite = JSON.parse(chat.favourites || "[]").includes(
              user.id
            );

            const nextChat = filteredData[idx + 1];
            const isLastFavourite =
              isFavourite &&
              (!nextChat ||
                !JSON.parse(nextChat.favourites || "[]").includes(user.id));

            return (
              <React.Fragment key={chat.id}>
                <div
                  onClick={() => onSelect(chat)}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-200 ${
                    selectedUser?.id === chat.id && "bg-gray-300"
                  }`}
                >
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center relative">
                    {chat.profile_pic ? (
                      <img
                        src={"http://localhost:5000" + chat.profile_pic}
                        alt="Profile"
                        className="w-10 h-10 rounded-full mx-auto object-cover border"
                      />
                    ) : (
                      chat.name[0]
                    )}
                     {onlineUserIds.includes(chat.id) && (
    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
  )}
                  </div>
                  <span className="truncate">{chat.name}</span>
                  {isFavourite && (
                    <Star
                      size={18}
                      className="ml-2 fill-yellow-500 text-yellow-500"
                    />
                  )}
                </div>

                {isLastFavourite && (
                  <div className="border-b border-gray-300 my-2 mx-1"></div>
                )}
              </React.Fragment>
            );
          })}
        </>
      ) : (
        // Non-"all" tab rendering stays same
        filteredData.map((chat) => {
          const isFavourite = JSON.parse(chat.favourites || "[]").includes(
            user.id
          );
          return (
            <div
              key={chat.id}
              onClick={() => onSelect(chat)}
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-200 ${
                selectedUser?.id === chat.id && "bg-gray-300"
              }`}
            >
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center">
                {chat.profile_pic ? (
                  <img
                    src={"http://localhost:5000" + chat.profile_pic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full mx-auto object-cover border"
                  />
                ) : (
                  chat.name[0]
                )}
                {onlineUserIds.includes(chat.id) && (
    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
  )}
              </div>
              <span className="truncate">{chat.name}</span>
              {isFavourite && (
                <Star
                  size={18}
                  className="ml-2 fill-yellow-500 text-yellow-500"
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChatSidebar;
