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
import { ScaleLoader } from "react-spinners";
import { useSelectedUser } from "../../utils/SelectedUserContext";

const ChatSidebar = ({
  view_user_id,
  view_user_name,
  selectedUser,
  onSelect,
}) => {
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]); // Will store groups and users
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    const handleGroupLeft = ({ id, user_id, type }) => {
      if (user_id == user?.id) {
        setChats((prevChats) =>
          prevChats.filter((chat) => !(chat.id == id && chat.type === type))
        );
      }
    };

    const handleGroupUpdated = (data) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id == data.id && chat.type === "group") {
            return {
              ...chat,
              name: data.name,
              group: data.group,
            };
          }
          return chat;
        })
      );
    };

    const handleGroupCreated = (group) => {
      if (
        Array.isArray(group.selected_members) &&
        group.selected_members.includes(user?.id)
      ) {
        const { selected_members, ...chatData } = group;
        setChats((prevChats) => [...prevChats, chatData]);
      }
    };

    const handleGroupDeleted = (data) => {
      setChats((prevChats) =>
        prevChats.filter(
          (chat) => !(chat.id == data.id && chat.type === "group")
        )
      );

      if (selectedUser?.id == data.id && selectedUser?.type === "group") {
        onSelect(null);
      }
    };

    socket.on("group_left", handleGroupLeft);
    socket.on("group_updated", handleGroupUpdated);
    socket.on("group_created", handleGroupCreated);
    socket.on("group_deleted", handleGroupDeleted);

    return () => {
      socket.off("group_left", handleGroupLeft);
      socket.off("group_updated", handleGroupUpdated);
      socket.off("group_created", handleGroupCreated);
      socket.off("group_deleted", handleGroupDeleted);
    };
  }, [user?.id, selectedUser]);

  useEffect(() => {
    if (view_user_id && user.user_type) {
      if (user.user_type != "admin") {
        navigate("/chat");
        toast.error("User not Allowed");
      }
    }
  }, [view_user_id, user]);

  const [sideBarLoading, setSideBarLoading] = useState(false);
  const fetchChats = async (load = true) => {
    try {
      setSideBarLoading(load);
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
        const filteredChats = (data.data || []).filter(
          (item) => item.id !== undefined
        );
        setChats(filteredChats);
        updateChatLoginStatus(filteredChats);
        setChatsLoaded(true)
      } else {
        console.error("Error fetching chats data");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setSideBarLoading(false);
    }
  };

  const updateChatLoginStatus = async (chatList) => {
    try {
      const updatedChats = await Promise.all(
        chatList.map(async (chat) => {
          let logged_in_status = true;

          if (chat.type === "user" && chat.user_type !== "admin") {
            try {
              let url = "";
              if (chat.user_panel === "AP") {
                url =
                  "https://www.thehrbulb.com/team-member-panel/api/checkLoggedInorNot";
              } else if (chat.user_panel === "SP") {
                url =
                  "https://elementk.in/spbackend/api/login-history/check-login-status";
              }

              if (url) {
                const res = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email: chat.email }),
                });

                const result = await res.json();
                if (result.message === "Loggedin") {
                  logged_in_status = true;
                } else {
                  logged_in_status = false;
                }
              }
            } catch (err) {
              console.error("Error checking status for", chat.email, err);
            }
          }

          return {
            ...chat,
            logged_in_status,
          };
        })
      );

      setChats(updatedChats); // now safely update state
    } catch (err) {
      console.error("Error updating login status:", err);
    }
  };

  useEffect(() => {
    fetchChats(true);
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

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    const handleIncoming = (msgOrReply, isReply = false) => {
      if (!msgOrReply) return;
      if (!chatsLoaded) return;

      const msg = isReply ? msgOrReply : msgOrReply; // No need for msgOrReply.reply


      if (!msg || !msg.sender_id || !msg.receiver_id) {
        console.warn("Malformed message or reply:", msgOrReply);
        return;
      }

      const otherUserId =
        msg.sender_id == user?.id ? msg.receiver_id : msg.sender_id;

        console.log("otherUserId", otherUserId)

      const isRelevant =
  msg.user_type === "group"
    ? (() => {
        console.log("Checking group message:", msg);

        console.log("Available chats:", chats);

        const matchingChat = chats.find(
          (chat) =>
            chat.id == msg.receiver_id && chat.type === "group"
        );

        console.log("Matched group chat:", matchingChat);

        return !!matchingChat;
      })()
    : (msg.sender_id == user?.id || msg.receiver_id == user?.id);



      console.log("isRelevant" , isRelevant)

      if (!isRelevant) {
      return
      } 

      setChats((prevChats) => {
        const index = prevChats.findIndex(
        (chat) => chat.id == otherUserId && chat.type == msg.user_type // match type
      );

        if (index === -1) {
          fetchChats(false);
          return prevChats;
        }

        const updatedChats = [...prevChats];
        updatedChats[index] = {
          ...updatedChats[index],
          last_interacted_time: new Date().toISOString(),
          read_status: (msg.sender_id != user?.id && selectedUser?.id != msg.sender_id) ? 1 : 0,
          unread_count: (updatedChats[index]?.unread_count || 0) + 1
        };

        const updated = updatedChats.splice(index, 1)[0];
        updatedChats.unshift(updated);

        return updatedChats;
      });
    };

    const handleNewMessageSidebar = (msg) => handleIncoming(msg, false);
    const handleNewReplySidebar = (reply) => {
      console.log("Incoming reply from socket:", reply);
      handleIncoming(reply, true);
    };

    socket.off("new_message", handleNewMessageSidebar);
    socket.on("new_message", handleNewMessageSidebar);

    socket.off("new_reply", handleNewMessageSidebar);
    socket.on("new_reply", handleNewMessageSidebar);

    return () => {
      socket.off("new_message", handleNewMessageSidebar);
      socket.off("new_reply", handleNewMessageSidebar);
    };
  }, [user?.id, chatsLoaded, selectedUser]);

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

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    const handleGroupLeft = ({ id, user_id, type }) => {
      if (user_id == user?.id) {
        setChats((prevChats) =>
          prevChats.filter((chat) => !(chat.id == id && chat.type === type))
        );
      }
    };

    const handleGroupUpdated = (data) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id == data.id && chat.type === "group") {
            return {
              ...chat,
              name: data.name,
              group: data.group,
            };
          }
          return chat;
        })
      );
    };

    const handleGroupCreated = (group) => {
      if (
        Array.isArray(group.selected_members) &&
        group.selected_members.includes(user?.id)
      ) {
        // Remove selected_members from the group payload if you don't want it stored
        const { selected_members, ...chatData } = group;
        setChats((prevChats) => [...prevChats, chatData]);
      }
    };

    socket.on("group_left", handleGroupLeft);
    socket.on("group_updated", handleGroupUpdated);
    socket.on("group_created", handleGroupCreated);

    return () => {
      socket.off("group_left", handleGroupLeft);
      socket.off("group_updated", handleGroupUpdated);
      socket.off("group_created", handleGroupCreated);
    };
  }, [user?.id]);

  return (
    <div
      className={`w-1/4 bg-gray-100 p-4 overflow-y-auto border-r sticky top-0 ${
        messageLoading ? "cursor-wait pointer-events-none cur-wait" : ""
      }`}
    >
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
            placeholder="Search Groups, Persons"
            className="p-2 border rounded-md w-full "
          />
        </div>
        <div className="flex justify-start gap-2 mb-4  p-1">
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

      {sideBarLoading ? (
        <div className="mx-auto flex justicy-center w-full">
          <ScaleLoader
            className="mx-auto"
            color="#ea580c"
            height={14}
            width={3}
            radius={2}
            margin={2}
          />
        </div>
      ) : activeTab === "all" ? (
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
                  onClick={() => {
                    onSelect(chat);
                    const updatedChats = chats.map((c) => {
                      if (c.id == chat.id && c.type === chat.type) {
                        return { ...c, read_status: 0 };
                      }
                      return c;
                    });
                    
                    setChats(updatedChats);

                  }}
                  className={`flex items-center justify-between space-x-2 p-2 rounded cursor-pointer hover:bg-gray-200 ${
                    selectedUser?.id === chat.id && "bg-gray-300"
                  } ${
                    chat.read_status && chat.read_status == 1 ? "font-bold" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
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
                  <span
                    className={`truncate ${
                      chat.logged_in_status == true ||
                      chat.logged_in_status == null
                        ? ""
                        : "text-red-500"
                    }`}
                  >
                    {chat.name}
                  </span>
                  {isFavourite && (
                    <Star
                      size={18}
                      className="ml-2 fill-yellow-500 text-yellow-500"
                    />
                  )}
                  </div>
                  {chat.read_status === 1 && (
                    <div className="w-4 h-4 bg-orange-500 text-white rounded-full ml-2 flex items-center justify-center f-11 p-1">
                      {chat.unread_count ?? 1}
                    </div>
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
              onClick={() => {
                    onSelect(chat);
                    const updatedChats = chats.map((c) => {
                      if (c.id == chat.id && c.type === chat.type) {
                        return { ...c, read_status: 0 };
                      }
                      return c;
                    });
                    
                    setChats(updatedChats);

                  }}
              className={`flex items-center justify-between space-x-2 p-2 rounded cursor-pointer hover:bg-gray-200 ${
                selectedUser?.id === chat.id && "bg-gray-300"
              } ${
                chat.read_status && chat.read_status == 1 ? "font-bold" : ""
              }`}
            >
              <div className="flex items-center space-x-2">
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
                <span
                  className={`truncate ${
                    chat.logged_in_status == true ||
                    chat.logged_in_status == null
                      ? ""
                      : "text-red-500"
                  }`}
                >
                  {chat.name}
                </span>
                {isFavourite && (
                  <Star
                    size={18}
                    className="ml-2 fill-yellow-500 text-yellow-500"
                  />
                )}
              </div>
              {chat.read_status === 1 && (
                <div className="w-4 h-4 bg-orange-500 text-white rounded-full ml-2 flex items-center justify-center f-11 p-1">
                   {chat.unread_count ?? 1}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChatSidebar;
