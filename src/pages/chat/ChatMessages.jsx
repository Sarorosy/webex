import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../utils/idb";
import { getSocket, connectSocket } from "../../utils/Socket";
import toast from "react-hot-toast";
import {
  BellDot,
  Pen,
  Pin,
  Reply,
  ArrowDown,
  Trash2,
  MessageSquare,
  Clock,
  FileText,
  ImageIcon,
  VideoIcon,
  FileSpreadsheet,
  PlayCircle,
  Smile,
  QuoteIcon,
  Copy,
  ArrowRight,
  ChevronUp,
  CircleCheckBig,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import EditModal from "./EditModal";
import ReadPersons from "./ReadPersons";
import ReminderModal from "./ReminderModal";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import FileModal from "../../components/FileModal";
import TypingIndicator from "./TypingIndicator";
import PollResults from "../../components/PollResults";
import AddTask from "../looptask/AddTask";

const ChatMessages = ({
  view_user_id,
  userId,
  userType,
  isReply,
  replyMsgId,
  setIsReply,
  setReplyMsgId,
  setReplyMessage,
  selectedQuoteMessage,
  setSelectedQuoteMessage,
  scrollToBottom,
  containerRef,
  isTyping,
  ismentioned,
  newMessages,
}) => {
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const { selectedMessage, setSelectedMessage } = useSelectedUser();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const [messages, setMessages] = useState([]);
  const [skip, setSkip] = useState(messages.length);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [emojiPopupLocked, setEmojiPopupLocked] = useState(false);
  const [hoveredReplyMessageId, setHoveredReplyMessageId] = useState(null);
  const [latestMessageId, setLatestMessageId] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);
  const [hasFetchedInitially, setHasFetchedInitially] = useState(false);

  const isFetchingRef = useRef(false);
  const messageRefs = useRef({});
  const { user, theme } = useAuth();
  const topSentinelRef = useRef(null);
  const hasMoreRef = useRef(true);

  const limit = 10;

  useEffect(() => {
    setLatestMessageId(null);
  }, [view_user_id, userId, userType]);

  const fetchMessages = async (skipCount = 0) => {
    // console.log("Fetching with skip:", skipCount);
    if (isFetchingRef.current) return [];
    // if(!hasMore) return [];

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setMessageLoading(true);

      const res = await fetch(
        `https://webexback-06cc.onrender.com/api/chats/messagesnew?sender_id=${
          view_user_id ?? user.id
        }&receiver_id=${userId}&skip=${skipCount}&limit=${limit}&user_type=${userType}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();
      const reversedData = data.reverse();

      // console.log(reversedData);

      if (reversedData.length > 0) {
        let maxId = 0;
        let latestMsg = null;

        reversedData.forEach((msg) => {
          // check the main message ID
          if (msg.id > maxId) {
            maxId = msg.id;
            latestMsg = msg;
          }

          // check replies if any
          if (msg.replies && Array.isArray(msg.replies)) {
            msg.replies.forEach((reply) => {
              if (reply.id > maxId) {
                maxId = reply.id;
                latestMsg = reply;
              }
            });
          }
        });
        if (maxId > (latestMessageId ?? 0)) {
          setLatestMessageId(maxId);
          setLatestMessage(latestMsg);
        }
      }

      return reversedData;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setMessageLoading(false);
    }
  };

  useEffect(() => {
    // console.log("latest msg id", latestMessageId);
  }, [latestMessageId]);

  const [openFileModal, setOpenFileModal] = useState(null);
  const proseRef = useRef(null); // your container

  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (event.target.tagName === "IMG" && event.target.closest(".prose")) {
        setOpenFileModal({
          url: event.target.src,
          name: "no-name.png",
        });
      }
    };

    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log("mounted", isMounted);
    const loadInitialMessages = async () => {
      if (!isMounted || messages.length > 0) return;

      const initialMessages = await fetchMessages(messages.length);
      // setMessages(initialMessages);
      setMessages((prev) => {
        // Filter out any initial messages that already exist
        const newMessages = initialMessages.filter(
          (initialMsg) =>
            !prev.some((existingMsg) => existingMsg.id === initialMsg.id)
        );
        return [...newMessages, ...prev];
      });
      setSkip(initialMessages.length);

      // Check if there are more messages to load based on skip or total message count
      const totalMessages = 0; // Fetch total message count from the API
      setHasMore(initialMessages.length < totalMessages); // Check if more messages exist
      setHasFetchedInitially(true);
    };

    if (userId && user?.id) {
      loadInitialMessages();
    }

    return () => {
      isMounted = false;
      setMessages([]);
      setSkip(0);
      setHasMore(true);
    };
  }, [userId, userType, user?.id]);

  useEffect(() => {
    isFetchingRef.current = false; // Reset fetching status
    hasMoreRef.current = true; // Allow loading more data
    setHasMore(true); // Sync component state
  }, [userId, userType]);

  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length == 0 ? messages : null]);

  const handleScroll = async () => {
    const container = containerRef.current;

    if (!container || isLoading || isFetchingRef.current) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;
    setShowScrollToBottom(!isAtBottom);

    if (container.scrollTop < 10) {
      // here set to 100
      const prevScrollHeight = container.scrollHeight;

      const olderMessages = await fetchMessages(messages.length);
      //const olderMessages = [];

      if (olderMessages.length > 0) {
        // setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
        setMessages((prevMessages) => {
          const existingIds = new Set(prevMessages.map((msg) => msg.id));
          const filteredNewMessages = olderMessages.filter(
            (msg) => !existingIds.has(msg.id)
          );

          return [...filteredNewMessages, ...prevMessages];
        });
        // setSkip(skip + olderMessages.length);
        setSkip((prevSkip) => prevSkip + olderMessages.length);

        const moreAvailable = olderMessages.length == limit;
        setHasMore(moreAvailable);
        hasMoreRef.current = moreAvailable;

        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }, 10);
      } else {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        // console.log("IntersectionObserver triggered", {
        //   isIntersecting: entry.isIntersecting,
        //   hasMore,
        //   isLoading,
        //   isFetchingRef,
        //   hasMoreRef
        // });

        if (
          entry.isIntersecting &&
          hasFetchedInitially &&
          !isLoading &&
          !isFetchingRef.current &&
          hasMoreRef.current &&
          hasMore
        ) {
          const prevScrollHeight = containerRef.current.scrollHeight;

          const olderMessages = await fetchMessages(messages.length);

          if (olderMessages.length > 0) {
            setMessages((prev) => [...olderMessages, ...prev]);
            setSkip((prev) => prev + olderMessages.length);

            setHasMore(olderMessages.length === limit); // 👈 this line

            setTimeout(() => {
              const newScrollHeight = containerRef.current.scrollHeight;
              containerRef.current.scrollTop =
                newScrollHeight - prevScrollHeight;
            }, 10);
          } else {
            setHasMore(false);
            hasMoreRef.current = false;
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      }
    );

    if (topSentinelRef.current) {
      observer.observe(topSentinelRef.current);
      // console.log("Observer attached to topSentinelRef");
    } else {
      console.warn("topSentinelRef is not available");
    }

    return () => {
      if (topSentinelRef.current) {
        observer.unobserve(topSentinelRef.current);
        // console.log("Observer detached from topSentinelRef");
        observer.disconnect();
      }
    };
  }, [skip, hasMore, isLoading]);

  const [pendingReads, setPendingReads] = useState([]);

  useEffect(() => {
    let mounted = true;

    if (user?.id && userId) {
      const socket = getSocket();
      connectSocket(user.id);

      const parsedUserId = parseInt(userId);

      const handleNewMessage = (msg) => {
        if (!mounted) return;

        // console.log(msg, "msg from socket");

        const isGroupMessage =
          msg.user_type == "group" &&
          msg.receiver_id == userId &&
          msg.user_type == userType;

        const isPrivateMessage =
          msg.user_type == "user" &&
          ((msg.sender_id == user.id &&
            msg.receiver_id == parsedUserId &&
            msg.user_type == userType) ||
            (msg.sender_id == parsedUserId &&
              msg.receiver_id == user.id &&
              msg.user_type == userType));

        if (isGroupMessage || isPrivateMessage) {
          setMessages((prevMessages) => {
            if (prevMessages.some((m) => m.id === msg.id)) {
              return prevMessages;
            }
            return [...prevMessages, msg];
          });

          setLatestMessageId(msg.id);
          // console.log("read_message-emit");
          //const isTabActive = document.visibilityState === "visible";
          // const isWindowFocused = document.hasFocus();

          // if (isTabActive && isWindowFocused) {
          socket.emit("read_message_socket", {
            user_id: user.id,
            message_ids: [msg.id],
            receiver_id: msg.receiver_id,
            user_type: msg.user_type,
          });
          // } else {
          //   setPendingReads((prev) => [...prev, msg]);
          // }

          const isAtBottom =
            containerRef.current.scrollHeight -
              containerRef.current.scrollTop -
              containerRef.current.clientHeight <
            100;

          if (!isAtBottom) {
            setShowScrollToBottom(true);
          } else {
            // If user is at the bottom, scroll to show the new message
            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.scrollTop =
                  containerRef.current.scrollHeight;
              }
            }, 0);
          }
        }
      };

      const handleNewReply = (reply) => {
        if (!mounted) return;

        // console.log("reply", reply);
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.id == reply.reply_msg_id) {
              let existingReplies = [];

              try {
                existingReplies = Array.isArray(msg.replies)
                  ? msg.replies
                  : JSON.parse(msg.replies || "[]");
              } catch {
                existingReplies = [];
              }

              setLatestMessageId(reply.id);

              //const isTabActive = document.visibilityState === "visible";
              //const isWindowFocused = document.hasFocus();

              // if (isTabActive && isWindowFocused) {
              socket.emit("read_message_socket", {
                user_id: user.id,
                message_ids: [reply.id],
                receiver_id: reply.receiver_id,
                user_type: reply.user_type,
              });
              // }else {
              //   setPendingReads((prev) => [...prev, reply]);
              // }
              return {
                ...msg,
                replies: [...existingReplies, reply],
              };
            }
            return msg;
          })
        );
      };

      socket.off("new_message", handleNewMessage);
      socket.on("new_message", handleNewMessage);

      socket.off("new_reply", handleNewReply);
      socket.on("new_reply", handleNewReply);

      return () => {
        mounted = false;
        socket.off("new_message", handleNewMessage);
        socket.off("new_reply", handleNewReply);
      };
    }

    return () => {
      mounted = false;
    };
  }, [user?.id, userId]);

  //   useEffect(() => {
  //   if (!latestMessage) return;

  //   const isTabActive = document.visibilityState === "visible";
  //   const isWindowFocused = document.hasFocus();

  //   if (isTabActive && isWindowFocused) {
  //     const socket = getSocket();
  //     connectSocket(user?.id);

  //     console.log("✅ Message read in active tab", latestMessage);

  //     socket.emit("read_message_socket", {
  //       user_id: user.id,
  //       message_ids: [latestMessage.id],
  //       receiver_id: latestMessage.receiver_id,
  //       user_type: latestMessage.user_type,
  //     });
  //   } else {
  //     console.log("⛔ Skipped read: tab not active or window not focused, queuing...");
  //     setPendingReads((prev) => [...prev, latestMessage]);
  //   }
  // }, [latestMessage]);

  //   useEffect(() => {
  //   const handleVisibilityOrFocus = () => {
  //     const isTabActive = document.visibilityState === "visible";
  //     const isWindowFocused = document.hasFocus();

  //     if (isTabActive && isWindowFocused && pendingReads.length > 0) {
  //       const socket = getSocket();

  //       const grouped = {};
  //       for (const msg of pendingReads) {
  //         const key = `${msg.receiver_id}_${msg.user_type}`;
  //         if (!grouped[key]) grouped[key] = [];
  //         grouped[key].push(msg.id);
  //       }

  //       Object.entries(grouped).forEach(([key, message_ids]) => {
  //         const [receiver_id, user_type] = key.split("_");

  //         socket.emit("read_message_socket", {
  //           user_id: user.id,
  //           message_ids,
  //           receiver_id: parseInt(receiver_id),
  //           user_type,
  //         });
  //       });

  //       setPendingReads([]); // clear after reading
  //     }
  //   };

  //   window.addEventListener("focus", handleVisibilityOrFocus);
  //   document.addEventListener("visibilitychange", handleVisibilityOrFocus);

  //   return () => {
  //     window.removeEventListener("focus", handleVisibilityOrFocus);
  //     document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
  //   };
  // }, [pendingReads]);

  useEffect(() => {
    const socket = getSocket();
    connectSocket(user.id);

    const handleMessageEdited = (data) => {
      const { msgId, msgType, message, userId } = data;

      if (msgType === "message") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id == msgId ? { ...msg, message, is_edited: 1 } : msg
          )
        );
      } else if (msgType === "reply") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            replies: msg.replies?.map((reply) =>
              reply.id == msgId ? { ...reply, message, is_edited: 1 } : reply
            ),
          }))
        );
      }
    };

    const handleMessageDelete = (msgObj) => {
      const { msgId, type } = msgObj;

      if (type === "message") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id == msgId ? { ...msg, is_deleted: 1, is_reply: 0 } : msg
          )
        );
      }

      if (type === "reply") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            replies: msg.replies?.map((reply) =>
              reply.id == msgId ? { ...reply, is_deleted: 1 } : reply
            ),
          }))
        );
      }
    };

    socket.on("message_edited", handleMessageEdited);
    socket.on("message_delete", handleMessageDelete);

    return () => {
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_delete", handleMessageDelete);
    };
  }, [user.id]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);

    const isToday = today.toDateString() === messageDate.toDateString();
    const isYesterday =
      new Date(today.setDate(today.getDate() - 1)).toDateString() ===
      messageDate.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return messageDate.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, message) => {
      const date = new Date(message.created_at).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(message);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(messages);

  const [editMsgId, setEditMsgId] = useState(false);
  const [editMsgType, setEditMsgType] = useState(false);
  const [editMessage, setEditMessage] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = (msgId, msgType, msg) => {
    setEditMsgId(msgId);
    setEditMsgType(msgType);
    setEditMessage(msg);
    setEditModalOpen(true);
  };

  const handleReply = (msgId, messageText) => {
    setIsReply(true);
    setReplyMsgId(msgId);
    setReplyMessage(messageText);
    setSelectedQuoteMessage(null); // Clear any selected quote message
  };

  const [selectedMessageForReminder, setSelectedMessageForReminder] =
    useState(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  const handleReminder = (msgId) => {
    setSelectedMessageForReminder(msgId);
    setReminderModalOpen(true);
  };
  const handlePinMsg = async (msgId) => {
    try {
      const userId = Number(user.id); // Ensure consistent variable
      const response = await fetch("https://webexback-06cc.onrender.com/api/messages/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          message_id: msgId,
        }),
      });

      const data = await response.json();

      const { pinned_users } = data;

      // Update the pinned_users in messages state
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === msgId ? { ...msg, pinned_users } : msg
        )
      );

      const isPinned = pinned_users.includes(userId);
    } catch (error) {
      console.error("Error pinning message:", error);
      toast.error("Failed to pin/unpin message");
    }
  };

  const handleDeleteMsg = (msgId, type) => {
    try {
      const socket = getSocket(); // Assuming you have a socket connection
      connectSocket(user?.id);
      socket.emit("delete_message", { msgId, type });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleQuote = (msg) => {
    setSelectedQuoteMessage(msg);
    setIsReply(false);
    setReplyMsgId(null);
    setReplyMessage(null);
  };

  const handleCopy = (msg) => {
    let selectedText = window.getSelection().toString().trim();

    if (!selectedText) {
      if (!msg || !msg.message) return;

      // Remove HTML tags if needed
      selectedText = msg.message.replace(/<[^>]*>/g, "").trim();
    }

    navigator.clipboard
      .writeText(selectedText)
      .then(() => {
        toast("Copied");
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
      });
  };

  const { addTaskOpen, setAddTaskOpen } = useSelectedUser();
  const { selectedMessageFortask, setSelectedMessageFortask } =
    useSelectedUser();
  const handleAddTask = (msg) => {
    console.log(selectedUser?.email);
    setAddTaskOpen(true);
    setSelectedMessageFortask(msg);
  };

  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  const scrollToMessage = async (selmsg) => {
    if (selmsg) {
      console.log("coming", selmsg);
      // Check if the message is already in the current messages array
      let existingMessage = messages.find((msg) => msg.id == selmsg.id);
      let needtofetch = false;

      if (!existingMessage) {
        // Search in replies of each message
        for (let msg of messages) {
          if (Array.isArray(msg.replies)) {
            const foundReply = msg.replies.find((rep) => rep.id == selmsg.id);
            if (foundReply) {
              existingMessage = foundReply;
              break;
            } else {
              needtofetch = true;
            }
          }
        }
      }

      // If message is not found, we'll implement a multi-step fetch strategy
      if (!existingMessage && needtofetch) {
        try {
          // First, try to fetch messages around the selected message's timestamp
          const fetchAroundMessageUrl = new URL(
            "https://webexback-06cc.onrender.com/api/chats/messagesnew"
          );
          fetchAroundMessageUrl.searchParams.append(
            "sender_id",
            selmsg.receiver_id
          );
          fetchAroundMessageUrl.searchParams.append(
            "user_type",
            selmsg.user_type ?? selmsg.group_id ? "group" : "user"
          );
          fetchAroundMessageUrl.searchParams.append(
            "receiver_id",
            selmsg.group_id ?? selmsg.receiver_id
          );
          fetchAroundMessageUrl.searchParams.append(
            "created_at",
            selmsg.created_at
          );
          fetchAroundMessageUrl.searchParams.append("limit", "100"); // Fetch a reasonable number of messages

          const response = await fetch(fetchAroundMessageUrl.toString());

          if (!response.ok) {
            throw new Error(
              "Failed to fetch messages around the selected message"
            );
          }

          const fetchedMessages = await response.json();

          // Merge and deduplicate messages
          const mergedMessages = [...messages, ...fetchedMessages]
            .filter(
              (msg, index, self) =>
                index ===
                self.findIndex(
                  (t) => t.id == msg.id && t.created_at == msg.created_at
                )
            )
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

          // Update messages state
          setMessages(mergedMessages);

          // Find the specific message
          existingMessage = mergedMessages.find((msg) => msg.id == selmsg.id);
        } catch (error) {
          console.error("Error fetching messages:", error);
          return;
        }
      }

      // If message is still not found after fetching
      if (!existingMessage) {
        //toast.error("Message not found");
        //return;
      }

      // Scroll to the message and highlight
      setTimeout(() => {
        const el = messageRefs.current[selectedMessage.id];
        if (el && containerRef.current) {
          // Scroll to message
          el.scrollIntoView({ behavior: "smooth", block: "center" });

          // Set highlighted message
          setHighlightedMessageId(selectedMessage.id);

          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedMessageId(null);
          }, 5000);
        }
      }, 100);
    }
  };

  const [newMesScrollIds, setNewMesScrollIds] = useState(newMessages);

  useEffect(() => {
    if (Array.isArray(newMessages) && newMessages.length > 0) {
      setNewMesScrollIds(newMessages);
    }
  }, [newMessages]);

  const scrollToMessageByIds = async (messageIds = []) => {
    if (!Array.isArray(messageIds) || messageIds.length === 0) return;

    const targetId = messageIds[0];
    let foundMessage = null;
    let maxTries = 50;
    let localMessages = [...messages];
    let currentSkip = messages.length;

    try {
      while (!foundMessage && maxTries > 0) {
        for (const msg of localMessages) {
          if (msg.id == targetId) {
            foundMessage = msg;
            break;
          }

          if (Array.isArray(msg.replies)) {
            const reply = msg.replies.find((rep) => rep.id == targetId);
            if (reply) {
              foundMessage = reply;
              break;
            }
          }
        }

        if (foundMessage) break;

        const newMessages = await fetchMessages(currentSkip);
        if (!newMessages.length) break;

        localMessages = [
          ...localMessages,
          ...newMessages.filter(
            (msg) =>
              !localMessages.some(
                (m) => m.id == msg.id && m.created_at === msg.created_at
              )
          ),
        ];

        setMessages((prev) => {
          // Filter out any initial messages that already exist
          const newMes = newMessages.filter(
            (initialMsg) =>
              !prev.some((existingMsg) => existingMsg.id === initialMsg.id)
          );
          return [...newMes, ...prev];
        });

        const newSkip = currentSkip + newMessages.length;
        setSkip(newSkip);
        currentSkip = newSkip;

        maxTries--;
      }

      if (foundMessage) {
        setTimeout(() => {
          const el = messageRefs.current[targetId];
          if (el && containerRef.current) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightedMessageId(targetId);

            setTimeout(() => {
              setHighlightedMessageId(null);
            }, 5000);
          }
        }, 100);
      } else {
        console.warn("Message ID not found after scrolling:", targetId);
      }
    } finally {
      // ✅ Pop the first messageId from newMesScrollIds
      setNewMesScrollIds((prevIds) => prevIds.slice(1));
    }
  };

  useEffect(() => {
    if (selectedMessage != null) {
      // console.log("selectedMessage", selectedMessage);
      scrollToMessage(selectedMessage);
    }
  }, [selectedMessage]);

  const isValidViewUserId =
    Number(view_user_id) > 0 && !isNaN(Number(view_user_id));

  const EmojiPopup = ({ onSelect, isSent }) => (
    <div
      className={`ios absolute bottom-6  flex gap-1 bg-white border border-gray-200 rounded-full shadow-sm z-10
      ${isSent ? "left-0" : "right-0"}
    `}
    >
      {["👍", "😂", "❤️", "😊", "😁", "🤝🏻"].map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji);
            //setHoveredMessageId(null)
          }}
          className="hover:bg-gray-100 hover:scale-125 px-1.5 py-0.5 rounded-full text-sm"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
  const emojiRef = useRef(null);
  const replyemojiRef = useRef(null);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [showReplyEmojiPopup, setShowReplyEmojiPopup] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPopup(false);
        setEmojiPopupLocked(false);
      }
      if (replyemojiRef.current && !replyemojiRef.current.contains(e.target)) {
        setShowReplyEmojiPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowEmojiPopup(false);
    setShowReplyEmojiPopup(false);
  }, [hoveredMessageId]);

  const handleReact = (msgId, emoji, type) => {
    if (!user?.id) return;

    const socket = getSocket();
    connectSocket(user.id);

    socket.emit("message_react", {
      msgId,
      emoji,
      type,
      userId: user.id,
    });
  };

  useEffect(() => {
    const socket = getSocket();
    connectSocket(user.id);

    const handleReactionsUpdated = ({ msgId, type, reactions }) => {
      if (type == "message") {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === msgId ? { ...msg, reactions } : msg))
        );
      } else if (type == "reply") {
        setMessages((prev) =>
          prev.map((msg) => {
            if (!Array.isArray(msg.replies)) return msg;

            const updatedReplies = msg.replies.map((rep) =>
              rep.id === msgId ? { ...rep, reactions } : rep
            );

            return { ...msg, replies: updatedReplies };
          })
        );
      }
    };

    const handleVoteUpdated = ({ msgId, pollOptions }) => {
      console.log("Vote updated for:", msgId, pollOptions);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id == msgId ? { ...msg, poll_options: pollOptions } : msg
        )
      );
    };

    socket.on("reactions_updated", handleReactionsUpdated);
    socket.on("vote_updated", handleVoteUpdated);

    return () => {
      socket.off("reactions_updated", handleReactionsUpdated);
      socket.off("vote_updated", handleVoteUpdated);
    };
  }, [user.id]);

  const [hoveredEmoji, setHoveredEmoji] = useState(null);
  const [hoveredReplyEmoji, setHoveredReplyEmoji] = useState(null);
  const [reactionUsers, setReactionUsers] = useState([]);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const [loadingReactions, setLoadingReactions] = useState(false);

  const handleReactionHover = async (e, emoji, msg, type) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
    });
    if (type == "message") {
      setHoveredEmoji(msg.id);
    } else {
      setHoveredReplyEmoji(msg.id);
    }
    setLoadingReactions(true);

    try {
      const res = await fetch(
        `https://webexback-06cc.onrender.com/api/messages/${msg.id}/reactions`
      );
      const users = await res.json();
      setReactionUsers(users);
    } catch (error) {
      console.error("Failed to fetch reactions:", error);
    } finally {
      setLoadingReactions(false);
    }
  };

  // Optional: delay clearing hover to prevent flickering
  const clearHover = () => {
    setTimeout(() => {
      setHoveredEmoji(null);
      setReactionUsers([]);
    }, 100);
  };

  const clearReplyHover = () => {
    setTimeout(() => {
      setHoveredReplyEmoji(null);
      setReactionUsers([]);
    }, 100);
  };

  const isSingleEmoji = (message) => {
    if (!message) return false;

    // Remove wrapping tags like <p>...</p> if any
    const temp = document.createElement("div");
    temp.innerHTML = message;
    const text = temp.textContent.trim();

    // Regex to match a single emoji
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
    return emojiRegex.test(text);
  };

  const handlePollVote = (msgId, optionId) => {
    const socket = getSocket();
    connectSocket(user.id);
    socket.emit("voted", {
      msgId: msgId,
      optId: optionId,
      userId: user?.id,
    });
  };
  const [msgForResults, setMsgForResults] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const handleResultBtnClick = (msg) => {
    setMsgForResults(msg);
    setResultOpen(true);
  };

  const removeTrailingEmptyDivs = (html) => {
    // Use DOMParser to clean up divs
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const container = doc.body;

    // Remove trailing empty or blank <div>s
    while (
      container.lastChild &&
      container.lastChild.tagName === "DIV" &&
      container.lastChild.innerHTML
        .trim()
        .replace(/&nbsp;|<br\s*\/?>/gi, "") === ""
    ) {
      container.removeChild(container.lastChild);
    }

    let cleaned = container.innerHTML;

    // Remove trailing <br> tags (including multiple)
    cleaned = cleaned.replace(/(<br\s*\/?>\s*)+$/gi, "");

    return cleaned;
  };

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", disableRightClick);
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`messages-container ios flex flex-col p-3 ${
        theme == "dark"
          ? "bg-gray-800"
          : "bg-gradient-to-b from-orange-50 to-white"
      } chat-messages-container-div chat-headAmsg ${
        isReply || selectedQuoteMessage
          ? "overflow-y-hidden"
          : "overflow-y-auto"
      } `}
      onScroll={handleScroll}
    >
      <div ref={topSentinelRef}></div>
      {isLoading && (
        <div className="loading-indicator flex justify-center py-4">
          <div className="animate-pulse flex space-x-2 items-center bg-white rounded-lg px-4 py-2 shadow-sm">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce delay-200"></div>
            <span className="text-blue-700 font-medium ml-2">Loading...</span>
          </div>
        </div>
      )}

      <div className="message-full-box w-full flex flex-col space-y-4">
        {Object.keys(groupedMessages).length === 0 && !isLoading ? (
          <div className="no-messages flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="p-4 bg-white rounded-full mb-4 shadow-md">
              <MessageSquare size={40} className="text-blue-400" />
            </div>
            <p className="text-lg font-medium text-gray-600">No messages yet</p>
            <p className="text-sm text-gray-400">Start a conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date} className="space-y-3">
              <div className="date-separator flex items-center text-center text-xs">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-medium shadow-sm">
                  {formatDate(messages[0].created_at)}
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {messages.map((msg) => {
                if (msg.is_history == 1) {
                  return (
                    <div
                      key={`${msg.id}-${msg.created_at}`}
                      className="w-full flex justify-center my-2"
                    >
                      <div className="bg-gray-100 text-[10px] text-gray-600 px-3 py-1.5 rounded-full text-center flex items-center space-x-2 shadow-sm">
                        <div>
                          {msg.sender_name ?? ""} {msg.message}
                        </div>
                        <div className="text-[9px] opacity-70">
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                }
                if (msg.is_deleted == 1 && msg.is_reply == 0) {
                  return (
                    <div
                      key={`${msg.id}-${msg.created_at}`}
                      className="w-full flex justify-center my-2"
                    >
                      <div className="bg-gray-100 text-[10px] text-gray-600 px-3 py-1 rounded-full text-center flex items-center space-x-2 shadow-sm">
                        <Trash2 size={10} className="text-gray-500 mr-1" />
                        <div>
                          {msg.sender_name ?? ""} deleted their own message
                        </div>
                        <div className="text-[9px] opacity-70">
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                }

                const wasSent = isValidViewUserId
                  ? msg.sender_id == view_user_id
                  : msg.sender_id == user.id;

                if (msg.is_poll == 1) {
                  const pollOptions = Array.isArray(msg.poll_options)
                    ? msg.poll_options
                    : JSON.parse(msg.poll_options || "[]");

                  return (
                    <div
                      key={msg.id}
                      ref={(el) => (messageRefs.current[msg.id] = el)}
                      className={`w-full my-2 flex ${
                        wasSent
                          ? "flex-row-reverse items-start"
                          : "justify-start"
                      } `}
                    >
                      {/* Profile pic or initial */}
                      {msg.profile_pic &&
                      msg.profile_pic !== "null" &&
                      msg.profile_pic !== "" ? (
                        <img
                          src={
                            msg.profile_pic.startsWith("http")
                              ? msg.profile_pic
                              : `https://rapidcollaborate.in/ccp${msg.profile_pic}`
                          }
                          loading="lazy"
                          className="h-7 w-7 rounded-full object-cover border-2 border-gray shadow-sm"
                        />
                      ) : (
                        <div className="flex justify-center items-center h-7 w-7 text-xs bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-sm font-medium">
                          {msg.sender_name ? msg.sender_name.charAt(0) : "U"}
                        </div>
                      )}

                      {/* Poll Card */}
                      <div
                        className={`${wasSent ? "mr-2" : "ml-2"} ${
                          highlightedMessageId == msg.id
                            ? "animate-pulse-highlight bg-blue-100 p-2"
                            : "bg-white"
                        }  border border-blue-200 p-4 rounded-2xl shadow-md max-w-[80%] w-fit`}
                      >
                        {/* Sender Name & Time */}
                        <div
                          className={`flex gap-2 items-center text-xs mb-2 ${
                            wasSent ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-gray-700 font-medium">
                            {wasSent && !view_user_id
                              ? "You"
                              : msg.sender_name ?? "Unknown User"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>

                        {/* Poll Question */}
                        <div className="text-sm font-semibold text-gray-800 mb-3">
                          📊 {msg.poll_question}
                        </div>

                        {/* Poll Options */}
                        <div className="space-y-2">
                          {pollOptions.map((opt) => {
                            const hasVotedAny =
                              msg.is_multiple_poll === 0 &&
                              pollOptions.some((o) =>
                                o.users.includes(user?.id)
                              );
                            const hasVotedThis = opt.users.includes(user?.id);
                            const shouldDisable = hasVotedAny && !hasVotedThis;

                            return (
                              <button
                                key={opt.id}
                                onClick={() => handlePollVote(msg.id, opt.id)}
                                disabled={shouldDisable}
                                className={`w-full text-left 
                                ${
                                  hasVotedThis
                                    ? "bg-blue-300"
                                    : "bg-gray-100 hover:bg-blue-100"
                                } 
                                ${
                                  shouldDisable
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                } 
                                active:bg-blue-200 transition-all duration-150 border border-gray-200 px-4 py-2 rounded-lg flex flex-col justify-between items-center group`}
                              >
                                <span className="text-sm text-gray-800 group-hover:text-blue-800">
                                  {opt.option}
                                </span>
                                {user?.user_type == "admin" && (
                                  <span className="text-xs text-gray-900 group-hover:text-blue-700">
                                    {opt.users?.length || 0} votes
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {user?.user_type == "admin" && (
                          <button
                            onClick={() => {
                              handleResultBtnClick(msg);
                            }}
                            className="flex items-center text-orange-600 mt-1 justify-end hover:underline"
                          >
                            View Results{" "}
                            <ArrowRight size={13} className="ml-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                const isSent = isValidViewUserId
                  ? msg.sender_id == view_user_id
                  : msg.sender_id == user.id;

                return (
                  <div
                    key={`${msg.id}-${msg.created_at}`}
                    ref={(el) => (messageRefs.current[msg.id] = el)}
                    // onMouseEnter={() => {
                    //   if (!emojiPopupLocked) setHoveredMessageId(msg.id);
                    // }}
                    onMouseLeave={() => {
                      if (!emojiPopupLocked) {
                        setHoveredMessageId(null);
                        clearHover();
                      }
                    }}
                    //onDoubleClick={() => handleReply(msg.id, msg.message)}
                    id="msg-msg"
                    className={`relative message-wrapper gap-2 rounded-lg w-full flex ${
                      isSent ? "flex-row-reverse" : "justify-start"
                    } ${
                      highlightedMessageId == msg.id
                        ? "animate-pulse-highlight bg-gray-300 p-2"
                        : ""
                    }  relative ${
                      theme == "dark" ? "mw-dark" : "mw"
                    }  msg-number-${msg.id} ${isSent ? "" : ""} `}
                  >
                    <div
                      className={`flex flex-col ${
                        isSent ? "items-end " : "items-start "
                      } `}
                    >
                      {msg.profile_pic &&
                      msg.profile_pic != "null" &&
                      msg.profile_pic != "" ? (
                        <img
                        loading="lazy"
                          src={
                            msg.profile_pic.startsWith("http")
                              ? msg.profile_pic
                              : `https://rapidcollaborate.in/ccp${msg.profile_pic}`
                          }
                          className="h-7 w-7 rounded-full object-cover border-2 border-gray shadow-sm"
                        />
                      ) : (
                        <div className="flex justify-center items-center h-7 w-7 f-14 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-sm font-medium">
                          {msg.sender_name ? msg.sender_name.charAt(0) : "U"}
                        </div>
                      )}
                    </div>
                    <div
                      className={`message relative w-full  flex-1 ${
                        isSent ? "rounded-tr-sm" : "rounded-tl-sm"
                      }`}
                    >
                      <div className={`message-content`}>
                        <div
                          className={`flex flex-col  w-full  ${
                            hoveredMessageId == msg.id
                              ? theme == "dark"
                                ? "bg-gray-700"
                                : "bg-gray-200"
                              : ""
                          } rounded p-2 ${
                            isSent
                              ? "items-end justify-end"
                              : "items-start justify-start"
                          }
                        ${
                          theme == "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-200"
                        }
                        `}
                          onMouseEnter={() => {
                            if (!emojiPopupLocked && msg.sender_id != 167)
                              setHoveredMessageId(msg.id);
                          }}
                        >
                          <div className="max-w-[60%] min-w-[20%] relative">
                            {msg.is_new &&
                            msg.is_new == "1" &&
                            msg.mentioned_users &&
                            msg.mentioned_users.includes(user?.id) ? (
                              <div className="absolute -top-1 right-0 text-white bg-blue-500 p-0.5 f-11 w-2 h-2 rounded-full animate-pulse"></div>
                            ) : null}
                            {msg.voice_note ? (
                              <div
                                className={`flex flex-col gap-1 items-start f-11 ${
                                  isSent
                                    ? "items-end text-right"
                                    : "items-start text-left"
                                } ${
                                  theme == "dark"
                                    ? "bg-gray-500 text-gray-50 rounded-tr-none"
                                    : "bg-gray-100 text-gray-900 rounded-tr-none"
                                } px-3 py-2 w-full rounded-lg`}
                              >
                                {/* Sender Name */}
                                <div className="text-xs text-gray-500 dark:text-gray-300">
                                  {isSent && !view_user_id
                                    ? "You"
                                    : msg.sender_name ?? "Unknown User"}
                                </div>

                                {/* Audio Block */}
                                <div
                                  className={`flex items-center gap-2 ${
                                    isSent ? "flex-row-reverse" : "flex-row"
                                  }`}
                                >
                                  <PlayCircle
                                    size={20}
                                    className="text-blue-500"
                                  />
                                  <audio controls className="h-8">
                                    <source
                                      src={`https://rapidcollaborate.in/ccp${msg.voice_note}`}
                                      type="audio/mpeg"
                                    />
                                    Your browser does not support the audio
                                    element.
                                  </audio>
                                </div>

                                {/* Timestamp */}
                                <div
                                  className={`message-time text-xs f-11 ${
                                    isSent ? "text-right" : "text-left"
                                  } ${
                                    theme === "dark"
                                      ? "text-gray-100"
                                      : "text-gray-400"
                                  }`}
                                  data-tooltip-id="my-tooltip"
                                  data-tooltip-content={msg.created_at}
                                >
                                  {formatTime(msg.created_at)}
                                </div>

                                {/* Reactions */}
                                {(() => {
                                  let reactions = [];

                                  try {
                                    const parsed =
                                      typeof msg.reactions === "string"
                                        ? JSON.parse(msg.reactions)
                                        : msg.reactions;

                                    if (Array.isArray(parsed))
                                      reactions = parsed;
                                  } catch {
                                    reactions = [];
                                  }

                                  if (reactions.length === 0) return null;

                                  const reactionMap = reactions.reduce(
                                    (acc, r) => {
                                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                      return acc;
                                    },
                                    {}
                                  );

                                  return (
                                    <div
                                      className={`relative mt-1 flex flex-wrap gap-2 text-sm ${
                                        isSent ? "justify-end" : "justify-start"
                                      }`}
                                    >
                                      {/* Tooltip Popup */}
                                      {hoveredEmoji &&
                                        hoveredEmoji === msg.id && (
                                          <div
                                            ref={tooltipRef}
                                            className="absolute top-[30px] z-50 max-h-36 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md p-2 text-xs text-black"
                                          >
                                            {loadingReactions ? (
                                              <div>Loading...</div>
                                            ) : (
                                              <div className="space-y-1 flex flex-col">
                                                {reactionUsers.map((user) => (
                                                  <div
                                                    key={user.id}
                                                    className="flex items-center gap-2 text-black"
                                                  >
                                                    <img
                                                      src={
                                                        user.profile_pic
                                                          ? user.profile_pic.startsWith(
                                                              "http"
                                                            )
                                                            ? user.profile_pic
                                                            : `https://rapidcollaborate.in/ccp${user.profile_pic}`
                                                          : `https://ui-avatars.com/api/?name=${user.name.charAt(
                                                              0
                                                            )}&background=random&color=fff&size=128`
                                                      }
                                                      loading="lazy"
                                                      alt={user.name}
                                                      className="w-5 h-5 rounded-full"
                                                    />

                                                    <span className="f-11">
                                                      {user.name}
                                                    </span>
                                                    <span>{user.emoji}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                      {/* Reaction Buttons */}
                                      {Object.entries(reactionMap).map(
                                        ([emoji, count]) => (
                                          <div
                                            key={emoji}
                                            onMouseEnter={(e) => {
                                              if (!emojiPopupLocked) {
                                                handleReactionHover(
                                                  e,
                                                  emoji,
                                                  msg,
                                                  "message"
                                                );
                                              }
                                            }}
                                            className="bg-gray-100 flex items-center border cursor-pointer text-gray-700 rounded border-gray-300 px-1 py-0.5 text-xs"
                                          >
                                            <span className="mr-1">
                                              {emoji}
                                            </span>
                                            <span className="text-[10px] font-medium">
                                              {count}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div
                                style={{
                                  opacity:
                                    isReply && replyMsgId != msg.id
                                      ? "0.3"
                                      : "1",
                                  filter:
                                    isReply && replyMsgId != msg.id
                                      ? "blur(3px)"
                                      : "none",
                                  boxShadow:
                                    isReply && replyMsgId == msg.id
                                      ? "0px 0px 8px rgba(37, 99, 235, 0.5)"
                                      : "none",
                                  transition:
                                    "opacity 0.3s ease, filter 0.3s ease, background-color 0.3s ease, transform 0.3s ease",
                                }}
                                className={` px-3 py-2 w-full rounded-lg
                             ${
                               isSent
                                 ? `${
                                     theme == "dark"
                                       ? "bg-gray-500 text-gray-50 rounded-tr-none"
                                       : "bg-gray-100 text-gray-900 rounded-tr-none"
                                   }`
                                 : `${
                                     theme == "dark"
                                       ? "bg-gray-500 text-gray-50 rounded-tl-none"
                                       : "bg-gray-100 text-gray-900 rounded-tl-none"
                                   } `
                             }
                      ${
                        isReply && replyMsgId == msg.id
                          ? "ring-2 p-2 ring-blue-400 bg-blue-50 "
                          : ""
                      }
                      `}

                                // onMouseLeave={() => {
                                //   if (!emojiPopupLocked) {
                                //     setHoveredMessageId(null);
                                //     clearHover();
                                //   }
                                // }}
                              >
                                <div
                                  className={`text-xs  mb-1 font-medium ${
                                    isSent
                                      ? "text-white-600 text-right"
                                      : `${
                                          theme == "dark"
                                            ? "text-white"
                                            : "text-gray-600"
                                        }`
                                  }`}
                                >
                                  <div
                                    className={`flex gap-2 items-end f-11 ${
                                      isSent ? "flex-row-reverse" : ""
                                    }`}
                                  >
                                    <div>
                                      {isSent && !view_user_id
                                        ? "You"
                                        : msg.sender_name ?? "Unknown User"}
                                    </div>
                                    <div
                                      className={`message-time flex items-center text-xs f-11 ${
                                        isSent ? "justify-end" : "justify-start"
                                      }  ${
                                        isSent
                                          ? `${
                                              theme == "dark"
                                                ? "text-gray-100"
                                                : "text-gray-400"
                                            }`
                                          : `${
                                              theme == "dark"
                                                ? "text-gray-100"
                                                : "text-gray-400"
                                            }`
                                      }`}
                                      data-tooltip-id="my-tooltip"
                                      data-tooltip-content={msg.created_at}
                                    >
                                      <div> {formatTime(msg.created_at)}</div>
                                    </div>
                                    <div>
                                      {msg.is_edited == 1 && (
                                        <p className="text-[9px] bg-gray-200 text-gray-700 px-2 rounded-full font-medium flex items-center">
                                          Edited
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {msg.is_file == 1 &&
                                  msg.filename &&
                                  (() => {
                                    const ext = msg.filename
                                      .split(".")
                                      .pop()
                                      .toLowerCase();
                                    const isImage = [
                                      "png",
                                      "jpg",
                                      "jpeg",
                                      "avif",
                                      "svg",
                                      "webp",
                                    ].includes(ext);
                                    const fileUrl = msg.filename.startsWith(
                                      "http"
                                    )
                                      ? msg.filename
                                      : `https://rapidcollaborate.in/ccp${msg.filename}`;
                                    const filenameOnly = msg.filename
                                      .split("/")
                                      .pop();

                                    return (
                                      <div className="w-full mb-1">
                                        {/* File Info Box */}
                                        <div className="bg-white/80 border border-gray-300 rounded shadow-sm flex flex-col gap-1">
                                          <div className="flex items-center gap-1 cursor-pointer px-2 py-1 hover:bg-gray-50 transition rounded-l w-full">
                                            <div>
                                              {isImage ? (
                                                <ImageIcon
                                                  className="text-pink-500"
                                                  size={11}
                                                />
                                              ) : ext === "mp4" ||
                                                ext === "mov" ? (
                                                <VideoIcon
                                                  className="text-purple-600"
                                                  size={11}
                                                />
                                              ) : [
                                                  "doc",
                                                  "docx",
                                                  "xls",
                                                  "xlsx",
                                                ].includes(ext) ? (
                                                <FileSpreadsheet
                                                  className="text-green-600"
                                                  size={11}
                                                />
                                              ) : (
                                                <FileText
                                                  className="text-blue-600"
                                                  size={11}
                                                />
                                              )}
                                            </div>
                                            <span className="f-11 font-medium text-blue-700 truncate max-w-[200px] flex items-center">
                                              <a
                                                href={fileUrl}
                                                target="_blank"
                                                download={fileUrl}
                                                rel="noopener noreferrer"
                                                className="f-11 text-blue-600 hover:underline  flex items-center"
                                              >
                                                {msg.filename.split("/").pop()}
                                              </a>
                                            </span>
                                          </div>

                                          {/* File Preview */}

                                          {isImage && (
                                            <div className="px-3">
                                              <button
                                                onClick={() => {
                                                  setOpenFileModal({
                                                    url: msg.filename.startsWith(
                                                      "http"
                                                    )
                                                      ? msg.filename
                                                      : `https://rapidcollaborate.in/ccp${msg.filename}`,
                                                    name: msg.filename
                                                      .split("/")
                                                      .pop(),
                                                    sender_name:
                                                      msg.sender_name,
                                                    time: msg.created_at,
                                                  });
                                                  console.log(msg);
                                                }}
                                              >
                                                <img
                                                  src={fileUrl}
                                                  alt={msg.filename}
                                                  className="max-w-36 h-full object-contain"
                                                />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                {msg.is_quoted == 1 &&
                                  msg.quoted_msg &&
                                  msg.quoted_msg_name &&
                                  msg.quoted_msg_id && (
                                    <div
                                      className={` border-orange-500 bg-orange-50 px-2 py-1 rounded-sm mb-1 text-[11px] text-gray-800
                              ${isSent ? "border-r-2" : "border-l-2"}`}
                                    >
                                      <div
                                        className={`flex items-center justify-between mb-1 ${
                                          isSent ? "flex-row-reverse" : ""
                                        }`}
                                      >
                                        <span className="font-bold text-gray-700 mr-1">
                                          {msg.quoted_msg_name?.length > 15
                                            ? msg.quoted_msg_name.slice(0, 15) +
                                              "…"
                                            : msg.quoted_msg_name}
                                        </span>
                                        <button
                                          onClick={() => {
                                            try {
                                              const quoted = JSON.parse(
                                                msg.quoted_msg_json
                                              );
                                              setSelectedMessage(quoted);
                                            } catch (e) {
                                              console.error(
                                                "Invalid quoted_msg_json",
                                                e.message
                                              );
                                            }
                                          }}
                                          className={`text-orange-500 hover:text-orange-900 flex gap-1 ${
                                            isSent ? "flex-row-reverse " : ""
                                          }`}
                                        >
                                          Go to message{" "}
                                          <span
                                            className={` ${
                                              isSent ? "rotate-[-180deg] " : ""
                                            }`}
                                          >
                                            →
                                          </span>
                                        </button>
                                      </div>
                                      <div
                                        className="text-[11px] text-gray-700"
                                        dangerouslySetInnerHTML={{
                                          __html: msg.quoted_msg,
                                        }}
                                      ></div>
                                    </div>
                                  )}
                                <div
                                  className={` flex ${
                                    isSent ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    ref={proseRef}
                                    className={`prose prose-sm ${
                                      isSent ? "text-start" : "text-start"
                                    } max-w-none ${
                                      isSingleEmoji(msg.message)
                                        ? "text-[26px]"
                                        : "text-[13px]"
                                    }`}
                                    style={{}}
                                    dangerouslySetInnerHTML={{
                                      __html: removeTrailingEmptyDivs(
                                        msg.message
                                      ),
                                    }}
                                  ></div>
                                </div>
                                {(() => {
                                  let reactions = [];

                                  try {
                                    const parsed =
                                      typeof msg.reactions === "string"
                                        ? JSON.parse(msg.reactions)
                                        : msg.reactions;

                                    if (Array.isArray(parsed)) {
                                      reactions = parsed;
                                    }
                                  } catch {
                                    reactions = [];
                                  }

                                  if (reactions.length === 0) return null;

                                  const reactionMap = reactions.reduce(
                                    (acc, r) => {
                                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                      return acc;
                                    },
                                    {}
                                  );

                                  return (
                                    <div
                                      className={`mt-1 flex gap-2 flex-wrap text-sm relative flex
                            ${isSent ? "justify-end" : "justify-start"}
                          `}
                                    >
                                      {hoveredEmoji &&
                                        hoveredEmoji == msg.id && (
                                          <div
                                            ref={tooltipRef}
                                            className="absolute text-black top-[30px]  z-50 h-auto max-h-36 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md p-2 text-xs"
                                          >
                                            {loadingReactions ? (
                                              <div>Loading...</div>
                                            ) : (
                                              <div className="space-y-1 ios flex items-start flex-col">
                                                {reactionUsers.map((user) => (
                                                  <div
                                                    key={user.id}
                                                    className={` ${
                                                      theme == "dark"
                                                        ? "text-black"
                                                        : "text-black"
                                                    } flex items-center gap-2`}
                                                  >
                                                    <img
                                                      src={
                                                        user.profile_pic
                                                          ? user.profile_pic.startsWith(
                                                              "http"
                                                            )
                                                            ? user.profile_pic
                                                            : `https://rapidcollaborate.in/ccp${user.profile_pic}`
                                                          : `https://ui-avatars.com/api/?name=${user.name.charAt(
                                                              0
                                                            )}&background=random&color=fff&size=128`
                                                      }
                                                      loading="lazy"
                                                      alt={user.name}
                                                      className="w-5 h-5 rounded-full"
                                                    />
                                                    <span className="f-11">
                                                      {user.name}
                                                    </span>
                                                    <span>{user.emoji}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                      {Object.entries(reactionMap).map(
                                        ([emoji, count]) => (
                                          <div
                                            key={emoji}
                                            onMouseEnter={(e) => {
                                              if (!emojiPopupLocked) {
                                                handleReactionHover(
                                                  e,
                                                  emoji,
                                                  msg,
                                                  "message"
                                                );
                                              }
                                            }}
                                            //onMouseLeave={clearHover}
                                            className="bg-gray-100 flex ios border cursor-pointer text-gray-700 rounded border-gray-300 px-1 py-0.5 text-xs flex items-center"
                                          >
                                            <span className="mr-1">
                                              {emoji}
                                            </span>
                                            <span className="text-[10px] font-medium">
                                              {count}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>

                        {(() => {
                          let pinned = [];

                          if (Array.isArray(msg.pinned_users)) {
                            pinned = msg.pinned_users;
                          } else {
                            try {
                              pinned = JSON.parse(msg.pinned_users);
                            } catch {
                              pinned = [];
                            }
                          }

                          return Array.isArray(pinned) &&
                            pinned.includes(
                              isValidViewUserId ? view_user_id : user?.id
                            ) ? (
                            <span
                              className={`absolute top-[-8px]  animate-pulse
                              ${isSent ? "left-[-3px]" : "right-[-3px]"}
                            `}
                            >
                              <Pin
                                size={18}
                                className={`text-orange-500 fill-orange-500 
                                  ${isSent ? "rotate-[-45deg]" : "rotate-45"}
                                `}
                              />
                            </span>
                          ) : null;
                        })()}
                        {(() => {
                          let replies = [];

                          try {
                            replies =
                              typeof msg.replies === "string"
                                ? JSON.parse(msg.replies)
                                : msg.replies;

                            // Sort replies by reply_at descending
                            replies.sort((a, b) => a.id - b.id);
                          } catch {
                            replies = [];
                          }

                          return Array.isArray(replies) &&
                            replies.length > 0 ? (
                            <div className="mt-2 space-y-2  w-full mx-2">
                              {replies.map((reply) => {
                                if (
                                  reply.is_deleted == 1 &&
                                  reply.is_reply == 1
                                ) {
                                  return (
                                    <div
                                      key={`${reply.id}-${reply.created_at}`}
                                      className={`w-full flex  
                                        ${
                                          isSent
                                            ? "justify-end"
                                            : "justify-start"
                                        }
                                      `}
                                    >
                                      <div
                                        className={` text-[10px]  px-3 py-1 rounded-md text-center flex items-center space-x-2 shadow-sm 
                                        ${
                                          theme == "dark"
                                            ? "bg-gray-500 text-gray-50"
                                            : "bg-gray-100 text-gray-600"
                                        }
                                        `}
                                      >
                                        <Trash2
                                          size={10}
                                          className="text-red-500"
                                        />
                                        <div>
                                          {reply.sender_name ?? ""} deleted
                                          their own reply
                                        </div>
                                        <div className=" opacity-70">
                                          {formatTime(reply.created_at)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                const isReplySent = isValidViewUserId
                                  ? reply.sender_id == view_user_id
                                  : reply.sender_id == user.id;

                                return (
                                  <div
                                    className={`flex gap-2
                                    ${isSent ? "flex-row-reverse" : ""}
                                    
                                  `}
                                    style={{
                                      opacity:
                                        isReply &&
                                        replyMsgId != reply.reply_msg_id
                                          ? "0.3"
                                          : "1",
                                      filter:
                                        isReply &&
                                        replyMsgId != reply.reply_msg_id
                                          ? "blur(3px)"
                                          : "none",
                                      transition:
                                        "opacity 0.3s ease, filter 0.3s ease, background-color 0.3s ease, transform 0.3s ease",
                                    }}
                                  >
                                    <div className="py-2">
                                      {reply.profile_pic &&
                                      reply.profile_pic != "null" &&
                                      reply.profile_pic != "" ? (
                                        <img
                                          src={
                                            reply.profile_pic.startsWith("http")
                                              ? reply.profile_pic
                                              : `https://rapidcollaborate.in/ccp${reply.profile_pic}`
                                          }
                                          loading="lazy"
                                          className="h-6 w-6 rounded-full object-cover border-2 border-gray shadow-sm"
                                        />
                                      ) : (
                                        <div className="flex justify-center items-center h-6 w-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-sm font-medium">
                                          {reply.sender_name
                                            ? reply.sender_name.charAt(0)
                                            : "U"}
                                        </div>
                                      )}
                                    </div>
                                    <div
                                      className={`flex  relative w-full rounded p-2 items-start
                                      ${
                                        isSent ? "justify-end" : "justify-start"
                                      }
                                      ${
                                        theme == "dark"
                                          ? "hover:bg-gray-700"
                                          : "hover:bg-gray-200"
                                      }
                                    `}
                                      onMouseEnter={() => {
                                        setHoveredReplyMessageId(
                                          `reply-${reply.id}`
                                        );
                                        if (!emojiPopupLocked) {
                                          setHoveredMessageId(null);
                                          clearHover();
                                        }
                                      }}
                                      onMouseLeave={() => {
                                        setHoveredReplyMessageId(null);
                                        if (!emojiPopupLocked) {
                                          setHoveredMessageId(null);
                                          clearHover();
                                        }
                                      }}
                                    >
                                      <div className="max-w-[60%] min-w-[20%] relative">
                                        {reply.is_new &&
                                        reply.is_new == "1" &&
                                        reply.mentioned_users &&
                                        reply.mentioned_users.includes(
                                          user?.id
                                        ) ? (
                                          <div className="absolute -top-1 right-0 text-white bg-blue-500 p-0.5 f-11 w-2 h-2 rounded-full animate-pulse"></div>
                                        ) : null}
                                        <div
                                          key={`${reply.id}-${reply.created_at}`}
                                          ref={(el) =>
                                            (messageRefs.current[reply.id] = el)
                                          }
                                          className={`reply-box w-full ${
                                            highlightedMessageId == reply.id
                                              ? " bg-gray-300"
                                              : " bg-gray-100"
                                          } ${
                                            isSent
                                              ? "border-r-2 flex flex-col justify-end items-end "
                                              : "border-l-2"
                                          }
                                    ${
                                      isSent
                                        ? `${
                                            theme == "dark"
                                              ? "bg-gray-500 text-gray-50 rounded-tr-none"
                                              : "bg-gray-100 text-gray-900 rounded-tr-none"
                                          }`
                                        : `${
                                            theme == "dark"
                                              ? "bg-gray-500 text-gray-50 rounded-tl-none "
                                              : "bg-gray-100 text-gray-900 rounded-tl-none "
                                          } `
                                    }
                                    
                                    border-blue-400 rounded-lg p-2 text-sm relative`}

                                          // onMouseLeave={() => {
                                          //   setHoveredReplyMessageId(null);
                                          //   clearReplyHover();
                                          // }}
                                        >
                                          <div
                                            className={` f-11 flex items-center ${
                                              isSent ? "flex-row-reverse" : ""
                                            }
                                      ${
                                        isSent
                                          ? "text-white-600 text-right"
                                          : `${
                                              theme == "dark"
                                                ? "text-white"
                                                : "text-gray-600"
                                            }`
                                      } gap-2 mb-1 `}
                                          >
                                            {/* <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Reply
                                          size={10}
                                          className="text-blue-600"
                                        />
                                      </div> */}

                                            <div>
                                              {reply.sender_id == user?.id &&
                                              !view_user_id
                                                ? "You"
                                                : reply.sender_name || "User"}
                                            </div>
                                            <div
                                              className={`text-xs f-11
                                        ${
                                          isSent
                                            ? "text-white-600"
                                            : `${
                                                theme == "dark"
                                                  ? "text-white"
                                                  : "text-gray-400"
                                              }`
                                        }
                                        `}
                                            >
                                              {formatTime(reply.created_at)}
                                            </div>
                                          </div>
                                          {reply.is_file == 1 &&
                                            reply.filename &&
                                            (() => {
                                              const ext = reply.filename
                                                .split(".")
                                                .pop()
                                                .toLowerCase();
                                              const isImage = [
                                                "png",
                                                "jpg",
                                                "jpeg",
                                                "avif",
                                                "svg",
                                                "webp",
                                              ].includes(ext);
                                              const fileUrl = `https://rapidcollaborate.in/ccp${reply.filename}`;
                                              const filenameOnly =
                                                reply.filename.split("/").pop();

                                              return (
                                                <div className="w-full mb-2">
                                                  {/* File Info Box */}
                                                  <div
                                                    open
                                                    className="bg-white/80 border border-gray-300 rounded-lg shadow-sm"
                                                  >
                                                    <div className="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-gray-50 transition rounded-lg">
                                                      {isImage ? (
                                                        <ImageIcon
                                                          className="text-pink-500"
                                                          size={15}
                                                        />
                                                      ) : ext === "mp4" ||
                                                        ext === "mov" ? (
                                                        <VideoIcon
                                                          className="text-purple-600"
                                                          size={15}
                                                        />
                                                      ) : [
                                                          "doc",
                                                          "docx",
                                                          "xls",
                                                          "xlsx",
                                                        ].includes(ext) ? (
                                                        <FileSpreadsheet
                                                          className="text-green-600"
                                                          size={15}
                                                        />
                                                      ) : (
                                                        <FileText
                                                          className="text-blue-600"
                                                          size={15}
                                                        />
                                                      )}
                                                      <span className="f-11 font-medium text-blue-700 truncate max-w-[200px] flex items-center">
                                                        <a
                                                          href={fileUrl}
                                                          download={fileUrl}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="f-11 text-blue-600 hover:underline  flex items-center"
                                                        >
                                                          {reply.filename
                                                            .split("/")
                                                            .pop()}
                                                        </a>
                                                      </span>
                                                    </div>

                                                    {/* File Preview */}
                                                    <div className="px-3">
                                                      {isImage && (
                                                        <button
                                                          onClick={() =>
                                                            setOpenFileModal({
                                                              url: `https://rapidcollaborate.in/ccp${reply.filename}`,
                                                              name: reply.filename
                                                                .split("/")
                                                                .pop(),
                                                              sender_name:
                                                                reply.sender_name,
                                                              time: reply.created_at,
                                                            })
                                                          }
                                                        >
                                                          <img
                                                            src={fileUrl}
                                                            loading="lazy"
                                                            alt={reply.filename}
                                                            className="rounded-md shadow max-w-36 h-full object-contain"
                                                          />
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })()}
                                          <div
                                            className="prose prose-sm max-w-none f-13"
                                            dangerouslySetInnerHTML={{
                                              __html: reply.message,
                                            }}
                                            style={{ lineBreak: "auto" }}
                                          ></div>
                                          {(() => {
                                            let pinned = [];

                                            if (
                                              Array.isArray(reply.pinned_users)
                                            ) {
                                              pinned = reply.pinned_users;
                                            } else {
                                              try {
                                                pinned = JSON.parse(
                                                  reply.pinned_users
                                                );
                                              } catch {
                                                pinned = [];
                                              }
                                            }

                                            return Array.isArray(pinned) &&
                                              pinned.includes(
                                                isValidViewUserId
                                                  ? view_user_id
                                                  : user?.id
                                              ) ? (
                                              <span
                                                className={`absolute top-[-8px]  animate-pulse ${
                                                  isSent
                                                    ? "left-[-3px]"
                                                    : "right-[-3px]"
                                                }`}
                                              >
                                                <Pin
                                                  size={18}
                                                  className={`text-orange-500 fill-orange-500 ${
                                                    isSent
                                                      ? "rotate-[-45deg]"
                                                      : "rotate-45"
                                                  }`}
                                                />
                                              </span>
                                            ) : null;
                                          })()}
                                          {(() => {
                                            let reactions = [];

                                            try {
                                              const parsed =
                                                typeof reply.reactions ===
                                                "string"
                                                  ? JSON.parse(reply.reactions)
                                                  : reply.reactions;

                                              if (Array.isArray(parsed)) {
                                                reactions = parsed;
                                              }
                                            } catch {
                                              reactions = [];
                                            }

                                            if (reactions.length === 0)
                                              return null;

                                            const reactionMap =
                                              reactions.reduce((acc, r) => {
                                                acc[r.emoji] =
                                                  (acc[r.emoji] || 0) + 1;
                                                return acc;
                                              }, {});

                                            return (
                                              <div className="mt-2 flex gap-2 flex-wrap text-sm relative">
                                                {hoveredReplyEmoji &&
                                                  hoveredReplyEmoji ==
                                                    reply.id && (
                                                    <div
                                                      ref={tooltipRef}
                                                      className={`absolute top-[30px] z-50 h-auto max-h-36 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md p-2 w-48 text-xs
                                                  ${
                                                    isSent
                                                      ? "-left-[150px]"
                                                      : "-right-[30px]"
                                                  }  
                                                `}
                                                    >
                                                      {loadingReactions ? (
                                                        <div>Loading...</div>
                                                      ) : (
                                                        <div className="space-y-1 ios">
                                                          {reactionUsers.map(
                                                            (user) => (
                                                              <div
                                                                key={user.id}
                                                                className="flex items-center gap-2"
                                                              >
                                                                <img
                                                                  src={
                                                                    user.profile_pic
                                                                      ? user.profile_pic.startsWith(
                                                                          "http"
                                                                        )
                                                                        ? user.profile_pic
                                                                        : `https://rapidcollaborate.in/ccp${user.profile_pic}`
                                                                      : `https://ui-avatars.com/api/?name=${user.name.charAt(
                                                                          0
                                                                        )}&background=random&color=fff&size=128`
                                                                  }
                                                                  alt={
                                                                    user.name
                                                                  }
                                                                  loading="lazy"
                                                                  className="w-5 h-5 rounded-full"
                                                                />
                                                                <span>
                                                                  {user.name}
                                                                </span>
                                                                <span>
                                                                  {user.emoji}
                                                                </span>
                                                              </div>
                                                            )
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}

                                                {Object.entries(
                                                  reactionMap
                                                ).map(([emoji, count]) => (
                                                  <div
                                                    key={emoji}
                                                    onMouseEnter={(e) =>
                                                      handleReactionHover(
                                                        e,
                                                        emoji,
                                                        reply,
                                                        "reply"
                                                      )
                                                    }
                                                    //onMouseLeave={clearHover}
                                                    className="bg-gray-100 ios border cursor-pointer text-gray-700 border-gray-300 px-2 py-0.5 rounded-full text-xs flex items-center"
                                                  >
                                                    <span className="mr-1">
                                                      {emoji}
                                                    </span>
                                                    <span className="text-[10px] font-medium">
                                                      {count}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          })()}
                                          {/* <div className="text-xs text-gray-500 mt-2 flex items-center">
                                      {formatTime(reply.created_at)}
                                    </div> */}
                                        </div>
                                      </div>
                                      {/* Reply Actions */}
                                      {hoveredReplyMessageId ==
                                        `reply-${reply.id}` && (
                                        <div
                                          className="chat-funt-set message-actions absolute -top-2 bg-white rounded-full flex z-10 border border-gray-200 transition-all duration-200"
                                          style={{
                                            [isSent ? "left" : "right"]: "15px",
                                          }}
                                        >
                                          <div
                                            className="relative action-button"
                                            ref={emojiRef}
                                          >
                                            <button
                                              onClick={() =>
                                                setShowReplyEmojiPopup(
                                                  (prev) => !prev
                                                )
                                              }
                                              className="action-button py-1 px-2 text-gray-600 hover:bg-yellow-50 transition-colors"
                                              title="React"
                                            >
                                              <Smile size={11} />
                                            </button>
                                            {showReplyEmojiPopup && (
                                              <EmojiPopup
                                                onSelect={(emoji) => {
                                                  handleReact(
                                                    reply.id,
                                                    emoji,
                                                    "reply"
                                                  );
                                                  setShowReplyEmojiPopup(false);
                                                  setEmojiPopupLocked(false);
                                                }}
                                                isSent={isSent}
                                              />
                                            )}
                                          </div>

                                          {isReplySent && (
                                            <button
                                              onClick={() =>
                                                handleEdit(
                                                  reply.id,
                                                  "reply",
                                                  reply.message
                                                )
                                              }
                                              className="action-button py-1 px-2 text-gray-600 hover:bg-blue-50 transition-colors"
                                              title="Edit reply"
                                            >
                                              <Pen size={11} />
                                            </button>
                                          )}

                                          <button
                                            onClick={() =>
                                              handleReply(
                                                reply.reply_msg_id,
                                                reply.message
                                              )
                                            }
                                            className="action-button py-1 px-2 text-gray-600 hover:bg-green-50 transition-colors"
                                            title="Reply to reply"
                                          >
                                            <Reply size={11} />
                                          </button>

                                          <button
                                            onClick={() =>
                                              handleReminder(reply.id)
                                            }
                                            className="action-button py-1 px-2 text-gray-600 hover:bg-purple-50 transition-colors"
                                            title="Set reminder"
                                          >
                                            <BellDot size={11} />
                                          </button>

                                          <button
                                            onClick={() => handleQuote(reply)}
                                            className="action-button py-1 px-2 text-gray-600 hover:bg-purple-50 transition-colors"
                                            title="Quote reply"
                                          >
                                            <QuoteIcon size={11} />
                                          </button>

                                          <button
                                            onClick={() =>
                                              handlePinMsg(reply.id)
                                            }
                                            className="action-button py-1 px-2 text-gray-600 hover:bg-orange-50 transition-colors"
                                            title="Pin reply"
                                          >
                                            <Pin size={11} />
                                          </button>

                                          {isReplySent && (
                                            <button
                                              onClick={() =>
                                                handleDeleteMsg(
                                                  reply.id,
                                                  "reply"
                                                )
                                              }
                                              className="action-button py-1 px-2 text-gray-600 hover:bg-red-50 transition-colors"
                                              title="Delete reply"
                                            >
                                              <Trash2 size={11} />
                                            </button>
                                          )}
                                          <button
                                            onClick={() => handleCopy(reply)}
                                            className="action-button py-1 px-2 text-gray-600 hover:bg-blue-50 transition-colors"
                                            title="Copy"
                                          >
                                            <Copy size={11} />
                                          </button>

                                          <button
                                            onClick={() => handleAddTask(reply)}
                                            className="action-button py-1 px-2 text-gray-600 hover:bg-blue-50 transition-colors"
                                            title="Add Task"
                                          >
                                            <CircleCheckBig size={11} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    {hoveredMessageId === msg.id && (
                      <div className="flex items-start relative">
                        <div
                          className="chat-funt-set message-actions absolute -top-2 bg-white rounded-full flex z-10 border border-gray-200 transition-all duration-200"
                          style={{
                            [isSent ? "left" : "right"]: "15px",
                          }}
                          onMouseEnter={() => {
                            setHoveredMessageId(msg.id);
                          }}
                        >
                          <div
                            className="relative action-button"
                            ref={emojiRef}
                          >
                            <button
                              onClick={() => {
                                setShowEmojiPopup((prev) => !prev);
                                setEmojiPopupLocked(true);
                              }}
                              className="action-button py-1 px-2 text-gray-600 hover:bg-yellow-50 transition-colors"
                              title="React"
                            >
                              <Smile size={11} />
                            </button>
                            {showEmojiPopup && (
                              <EmojiPopup
                                onSelect={(emoji) => {
                                  handleReact(msg.id, emoji, "message");
                                  setShowEmojiPopup(false);
                                  setEmojiPopupLocked(false);
                                }}
                                isSent={isSent}
                              />
                            )}
                          </div>

                          {isSent && !msg.voice_note && (
                            <button
                              onClick={() =>
                                handleEdit(msg.id, "message", msg.message)
                              }
                              className="action-button py-1 px-2 text-gray-600 hover:bg-blue-50  transition-colors"
                              title="Edit message"
                            >
                              <Pen size={11} />
                            </button>
                          )}

                          <button
                            onClick={() => handleReply(msg.id, msg.message)}
                            className="action-button py-1 px-2 text-gray-600 hover:bg-green-50  transition-colors"
                            title="Reply"
                          >
                            <Reply size={11} />
                          </button>
                          {!msg.voice_note && (
                            <button
                              onClick={() => handleReminder(msg.id)}
                              className="action-button py-1 px-2 text-gray-600 hover:bg-purple-50  transition-colors"
                              title="Set reminder"
                            >
                              <BellDot size={11} />
                            </button>
                          )}

                          {!msg.voice_note && (
                            <button
                              onClick={() => handleQuote(msg)}
                              className="action-button py-1 px-2 text-gray-600 hover:bg-purple-50  transition-colors"
                              title="Quote message"
                            >
                              <QuoteIcon size={11} />
                            </button>
                          )}

                          {!msg.voice_note && (
                            <button
                              onClick={() => handlePinMsg(msg.id)}
                              className="action-button py-1 px-2 text-gray-600 hover:bg-orange-50  transition-colors"
                              title="Pin message"
                            >
                              <Pin size={11} />
                            </button>
                          )}

                          {isSent && (
                            <button
                              onClick={() => handleDeleteMsg(msg.id, "message")}
                              className="action-button py-1 px-2 text-gray-600 hover:bg-red-50  transition-colors"
                              title="Delete message"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}

                          {!msg.voice_note && (
                            <button
                              onClick={() => handleCopy(msg)}
                              className="action-button py-1 px-2 text-gray-600 hover:bg-blue-50 transition-colors"
                              title="Copy"
                            >
                              <Copy size={11} />
                            </button>
                          )}

                          {!msg.voice_note && (
                            <button
                              onClick={() => handleAddTask(msg)}
                              className="action-button py-1 px-2 text-gray-600 hover:bg-blue-50 transition-colors"
                              title="Add Task"
                            >
                              <CircleCheckBig size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div>
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToBottom}
                className="down-btn-set transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-1 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all  flex items-center justify-center"
              >
                <ArrowDown size={20} />
              </motion.button>
            )}
            {newMesScrollIds &&
              Array.isArray(newMesScrollIds) &&
              newMesScrollIds.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => {
                    scrollToMessageByIds(newMesScrollIds);
                  }}
                  className="top-btn-set transform -translate-x-1/3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-1 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all  flex items-center justify-center"
                >
                  <MessageSquare size={15} className="mr-1" /> New (
                  {newMesScrollIds.length})
                </motion.button>
              )}
          </AnimatePresence>
        </div>
        {latestMessageId && <ReadPersons messageId={latestMessageId} />}
      </div>

      <AnimatePresence>
        {editModalOpen && (
          <EditModal
            userId={userId}
            msgId={editMsgId}
            msgType={editMsgType}
            message={editMessage}
            type={userType}
            onClose={() => {
              setEditModalOpen(false);
            }}
          />
        )}
        {reminderModalOpen && (
          <ReminderModal
            msgId={selectedMessageForReminder}
            userId={user?.id}
            onClose={() => {
              setReminderModalOpen(false);
            }}
          />
        )}
        {openFileModal && (
          <FileModal
            fileUrl={openFileModal.url}
            filename={openFileModal.name}
            senderName={openFileModal.sender_name}
            time={openFileModal.time}
            onClose={() => setOpenFileModal(null)}
          />
        )}
        {resultOpen && (
          <PollResults
            msg={msgForResults}
            onClose={() => {
              setResultOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatMessages;
