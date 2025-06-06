import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  User,
  Users2,
  Search,
  Star,
  UserRound,
  UserCircle,
  AtSign,
  SearchIcon,
  ArrowLeft,
  MessageCircle,
} from "lucide-react"; // Lucide icons
import { useAuth } from "../../utils/idb";
import { getSocket, connectSocket } from "../../utils/Socket";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import logo from "../../assets/ccp-logo.png";
import isEqual from "lodash.isequal";
import faviconimg from '../../assets/ccp-fav.png'; // Path to your favicon image
import notificationsound from '../../assets/notification-sound.mp3';

const ChatSidebar = ({
  view_user_id,
  view_user_name,
  selectedUser,
  onSelect,
  notificationClickUser,
  setNotificationClickUser
}) => {
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]); 
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const audioRef = useRef(new Audio(notificationsound));

  useEffect(() => {
    connectSocket(user?.id);
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
        fetchChats(false)
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

    const handleOnlineUsers = (userIds) => {
    setOnlineUserIds(userIds); // userIds is assumed to be an array from server
  };
  

    socket.on("group_left", handleGroupLeft);
    socket.on("group_updated", handleGroupUpdated);
    socket.on("group_created", handleGroupCreated);
    socket.on("group_deleted", handleGroupDeleted);
    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("group_left", handleGroupLeft);
      socket.off("group_updated", handleGroupUpdated);
      socket.off("group_created", handleGroupCreated);
      socket.off("group_deleted", handleGroupDeleted);
      socket.off("online-users", handleOnlineUsers);
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

  useEffect(() => {
  if (notificationClickUser?.id && notificationClickUser?.type && chats.length > 0) {
    const matchedChat = chats.find(
      (chat) => chat.id == notificationClickUser.id && chat.type == notificationClickUser.type
    );

    if (matchedChat) {
      onSelect(matchedChat); // simulate click

      const updatedChats = chats.map((c) => {
        if (c.id == matchedChat.id && c.type == matchedChat.type) {
          return {
            ...c,
            read_status: 0,
            unread_count: 0,
            is_mentioned: false,
          };
        }
        return c;
      });

      setChats(updatedChats);
      setNotificationClickUser(null);
    }
  }
}, [notificationClickUser,setNotificationClickUser, chats]);

  const [sideBarLoading, setSideBarLoading] = useState(false);
  const fetchChats = async (load = true) => {
    try {
      setSideBarLoading(load);
      const res = await fetch(
        "https://webexback-06cc.onrender.com/api/chats/getGroupsAndUsersInteracted",
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
        setChatsLoaded(true);
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
  if (!chats || chats.length === 0) return;

  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Only update draft flag without overwriting logged_in_status or others
  const updatedChats = chats.map((chat) => {
    const key = `chat_input_${chat.id}_type_${chat.type}`;
    const savedDraft = localStorage.getItem(key);

    const draft = savedDraft && stripHtml(savedDraft).trim() !== "";

    if (chat.draft === draft) return chat; // no change

    return { ...chat, draft };
  });

  // Check if any update happened
  const hasChanges = updatedChats.some(
    (chat, i) => chat.draft !== chats[i].draft
  );

  if (hasChanges) setChats(updatedChats);
}, [chats]);

function updateFaviconWithCount(count) {
  const originalFaviconPath = faviconimg; // your favicon image path

  if (count == 0) {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = originalFaviconPath;
    document.head.appendChild(link);
    return;
  }

  const favicon = new Image();
  favicon.src = faviconimg; // Your favicon path

  favicon.onload = () => {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(favicon, 0, 0, size, size);

    if (count > 0) {
      // Draw red circle
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(size - 12, 12, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw count text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(count > 99 ? '99+' : count.toString(), size - 12, 12);
    }

    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');

    document.head.appendChild(link);
  };
}

useEffect(() => {
  const updatedChats = chats.map(chat => {
    if (
      selectedUser &&
      selectedUser.id == chat.id &&
      selectedUser.type == chat.type &&
      chat.unread_count > 0
    ) {
      return { ...chat, unread_count: 0 }; // reset unread count
    }
    return chat;
  });

  const unreadCount = updatedChats.reduce(
    (acc, chat) => acc + (chat.unread_count || 0),
    0
  );

  if (unreadCount > 0) {
    document.title = `(${unreadCount}) New Messages`;
    updateFaviconWithCount(unreadCount);
  } else {
    document.title = 'CCP';
    updateFaviconWithCount(0); // optional: reset badge
  }

}, [chats, selectedUser]);



  useEffect(() => {
    fetchChats(true);
  }, [view_user_id]);

  useEffect(() => {
    if (!selectedUser) return;

    const foundChat = chats.find(
        chat =>
            chat.id == selectedUser.id &&
            chat.type === selectedUser.type
    );

    if (foundChat) {

        // Optional: update read_status if needed
        if (foundChat.read_status != 0) {
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.id == foundChat.id && chat.type === foundChat.type
                        ? { ...chat, read_status: 0 }
                        : chat
                )
            );
        }
    }
}, [selectedUser, chats]);

  useEffect(() => {
    onSelect(null);
  }, [view_user_id]);

  

  const sendNotification = (title, message) => {
    if (window.electronAPI) {
      window.electronAPI.notify(title, message);
    } else {
      console.warn("electron api not found");
    }
  };

  useEffect(() => {
    connectSocket(user?.id);
    const socket = getSocket();

    const handleIncomingold = (msgOrReply, isReply = false) => {
      if (!msgOrReply) return;
      if (!chatsLoaded) return;

      const msg = isReply ? msgOrReply : msgOrReply; // No need for msgOrReply.reply

      if (!msg || !msg.sender_id || !msg.receiver_id) {
        console.warn("Malformed message or reply:", msgOrReply);
        return;
      }

      const otherUserId =
        msg.sender_id == user?.id ? msg.receiver_id : msg.sender_id;

        

      console.log("otherUserId", otherUserId);

      const isRelevant =
        msg.user_type === "group"
          ? (() => {
              console.log("Checking group message:", msg);

              console.log("Available chats:", chats);

              const matchingChat = chats.find(
                (chat) => chat.id == msg.receiver_id && chat.type === "group"
              );

              console.log("Matched group chat:", matchingChat);

              return !!matchingChat;
            })()
          : msg.sender_id == user?.id || msg.receiver_id == user?.id;

      console.log("isRelevant", isRelevant);

      if (!isRelevant) {
        return;
      }

      
        
      setChats((prevChats) => {
        const index = prevChats.findIndex(
          (chat) => chat.id == otherUserId && chat.type == msg.user_type // match type
        );

        if (index == -1) {
          fetchChats(false);
          return prevChats;
        }

        const isSameAsSelected =
    selectedUser &&
    selectedUser.id == otherUserId &&
    selectedUser.type == msg.user_type;

    if(msg.sender_id != user?.id){
      try {
        console.log("music Playing")
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } catch (e) {
          console.warn("Notification sound playback failed:", e);
        }
    }

        const updatedChats = [...prevChats];
        updatedChats[index] = {
          ...updatedChats[index],
          last_interacted_time: new Date().toISOString(),
          read_status:
            msg.sender_id != user?.id && selectedUser?.id != msg.sender_id
              ? 1
              : 0,
          unread_count: isSameAsSelected
      ? updatedChats[index]?.unread_count || 0 
      : (updatedChats[index]?.unread_count || 0) + 1,
          is_mentioned:
            Array.isArray(msg.mentioned_users) &&
            msg.mentioned_users.includes(user?.id),
        };

        const updated = updatedChats.splice(index, 1)[0];
        updatedChats.unshift(updated);

        return updatedChats;
      });
    };
    const handleIncoming = (msgOrReply, isReply = false) => {
      if (!msgOrReply) return;
      if (!chatsLoaded) return;

      const msg = isReply ? msgOrReply : msgOrReply; // No need for msgOrReply.reply

      if (!msg || !msg.sender_id || !msg.receiver_id) {
        console.warn("Malformed message or reply:", msgOrReply);
        return;
      }

      
        const otherUserId = msg.user_type === "group" ? msg.receiver_id : 
  (msg.sender_id == user?.id ? msg.receiver_id : msg.sender_id);
  const otherChatType = msg.user_type === "group" ? "group" : "user";



        

      console.log("otherUserId", otherUserId);

      const isRelevant =
        msg.user_type === "group"
          ? (() => {
              console.log("Checking group message:", msg);

              console.log("Available chats:", chats);

              const matchingChat = chats.find(
                (chat) => chat.id == otherUserId && chat.type === otherChatType
              );

              console.log("Matched group chat:", matchingChat);

              return !!matchingChat;
            })()
          : msg.sender_id == user?.id || msg.receiver_id == user?.id;

      console.log("isRelevant", isRelevant);

      if (!isRelevant) {
        return;
      }

      
        
      setChats((prevChats) => {
        const index = prevChats.findIndex(
          (chat) => chat.id == otherUserId && chat.type == msg.user_type // match type
        );

        if (index == -1) {
          fetchChats(false);
          return prevChats;
        }

        const isSameAsSelected =
    selectedUser &&
    selectedUser.id == otherUserId &&
    selectedUser.type == msg.user_type;

    if(msg.sender_id != user?.id){
      try {
        console.log("music Playing")
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } catch (e) {
          console.warn("Notification sound playback failed:", e);
        }
    }

        const updatedChats = [...prevChats];
        updatedChats[index] = {
          ...updatedChats[index],
          last_interacted_time: new Date().toISOString(),
          read_status:
            msg.sender_id != user?.id && selectedUser?.id != msg.sender_id
              ? 1
              : 0,
          unread_count: isSameAsSelected
      ? updatedChats[index]?.unread_count || 0 
      : (updatedChats[index]?.unread_count || 0) + 1,
          is_mentioned:
            Array.isArray(msg.mentioned_users) &&
            msg.mentioned_users.includes(user?.id),
        };

        const updated = updatedChats.splice(index, 1)[0];
        updatedChats.unshift(updated);

        return updatedChats;
      });
    };

    const handleNewMessageSidebar = (msg) => handleIncoming(msg, false);
    

    socket.off("new_message", handleNewMessageSidebar);
    socket.on("new_message", handleNewMessageSidebar);

    socket.off("new_reply", handleNewMessageSidebar);
    socket.on("new_reply", handleNewMessageSidebar);

    return () => {
      socket.off("new_message", handleNewMessageSidebar);
      socket.off("new_reply", handleNewMessageSidebar);
    };
  }, [user?.id, chatsLoaded, selectedUser]);

  useEffect(() => {
  if (!user || !chats) return;

  connectSocket(user.id);
  const socket = getSocket();

  const handleUserLoggedIn = (loggedInUser) => {

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (
          chat.type === "user" &&
          chat.id == loggedInUser.id // or chat.userId depending on your structure
        ) {
          return { ...chat, logged_in_status: true };
        }
        return chat;
      })
    );
  };

  socket.on("connect", () => {
    socket.emit("user_loggedin", user);
  });

  socket.on("user_loggedin", handleUserLoggedIn);

  return () => {
    socket.off("user_loggedin", handleUserLoggedIn);
  };
}, [user, chats]);



  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const unreadCount = useMemo(() => {
    return chats.filter(chat => chat.read_status === 1).length;
  }, [chats]);

  const filteredResult = useMemo(() => {
    if (!chats || chats.length ==0 || !user) return [];

    const filtered = chats.filter((chat) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "direct" && chat.type === "user") ||
        (activeTab === "group" && chat.type === "group") ||
        (activeTab === "unread" && chat.read_status === 1);

      const matchesSearch = chat.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });

    if (activeTab === "all") {
      const favourites = [];
      const others = [];
      const uniqueMap = new Map();

      filtered.forEach((chat) => {
        const key = `${chat.type}-${chat.id}`;
        if (!uniqueMap.has(key)) uniqueMap.set(key, chat);
      });

      const uniqueFiltered = Array.from(uniqueMap.values());

      uniqueFiltered.forEach((chat) => {
        const favs = JSON.parse(chat.favourites || "[]");
        if (Array.isArray(favs) && favs.includes(user.id)) {
          favourites.push(chat);
        } else {
          others.push(chat);
        }
      });

      return [...favourites, ...others];
    } else {
      return filtered;
    }
  }, [chats, activeTab, searchQuery, user?.id]);

  // Update filteredData only if changed
  useEffect(() => {
    setFilteredData((prev) => {
      if (isEqual(prev, filteredResult)) {
        return prev;
      }
      return filteredResult;
    });
  }, [filteredResult]);

 

  
  useEffect(() => {
    connectSocket(user?.id);
    const socket = getSocket();

    socket.on("favouriteUpdated", ({ id, favourites, type }) => {
      console.log("favouriteUpdated", id, favourites, type);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id == id && chat.type == type
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
    connectSocket(user?.id);
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

  

const [sidebarWidth, setSidebarWidth] = useState(300);
const [isResizing, setIsResizing] = useState(false);
const resizeRef = useRef({
  startX: 0,
  startWidth: 300,
});

const handleMouseDown = (e) => {
  resizeRef.current.startX = e.clientX;
  resizeRef.current.startWidth = sidebarWidth;
  setIsResizing(true);
  document.body.style.cursor = "col-resize";
  
};

useEffect(() => {
  const handleMouseMove = (e) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeRef.current.startX;
      const newWidth = resizeRef.current.startWidth + deltaX;
      if (newWidth >= 250 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
     document.body.style.cursor = "default";
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };
}, [isResizing]);



  return (
    <div
      className={` ${theme == "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}  py-4 px-1 relative select-none  overflow-hidden m-2 ${
        messageLoading ? "cursor-wait pointer-events-none cur-wait" : ""
      }`}
      style={{ width: `${sidebarWidth}px`, minWidth: '300px', maxWidth: '600px' }}
    >
      <div
    onMouseDown={handleMouseDown}
    className="absolute top-0 right-0 h-full w-0.5 cursor-col-resize z-10 bg-[#2d2e5291] hover:bg-orange-300 hover:w-1"
  ></div>

      <div className="px-2  border-b mb-2">
        
        <h1
          className="text-2xl font-bold flex items-center justify-between cursor-pointer"
          
        >
          {" "}

          {view_user_name && (
          <div className="flex items-center gap-2  rounded f-11">
            Chats of{" "}
            <div
            data-tooltip-id="my-tooltip"
            data-tooltip-content={view_user_name}
            >
              <span className="flex items-center bg-orange-300 px-1 h-5  rounded">
              <UserCircle className="mr-1" size={13} />
              {view_user_name?.length > 8 
                ? `${view_user_name.slice(0, 8)}...` 
                : view_user_name}

            </span>
            </div>
          </div>
        )}
        </h1>
        
        <div className="flex items-center gap-2 mb-3 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Filter Groups, Persons"
            className={`p-2 py-1 border rounded-md w-full mb-2 text-black`}
          />
          
          {view_user_name && (
            <button 
            data-tooltip-id="my-tooltip"
            data-tooltip-content="back"
            onClick={()=>{navigate('/chat')}}
            className="flex items-center bg-red-400 text-white p-1 rounded hover:bg-red-500">
            <ArrowLeft size={13} />
          </button>
          )}
        </div>

        <div className="flex items-center justify-start gap-2 mb-3 mt-2">
           {["all", "direct", "group", ...(unreadCount > 0 ? ["unread"] : [])].map((tab) => {
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            const Icon =
              tab === "direct" ? User : 
              tab === "group" ? Users2 : 
              tab === "unread" ? MessageCircle : Users;
            
            const showCount = tab === "unread" && unreadCount > 0;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center ${tab == "unread" ? "" : "gap-1"} px-2 py-1 rounded f-11 relative ${
                  activeTab === tab
                    ? "bg-orange-500 text-white font-semibold border border-orange-500"
                    : "text-gray-400 border border-orange-500  hover:bg-orange-500 hover:text-white"
                }`}
              >
                <Icon size={tab == "unread" ? 16 : 12} />
                <div
                data-tooltip-id="my-tooltip"
                data-tooltip-content={label == "Unread" ? 'Unread Messages' : ''}
                >
                {label == "Unread" ? null : label}
                </div>
                {showCount && (
                  <span className="bg-red-500 text-white f-11 rounded-full w-5 h-5 flex items-center justify-center absolute top-[-10px] right-[-8px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-2 m-list-h overflow-y-hidden">
        {sideBarLoading ? (
          <div className="mx-auto flex justify-center w-full">
            <ScaleLoader
              className="mx-auto"
              color="#ea580c"
              height={14}
              width={3}
              radius={2}
              margin={2}
            />
          </div>
        ) : (
          <>
            {activeTab === "all" &&
              filteredData.some((chat) =>
                JSON.parse(chat.favourites || "[]").includes(user.id)
              ) && <div className="text-gray-600 mb-2 px-0">Favourites</div>}

            {filteredData.map((chat, idx) => {
              const isFavourite = JSON.parse(chat.favourites || "[]").includes(
                user.id
              );
              const nextChat = filteredData[idx + 1];
              const isLastFavourite =
                isFavourite &&
                (!nextChat ||
                  !JSON.parse(nextChat.favourites || "[]").includes(user.id));

              const ChatContent = (
                <div
                  onClick={() => {
                    onSelect(chat);
                    const updatedChats = chats.map((c) => {
                      if (c.id === chat.id && c.type === chat.type) {
                        return { ...c, read_status: 0, unread_count:0, is_mentioned: false, };
                      }
                      return c;
                    });
                    setChats(updatedChats);
                  }}
                  className={`flex items-center justify-between space-x-2 p-2 relative rounded-full cursor-pointer   mb-1 overflow-hidden ${
                    (selectedUser?.id === chat.id && selectedUser?.type == chat.type) ? "bg-gray-300 text-black" : ""
                  } ${chat.read_status === 1 ? "font-bold" : ""}
                  ${
                    theme == "dark"
                      ? "hover:bg-gray-600 hover:text-gray-100"
                      : "hover:bg-gray-300 hover:text-black"
                  }
                  `}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center relative">
                      {chat.profile_pic ? (
                        <img
                          src={"https://rapidcollaborate.in/ccp" + chat.profile_pic}
                          alt="Profile"
                          className="w-8 h-8 rounded-full mx-auto object-cover border"
                        />
                      ) : (
                        chat.name[0]
                      )}
                      {onlineUserIds.includes(chat.id) && chat.type == "user" &&  (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                      )}
                    </div>
                    <span
                      className={`truncate  w-100 ${
                        chat.logged_in_status === true ||
                        chat.logged_in_status === null
                          ? ""
                          : "text-red-500"
                      }`}
                    >
                      {(chat.id == user?.id && chat.type == "user") ? chat.name+ " (You)" : chat.name}
                    </span>
                    {isFavourite && (
                      <Star
                        size={13}
                        className="fill-yellow-500 text-yellow-500"
                      />
                    )}
                    {chat.draft && (
                      <span className="text-xs text-gray-500 italic">
                        Draft
                      </span>
                    )}
                  </div>
                  {chat.read_status == 1 && (
                    <div className="flex items-center space-x-1 absolute right-2 bg-white p-2 rounded-full">
                      <div className="w-4 h-4 bg-orange-500 text-white rounded-full  flex items-center justify-center f-11 p-1">
                        {chat.unread_count ?? 1}
                      </div>
                      {chat.is_mentioned && (
                        <AtSign className="text-orange-500" size={16} />
                      )}
                    </div>
                  )}
                </div>
              );

              return (
                <React.Fragment key={`${chat.id}-${chat.type}`}>
                  {ChatContent}
                  {activeTab === "all" && isLastFavourite && (
                    <div className="border-b border-gray-300 mb-1 mx-1"></div>
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>

      
    </div>
  );
};

export default ChatSidebar;
