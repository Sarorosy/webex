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
  X,
  Circle,
  CircleMinus,
  Volume2,
  Cake,
  RefreshCcw,
  Ban,
} from "lucide-react"; // Lucide icons
import { useAuth } from "../../utils/idb";
import {
  getSocket,
  connectSocket,
  subscribeToSocketReconnect,
} from "../../utils/Socket";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import logo from "../../assets/ccp-logo.png";
import isEqual from "lodash.isequal";
import faviconimg from "../../assets/ccp-fav.png"; // Path to your favicon image
// import notificationsound from "../../assets/notification-sound.mp3";
import notificationsound from "../../assets/new-notification.wav";
import TotalSearch from "./TotalSearch";
import axios from "axios";

const ChatSidebar = ({
  view_user_id,
  view_user_name,
  selectedUser,
  onSelect,
  notificationClickUser,
  setNotificationClickUser,
  sidebarWidth,
  setIsMentioned,
  setNewMessages,
  setTaggedMessages,
}) => {
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const { selectedStatus, setSelectedStatus } = useSelectedUser();
  const { selectedGroupForStatus, setSelectedGroupForStatus } =
    useSelectedUser();
  const { searchOpen, setSearchOpen } = useSelectedUser();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [userGroups, setUserGroups] = useState([]);

  const chatsRef = useRef([]);
  useEffect(() => {
    chatsRef.current = chats;
    console.log(chats);
  }, [chats]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!chats || chats.length === 0) return;

      const stripHtml = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
      };

      const updatedChats = chats.map((chat) => {
        const key = `chat_input_${chat.id}_type_${chat.type}`;
        const savedDraft = localStorage.getItem(key);

        const draft = savedDraft && stripHtml(savedDraft).trim() !== "";

        if (chat.draft === draft) return chat; // no change

        return { ...chat, draft };
      });

      const hasChanges = updatedChats.some(
        (chat, i) => chat.draft !== chats[i].draft
      );

      if (hasChanges) setChats(updatedChats);
    }, 500); // every 1.5 seconds

    return () => clearInterval(interval); // clean up on unmount
  }, [chats]);

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
        fetchChats(false);
      }
    };

    const handleGroupDeleted = (data) => {
      console.log(data);
      setChats((prevChats) =>
        prevChats.filter(
          (chat) => !(chat.id == data.group_id && chat.type === "group")
        )
      );

      if (selectedUser?.id == data.group_id && selectedUser?.type === "group") {
        onSelect(null);
      }
    };

    const handleOnlineUsers = (userIds) => {
      setOnlineUserIds(userIds); // userIds is assumed to be an array from server
    };

    const handlePrimaryUserUpdated = ({ group_id, user_id }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id == group_id && chat.type === "group") {
            return {
              ...chat,
              primary_user: user_id,
            };
          }
          return chat;
        })
      );
    };

    socket.on("group_left", handleGroupLeft);
    socket.on("group_updated", handleGroupUpdated);
    // socket.on("group_created", handleGroupCreated);
    socket.on("group_deleted", handleGroupDeleted);
    socket.on("online-users", handleOnlineUsers);
    socket.on("primary_user_updated", handlePrimaryUserUpdated);

    return () => {
      socket.off("group_left", handleGroupLeft);
      socket.off("group_updated", handleGroupUpdated);
      // socket.off("group_created", handleGroupCreated);
      socket.off("group_deleted", handleGroupDeleted);
      socket.off("online-users", handleOnlineUsers);
      socket.off("primary_user_updated", handlePrimaryUserUpdated);
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
    if (
      notificationClickUser?.id &&
      notificationClickUser?.type &&
      chats.length > 0
    ) {
      const matchedChat = chats.find(
        (chat) =>
          chat.id == notificationClickUser.id &&
          chat.type == notificationClickUser.type
      );

      if (matchedChat) {
        onSelect(matchedChat); // simulate click

        const socket = getSocket();
        socket.emit("read_message_socket", {
          user_id: user.id,
          message_ids: matchedChat.unread_message_ids,
          receiver_id: 0,
          user_type: matchedChat.type,
        });

        setNewMessages(matchedChat.unread_message_ids ?? []);
        setTaggedMessages(matchedChat.tagged_message_ids ?? []);

        const updatedChats = chats.map((c) => {
          if (c.id == matchedChat.id && c.type == matchedChat.type) {
            return {
              ...c,
              read_status: 0,
              unread_count: 0,
              is_mentioned: false,
              is_all: false,
              unread_message_ids: [],
              tagged_message_ids: [],
            };
          }
          return c;
        });

        setChats(updatedChats);
        setNotificationClickUser(null);
      }
    }
  }, [notificationClickUser, setNotificationClickUser, chats]);

  const [sideBarLoading, setSideBarLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchChats = async (load = true, isSyncing = false) => {
    try {
      setSideBarLoading(load);
      setSyncing(isSyncing);

      const userId = view_user_id ? view_user_id : user.id;

      const [interactionsRes, unreadRes] = await Promise.all([
        fetch(
          "https://webexback-06cc.onrender.com/api/chats/getUserAndGroupInteractions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        ),
        fetch(
          "https://webexback-06cc.onrender.com/api/chats/getUnreadMessageCounts",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        ),
      ]);

      const interactionsData = await interactionsRes.json();
      const unreadData = await unreadRes.json();

      if (interactionsData.status && unreadData.status) {
        const { users, groups } = interactionsData.data;
        const unreadCounts = unreadData.data;

        const unreadMap = new Map();
        unreadCounts.forEach((item) => {
          unreadMap.set(item.type + "_" + item.id, item);
        });

        // Attach unread info to users
        users.forEach((user) => {
          const key = "user_" + user.id;
          const unreadInfo = unreadMap.get(key);
          user.read_status = unreadInfo ? 1 : 0;
          user.unread_count = unreadInfo ? unreadInfo.unread_count : 0;
          user.unread_message_ids = unreadInfo
            ? unreadInfo.unread_message_ids
            : [];
          user.is_mentioned = unreadInfo
            ? Boolean(unreadInfo.is_mentioned)
            : false;
          user.tagged_message_ids = unreadInfo
            ? unreadInfo.tagged_message_ids
            : [];
          user.is_all = unreadInfo ? Boolean(unreadInfo.is_all) : false;
          if (unreadInfo) user.last_message_id = unreadInfo.last_message_id;
        });

        // Attach unread info to groups (interaction groups + groupDetails merged)
        // Merge group details into groupInteractions first (by id)
        const groupMap = new Map();
        groups.forEach((g) => groupMap.set(g.id, g));
        // groupDetails.forEach((gd) => {
        //   if (!groupMap.has(gd.id)) groupMap.set(gd.id, gd);
        //   else groupMap.set(gd.id, { ...groupMap.get(gd.id), ...gd });
        // });

        const mergedGroups = Array.from(groupMap.values());

        mergedGroups.forEach((group) => {
          const key = "group_" + group.id;
          const unreadInfo = unreadMap.get(key);
          group.read_status = unreadInfo ? 1 : 0;
          group.unread_count = unreadInfo ? unreadInfo.unread_count : 0;
          group.unread_message_ids = unreadInfo
            ? unreadInfo.unread_message_ids
            : [];
          group.is_mentioned = unreadInfo
            ? Boolean(unreadInfo.is_mentioned)
            : false;
          group.tagged_message_ids = unreadInfo
            ? unreadInfo.tagged_message_ids
            : [];
          group.is_all = unreadInfo ? Boolean(unreadInfo.is_all) : false;
          if (unreadInfo) group.last_message_id = unreadInfo.last_message_id;

          try {
            group.status = JSON.parse(group.status || "[]");
          } catch {
            group.status = [];
          }
          group.is_status = group.is_status ? 1 : 0;
          group.status_count = parseInt(group.status_count) || 0;
        });

        // Combine users + merged groups
        const combined = [...users, ...mergedGroups];

        // Sort by last_interacted_time desc
        combined.sort(
          (a, b) =>
            new Date(b.last_interacted_time || 0) -
            new Date(a.last_interacted_time || 0)
        );

        setChats(combined);
        updateChatLoginStatus(combined);
        setChatsLoaded(true);
      } else {
        console.error("Error fetching data");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setSideBarLoading(false);
      setSyncing(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        `https://webexback-06cc.onrender.com/api/groups/user-present-groups-only/${user?.id}`
      );

      // Filter only groups where is_present === true
      const presentGroups = (res.data.groups || []).filter(
        (group) => group.is_present === true
      );

      setUserGroups(presentGroups);
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  const updateChatLoginStatus = async (chatList) => {
    try {
      const updatedChats = await Promise.all(
        chatList.map(async (chat) => {
          let logged_in_status = true;
          let is_birthday = false;

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

                if (result.is_birthday && result.is_birthday == true) {
                  is_birthday = true;
                }
              }
            } catch (err) {
              console.error("Error checking status for", chat.email, err);
            }
          }

          return {
            ...chat,
            logged_in_status,
            is_birthday,
          };
        })
      );

      setChats(updatedChats); // now safely update state
    } catch (err) {
      console.error("Error updating login status:", err);
    }
  };

  function updateFaviconWithCount(count) {
    const originalFaviconPath = faviconimg; // your favicon image path

    if (count == 0) {
      const link =
        document.querySelector("link[rel~='icon']") ||
        document.createElement("link");
      link.rel = "icon";
      link.href = originalFaviconPath;
      document.head.appendChild(link);
      return;
    }

    const favicon = new Image();
    favicon.src = faviconimg; // Your favicon path

    favicon.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 64;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(favicon, 0, 0, size, size);

      if (count > 0) {
        // Draw red circle
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(size - 12, 12, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw count text
        ctx.fillStyle = "white";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(count > 99 ? "99+" : count.toString(), size - 12, 12);
      }

      const link =
        document.querySelector("link[rel~='icon']") ||
        document.createElement("link");
      link.rel = "icon";
      link.href = canvas.toDataURL("image/png");

      document.head.appendChild(link);
    };
  }

  useEffect(() => {
    const updatedChats = chats.map((chat) => {
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
      document.title = "CCP";
      updateFaviconWithCount(0); // optional: reset badge
    }
  }, [chats, selectedUser]);

  useEffect(() => {
    fetchChats(true);
    fetchGroups();
  }, [view_user_id]);

  useEffect(() => {
    if (!selectedUser) return;

    const foundChat = chats.find(
      (chat) => chat.id == selectedUser.id && chat.type === selectedUser.type
    );

    if (foundChat) {
      // Optional: update read_status if needed
      if (foundChat.read_status != 0) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
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

  useEffect(() => {
    connectSocket(user?.id);
    const socket = getSocket();

    const syncChats = () => {
      console.log("🔄 Reconnected: syncing chats and messages");
      fetchChats(false, true); // 👈 get latest chats
      fetchGroups();
      // You can also call message syncing API here (see below)
    };

    subscribeToSocketReconnect(syncChats);

    const handleIncoming = (msgOrReply, isReply = false) => {
      if (!msgOrReply) return;
      if (!chatsLoaded) return;

      const msg = isReply ? msgOrReply : msgOrReply; // No need for msgOrReply.reply
      // console.log(msg)

      if (!msg || !msg.sender_id || !msg.receiver_id) {
        console.warn("Malformed message or reply:", msgOrReply);
        return;
      }
      if (msg.is_history == 1) {
        return;
      }

      const otherUserId =
        msg.user_type === "group"
          ? msg.receiver_id
          : msg.sender_id == user?.id
          ? msg.receiver_id
          : msg.sender_id;
      const otherChatType = msg.user_type === "group" ? "group" : "user";

      console.log(`otherUserId- `, otherUserId);

      const isRelevant =
        msg.user_type === "group"
          ? (() => {
              // console.log("Available chats:", chats);

              const matchingChat = chatsRef.current.find(
                (chat) => chat.id == otherUserId && chat.type === otherChatType
              );

              // console.log("Matched group chat:", matchingChat);

              const groupExistsInUserGroups = userGroups.some(
                (group) => group.group_id == otherUserId
              );

              // If either matches, consider it relevant
              return !!matchingChat || groupExistsInUserGroups;
            })()
          : msg.sender_id == user?.id || msg.receiver_id == user?.id;

      console.log("isRelevant", isRelevant);

      if (!isRelevant) {
        return;
      }

      setChats((prevChats) => {
        const index = prevChats.findIndex(
          (chat) => chat.id == otherUserId && chat.type == otherChatType // match type
        );

        if (index == -1) {
          fetchChats(false);
          fetchGroups();
          return prevChats;
        }

        const isSameAsSelected =
          selectedUser &&
          selectedUser.id == otherUserId &&
          selectedUser.type == otherChatType;

        if (msg.sender_id != user?.id) {
          try {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } catch (e) {
            console.warn("Notification sound playback failed:", e);
          }
        }

        const updatedChats = [...prevChats];
        // console.log(msg);
        updatedChats[index] = {
          ...updatedChats[index],
          last_interacted_time: new Date().toISOString(),
          last_message: msg.message ?? null,
          last_message_deleted: 0,
          last_message_id: msg.id,
          read_status:
            msg.sender_id != user?.id && selectedUser?.id != msg.sender_id
              ? 1
              : 0,
          unread_count: isSameAsSelected
            ? updatedChats[index]?.unread_count || 0
            : (updatedChats[index]?.unread_count || 0) + 1,
          unread_message_ids: isSameAsSelected
            ? updatedChats[index]?.unread_message_ids || []
            : [...(updatedChats[index]?.unread_message_ids || []), msg.id],
          is_mentioned: isSameAsSelected
            ? updatedChats[index]?.is_mentioned
            : updatedChats[index]?.is_mentioned ||
              (Array.isArray(msg.mentioned_users) &&
                msg.mentioned_users.includes(user?.id)),

          tagged_message_ids: isSameAsSelected
            ? updatedChats[index]?.tagged_message_ids || []
            : Array.isArray(msg.mentioned_users) &&
              (msg.mentioned_users.includes(user?.id) ||
                msg.mentioned_users.includes("all"))
            ? [...(updatedChats[index]?.tagged_message_ids || []), msg.id]
            : updatedChats[index]?.tagged_message_ids || [],

          is_all: isSameAsSelected
            ? updatedChats[index]?.is_all
            : updatedChats[index]?.is_all ||
              (Array.isArray(msg.mentioned_users) &&
                msg.mentioned_users.includes("all")),
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

    const handleAvailabilityUpdated = ({ userId, availability_status }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.type === "user" && chat.id == userId) {
            return { ...chat, availability: availability_status };
          }
          return chat;
        })
      );
    };

    const handleGroupMembersAdded = ({ group_id, members }) => {
      if (members && members.includes(user?.id)) {
        console.log("fetching chats");
        fetchChats(false);
      }
    };

    const handleNewStatus = (incomingStatus) => {
      if (!incomingStatus || !incomingStatus.id) return;
      // Clone status data (ensures no mutation)
      const statusData = { ...incomingStatus };

      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          const chatIdStr = String(chat.id);
          const groupIdStr = String(statusData.group_id);

          if (chat.type === "group" && chatIdStr === groupIdStr) {
            const updatedStatuses = [...(chat.status || []), statusData];

            const updatedChat = {
              ...chat,
              is_status: 1,
              status_count: (chat.status_count || 0) + 1,
              status: updatedStatuses,
            };
            return updatedChat;
          }

          return chat;
        });

        return updatedChats;
      });
    };

    const handleStatusDeleted = ({ id, group_id }) => {
      if (!id || !group_id) return;

      console.log("Status dleted", id, group_id);

      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.type === "group" && String(chat.id) === String(group_id)) {
            // Step 1: Remove all invalid status objects (like { id: null })
            const validStatuses = (chat.status || []).filter(
              (s) => s?.id !== null && s?.id !== undefined
            );

            // Step 2: Remove the specific status by ID
            const updatedStatuses = validStatuses.filter(
              (status) => String(status.id) !== String(id)
            );

            console.log(updatedStatuses);

            return {
              ...chat,
              status: updatedStatuses,
              status_count:
                (chat.status_count || 0) > 0 ? chat.status_count - 1 : 0,
              is_status: updatedStatuses.length > 0 ? 1 : 0,
            };
          }
          return chat;
        });
      });
    };

    const handleChatOpened = ({ chatId, chatType, userId }) => {
      if (userId == user?.id) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === chatId && chat.type === chatType) {
              return {
                ...chat,
                read_status: 0,
                unread_count: 0,
                is_mentioned: false,
                is_all: false,
              };
            }
            return chat;
          })
        );
      }
    };

    const handleMessageDelete = (msgObj) => {
      const { msgId, type } = msgObj;

      // Update chats list if deleted message is the last message
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.last_message_id == msgId
            ? { ...chat, last_message_deleted: 1 }
            : chat
        )
      );
    };
    socket.on("connect", () => {
      socket.emit("user_loggedin", user);
    });

    socket.on("user_loggedin", handleUserLoggedIn);
    socket.on("availability_updated", handleAvailabilityUpdated);
    socket.on("group_members_added", handleGroupMembersAdded);
    socket.on("new_status", handleNewStatus);
    socket.on("status_deleted", handleStatusDeleted);
    socket.on("message_delete", handleMessageDelete);
    socket.on("chat_opened", handleChatOpened);

    return () => {
      socket.off("user_loggedin", handleUserLoggedIn);
      socket.off("availability_updated", handleAvailabilityUpdated);
      socket.off("group_members_added", handleGroupMembersAdded);
      socket.off("new_status", handleNewStatus);
      socket.off("status_deleted", handleStatusDeleted);
      socket.off("message_delete", handleMessageDelete);
      socket.off("chat_opened", handleChatOpened);
    };
  }, [user, chats]);

  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    let currentVersion = null;

    // Fetch current version on load
    fetch("/ccp/version.json")
      .then((res) => res.json())
      .then((data) => {
        currentVersion = data.version;
        console.log("current version", data.version);
      });

    const interval = setInterval(() => {
      fetch("/ccp/version.json", { cache: "no-store" }) // Avoid caching
        .then((res) => res.json())
        .then((data) => {
          if (currentVersion && data.version != currentVersion) {
            console.log("new version ", data.version);
            setHasUpdate(true);
            clearInterval(interval);
          }
        });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const unreadUserCount = useMemo(() => {
    return chats.filter(
      (chat) => chat.read_status === 1 && chat.type === "user"
    ).length;
  }, [chats]);

  const unreadGroupCount = useMemo(() => {
    return chats.filter(
      (chat) => chat.read_status === 1 && chat.type === "group"
    ).length;
  }, [chats]);

  const unreadCount = useMemo(() => {
    return chats.filter((chat) => chat.read_status === 1).length;
  }, [chats]);

  const unreadAtCount = useMemo(() => {
    return chats.filter(
      (chat) => chat.is_mentioned == true && chat.is_all == false
    ).length;
  }, [chats]);

  const unreadForAllCount = useMemo(() => {
    return chats.filter((chat) => chat.is_all == true).length;
  }, [chats]);

  const filteredResult = useMemo(() => {
    if (!chats || chats.length == 0 || !user) return [];

    const filtered = chats.filter((chat) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "direct" && chat.type === "user") ||
        (activeTab === "group" && chat.type === "group") ||
        (activeTab === "unread" && chat.read_status === 1) ||
        (activeTab === "@" &&
          chat.is_mentioned == true &&
          chat.is_all == false) ||
        (activeTab === "forall" && chat.is_all == true);

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
      if (selectedUser?.id === data.id && selectedUser?.type === "group") {
        setSelectedUser((prev) => ({
          ...prev,
          name: data.name,
          group: data.group,
          group_type: data.group_type,
        }));
      }

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id == data.id && chat.type === "group") {
            return {
              ...chat,
              name: data.name,
              group: data.group,
              group_type: data.group_type,
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
        // fetchChats(false);
        setChats((prevChats) => [group, ...prevChats]);
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

  const getPlainPreview = (html, limit = 30) => {
    if (!html) return "";

    // If HTML contains an <img> tag, return a default message
    if (/<img[\s\S]*?>/i.test(html)) {
      return "Sent an image";
    }

    const decoded = html
      .replace(/<[^>]*>/g, "") // Remove all HTML tags
      .replace(/&[a-z]+;/gi, " ") // Replace HTML entities like &nbsp;
      .trim(); // Remove leading/trailing spaces

    return decoded.slice(0, limit);
  };

  return (
    <div
      className={` ${
        theme == "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
      }  py-2 px-1 relative select-none  overflow-hidden  ${
        messageLoading ? "cursor-wait pointer-events-none cur-wait" : ""
      } sidebar-container ${
        selectedUser?.id ? "mobile-hide" : ""
      } transition-all duration-200 ease-in-out`}
      style={{
        width: `${sidebarWidth}px`,
        minWidth: "300px",
        maxWidth: "600px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className={`px-2 border-b mb-2
        ${theme == "dark" ? "border-gray-400" : ""}  
      `}
      >
        {hasUpdate && (
          <div className=" w-full bg-yellow-500 text-white text-center px-2 py-2 mb-1 flex">
            <RefreshCcw size={18} /> New updates are available. Please hard
            refresh (Ctrl + Shift + R)
          </div>
        )}
        {syncing && (
          <div
            className={`w-full backdrop-blur-md text-center px-4 py-1 mb-2 rounded-lg shadow-md flex items-center justify-center gap-2 animate-pulse ${
              theme === "dark"
                ? "bg-white/10 text-white border border-white/10"
                : "bg-black/10 text-black border border-black/10"
            }`}
          >
            <RefreshCcw size={18} className="animate-spin" />
            <span className="font-medium tracking-wide f-12">
              Back Online - Syncing Chats...
            </span>
          </div>
        )}

        <h1 className="text-2xl font-bold flex items-center justify-between cursor-pointer">
          {" "}
          {view_user_name && (
            <div className="w-full flex items-center justify-between gap-2  rounded f-11">
              <div className="flex items-center gap-2">
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
              <button
                data-tooltip-id="my-tooltip"
                data-tooltip-content="back"
                onClick={() => {
                  navigate("/chat");
                }}
                className="flex items-center bg-red-400 text-white p-1 rounded hover:bg-red-500"
              >
                <ArrowLeft size={13} />
              </button>
            </div>
          )}
        </h1>

        <div className="flex items-center gap-2 mb-3 w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Find Groups, Persons, Messages"
            className={`p-2 py-1 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent border border-gray-300
              ${theme == "dark" ? "bg-gray-800 border-gray-400" : ""}  
            `}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
              }}
              className="text-sm text-white bg-orange-600 px-1 py-1 rounded"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {searchQuery ? (
          <TotalSearch
            onClose={() => {
              setSearchOpen(false);
            }}
            query={searchQuery}
            setQuery={setSearchQuery}
          />
        ) : (
          <div className="flex items-center justify-start gap-2 mb-3 mt-2">
            {[
              "all",
              "direct",
              // "group",
              ...(unreadCount > 0 ? ["unread"] : []),
              ...(unreadAtCount > 0 ? ["@"] : []),
              ...(unreadForAllCount > 0 ? ["forall"] : []),
            ].map((tab) => {
              const label = tab.charAt(0).toUpperCase() + tab.slice(1);
              const Icon =
                tab === "direct"
                  ? User
                  : tab === "group"
                  ? Users2
                  : tab === "unread"
                  ? MessageCircle
                  : tab === "@"
                  ? AtSign
                  : tab === "forall"
                  ? Volume2
                  : Users;

              const showCount = tab === "unread" && unreadCount > 0;
              const showAtCount = tab == "@" && unreadAtCount > 0;
              const showForAllCount = tab == "forall" && unreadForAllCount > 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center ${
                    tab == "unread" ||
                    tab == "@" ||
                    tab == "forall" ||
                    tab == "direct" ||
                    tab == "group"
                      ? ""
                      : "gap-1"
                  } px-2 py-1 rounded f-11 relative ${
                    activeTab === tab
                      ? "bg-orange-500 text-white font-semibold border border-orange-500"
                      : "text-gray-400 border border-orange-500  hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  <Icon
                    size={
                      tab == "unread" ||
                      tab == "@" ||
                      tab == "forall" ||
                      tab == "direct" ||
                      tab == "group"
                        ? 16
                        : 12
                    }
                  />
                  <div
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={
                      label == "Unread" ? "Unread Messages" : ""
                    }
                  >
                    {label == "Unread" ||
                    label == "@" ||
                    label == "Forall" ||
                    label == "Direct" ||
                    label == "Group"
                      ? null
                      : label}
                  </div>
                  {tab === "direct" && unreadUserCount > 0 && (
                    <span className="user-count bg-red-500 text-white f-11 rounded-full w-5 h-5 flex items-center justify-center absolute top-[-10px] right-[-8px]">
                      {unreadUserCount}
                    </span>
                  )}
                  {tab === "group" && unreadGroupCount > 0 && (
                    <span className="group-count bg-red-500 text-white f-11 rounded-full w-5 h-5 flex items-center justify-center absolute top-[-10px] right-[-8px]">
                      {unreadGroupCount}
                    </span>
                  )}

                  {showCount && (
                    <span className="bg-red-500 text-white f-11 rounded-full w-5 h-5 flex items-center justify-center absolute top-[-10px] right-[-8px]">
                      {unreadCount}
                    </span>
                  )}
                  {showAtCount && (
                    <span className="bg-red-500 text-white f-11 rounded-full w-5 h-5 flex items-center justify-center absolute top-[-10px] right-[-8px]">
                      {unreadAtCount}
                    </span>
                  )}
                  {showForAllCount && (
                    <span className="bg-red-500 text-white f-11 rounded-full w-5 h-5 flex items-center justify-center absolute top-[-10px] right-[-8px]">
                      {unreadForAllCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
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
              ) && (
                <div
                  className={` mb-2 px-0 flex items-center
                  ${theme == "dark" ? "text-gray-300" : "text-gray-800"}
                `}
                >
                  Favourites
                  <Star
                    size={13}
                    className="fill-yellow-500 text-yellow-500 ml-1"
                  />
                </div>
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

              const ChatContent = (
                <>
                  <div
                    onClick={() => {
                      onSelect(chat);

                      chat.is_mentioned
                        ? setIsMentioned(true)
                        : setIsMentioned(false);

                      setNewMessages(chat.unread_message_ids ?? []);
                      setTaggedMessages(chat.tagged_message_ids ?? []);

                      const socket = getSocket();
                      socket.emit("chat_opened", {
                        chatId: chat.id,
                        chatType: chat.type,
                        userId: user.id,
                      });

                      socket.emit("read_message_socket", {
                        user_id: user.id,
                        message_ids: chat.unread_message_ids,
                        receiver_id: 0,
                        user_type: chat.type,
                      });

                      const updatedChats = chats.map((c) => {
                        if (c.id === chat.id && c.type === chat.type) {
                          return {
                            ...c,
                            read_status: 0,
                            unread_count: 0,
                            unread_message_ids: [],
                            tagged_message_ids: [],
                            is_mentioned: false,
                            is_all: false,
                          };
                        }
                        return c;
                      });
                      setChats(updatedChats);
                    }}
                    className={`flex items-center justify-between space-x-2 p-2 relative rounded-full cursor-pointer mb-1 overflow-hidden
                    ${
                      selectedUser?.id === chat.id &&
                      selectedUser?.type === chat.type
                        ? theme === "dark"
                          ? "bg-gray-600 text-white"
                          : "bg-gray-300 text-black"
                        : ""
                    }
                    ${chat.read_status === 1 ? "font-bold" : ""}
                    ${
                      theme === "dark"
                        ? "hover:bg-gray-600 hover:text-white text-gray-300"
                        : "hover:bg-gray-300 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div>
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center relative">
                          <div
                            className={`relative w-8 h-8 flex items-center justify-center rounded-full
    ${
      chat.type === "group" &&
      chat.is_status === 1 &&
      Array.isArray(chat.status) &&
      chat.status.some((s) => s?.id !== null && s?.id !== undefined)
        ? "border-2 border-blue-500 cursor-pointer"
        : ""
    }
  `}
                            onClick={(e) => {
                              if (
                                chat.type === "group" &&
                                chat.is_status === 1
                              ) {
                                const validStatuses = (
                                  chat.status || []
                                ).filter(
                                  (s) => s?.id !== null && s?.id !== undefined
                                );

                                if (validStatuses.length > 0) {
                                  e.stopPropagation();
                                  setSelectedStatus(validStatuses);
                                  setSelectedGroupForStatus(chat.id);
                                }
                              }
                            }}
                          >
                            {chat.profile_pic ? (
                              <img
                                src={
                                  chat.profile_pic.startsWith("http")
                                    ? chat.profile_pic
                                    : `https://rapidcollaborate.in/ccp${chat.profile_pic}`
                                }
                                loading="lazy"
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm">
                                {chat.name[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          {onlineUserIds.includes(chat.id) &&
                            !chat.availability &&
                            chat.type == "user" && (
                              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                            )}
                          {chat.availability &&
                            chat.availability == "busy" &&
                            chat.type == "user" && (
                              <span
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Busy"
                                className="absolute bottom-0 right-0 bg-white "
                              >
                                <Circle
                                  size={8}
                                  strokeWidth={6}
                                  className="text-red-600"
                                />
                              </span>
                            )}
                          {chat.availability &&
                            chat.availability == "dnd" &&
                            chat.type == "user" && (
                              <span
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Do Not Disturb"
                                className="absolute bottom-0 right-0 bg-white "
                              >
                                <CircleMinus
                                  size={8}
                                  strokeWidth={6}
                                  className="text-red-600"
                                />
                              </span>
                            )}

                          {chat.type === "group" &&
                            chat.is_status === 1 &&
                            Array.isArray(chat.status) &&
                            chat.status.some(
                              (s) => s?.id !== null && s?.id !== undefined
                            ) && (
                              <span
                                className="absolute top-0 -right-1 w-3 h-3 border-2 border-white rounded-full bg-blue-600 cursor-pointer z-10"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent parent's onClick
                                  const validStatuses = (
                                    chat.status || []
                                  ).filter(
                                    (s) => s?.id !== null && s?.id !== undefined
                                  );

                                  if (validStatuses.length > 0) {
                                    setSelectedStatus(validStatuses);
                                    setSelectedGroupForStatus(chat.id);
                                  }
                                }}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Group has an announcement"
                              />
                            )}
                        </div>
                      </div>
                      <span
                        className={`truncate  w-100 ${
                          chat.logged_in_status === true ||
                          chat.logged_in_status === null
                            ? ""
                            : "text-red-500"
                        }`}
                      >
                        {chat.id == user?.id && chat.type == "user"
                          ? chat.name + " (You)"
                          : chat.name}
                        <p
                          title={
                            chat.last_message_deleted == 1
                              ? "message deleted"
                              : getPlainPreview(
                                  chat.last_message,
                                  100000000000000
                                )
                          }
                          className={`f-10 ${
                            theme == "light" ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {chat.last_message_deleted == 1 ? (
                            <p className="flex items-center">
                              <Ban size={8} className="mr-1" /> message deleted{" "}
                            </p>
                          ) : (
                            getPlainPreview(chat.last_message)
                          )}
                        </p>
                      </span>

                      {chat.draft && (
                        <span className="text-xs text-gray-500 italic">
                          Draft
                        </span>
                      )}
                      {chat.is_birthday && (
                        <span className="text-xs text-gray-500 italic bday-badge">
                          <Cake
                            className={`${
                              theme == "dark"
                                ? "text-pink-300"
                                : "text-pink-700"
                            }`}
                            size={19}
                          />
                        </span>
                      )}
                    </div>
                    {chat.read_status == 1 && (
                      <div className="flex items-center space-x-1 absolute right-2 bg-white p-1 rounded-full">
                        <div className="w-4 h-4 bg-orange-500 text-white rounded-full  flex items-center justify-center text-[9px] p-1">
                          {chat.unread_count ?? 1}
                        </div>
                        {chat.is_mentioned && !chat.is_all && (
                          <AtSign className="text-orange-500" size={16} />
                        )}
                        {chat.is_all && (
                          <Volume2 className="text-orange-500" size={16} />
                        )}
                      </div>
                    )}
                  </div>
                </>
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
