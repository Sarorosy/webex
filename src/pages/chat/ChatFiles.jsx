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
  SquareArrowOutUpRightIcon,
  Smile,
  QuoteIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import EditModal from "./EditModal";
import ReadPersons from "./ReadPersons";
import ReminderModal from "./ReminderModal";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import FileModal from "../../components/FileModal";

const ChatFiles = ({
  view_user_id,
  userId,
  userType,
  isReply,
  replyMsgId,
  setIsReply,
  setReplyMsgId,
  setReplyMessage,
  setSelectedQuoteMessage,
  scrollToBottom,
  containerRef,
}) => {
  const { selectedMessage, setSelectedMessage } = useSelectedUser();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const [messages, setMessages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [hoveredReplyMessageId, setHoveredReplyMessageId] = useState(null);
  const [latestMessageId, setLatestMessageId] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);

  const isFetchingRef = useRef(false);
  const messageRefs = useRef({});
  const { user, theme } = useAuth();
  const topSentinelRef = useRef(null);
  const hasMoreRef = useRef(true);

  const limit = 20;

  useEffect(() => {
    setLatestMessageId(null);
  }, [view_user_id, userId]);

  const fetchMessages = async (skipCount = 0) => {
    if (isFetchingRef.current) return [];
    // if(!hasMore) return [];

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setMessageLoading(true);

      const res = await fetch(
        `https://webexback-06cc.onrender.com/api/chats/files?sender_id=${
          view_user_id ?? user.id
        }&receiver_id=${userId}&skip=${skipCount}&limit=${limit}&user_type=${userType}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();
      const reversedData = data.reverse();

      console.log(reversedData);

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

        setLatestMessageId(maxId);
        setLatestMessage(latestMsg);
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
    console.log("latest msg id", latestMessageId);
  }, [latestMessageId]);

  useEffect(() => {
    const loadInitialMessages = async () => {
      const initialMessages = await fetchMessages(0);
      setMessages(initialMessages);
      setSkip(initialMessages.length);

      // Check if there are more messages to load based on skip or total message count
      const totalMessages = 0; // Fetch total message count from the API
      setHasMore(initialMessages.length < totalMessages); // Check if more messages exist
    };

    if (userId && user?.id) {
      loadInitialMessages();
    }

    return () => {
      setMessages([]);
      setSkip(0);
      setHasMore(true);
    };
  }, [userId, userType, user?.id]);

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

      const olderMessages = await fetchMessages(skip);
      //const olderMessages = [];

      if (olderMessages.length > 0) {
        setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
        setSkip(skip + olderMessages.length);

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
    console.log("Setting up IntersectionObserver");

    const observer = new IntersectionObserver(
      async ([entry]) => {
        console.log("IntersectionObserver triggered", {
          isIntersecting: entry.isIntersecting,
          hasMore,
          isLoading,
        });

        if (
          entry.isIntersecting &&
          !isLoading &&
          !isFetchingRef.current &&
          hasMoreRef.current &&
          hasMore
        ) {
          const prevScrollHeight = containerRef.current.scrollHeight;

          const olderMessages = await fetchMessages(skip);

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
      console.log("Observer attached to topSentinelRef");
    } else {
      console.warn("topSentinelRef is not available");
    }

    return () => {
      if (topSentinelRef.current) {
        observer.unobserve(topSentinelRef.current);
        console.log("Observer detached from topSentinelRef");
        observer.disconnect();
      }
    };
  }, [skip, hasMore, isLoading]);

  useEffect(() => {
    if (latestMessage) {
      const socket = getSocket();
      connectSocket(user?.id);
      console.log("latestmessage", latestMessage);

      socket.emit("read_message_socket", {
        user_id: user.id,
        message_ids: [latestMessage.id],
        receiver_id: latestMessage.receiver_id,
        user_type: latestMessage.user_type,
      });
    }
  }, [latestMessage]);

  useEffect(() => {
    let mounted = true;

    if (user?.id && userId) {
      const socket = getSocket();
      connectSocket(user.id);

      const parsedUserId = parseInt(userId);

      const handleNewMessage = (msg) => {
        if (!mounted) return;

        console.log(msg, "msg from socket");
        console.log("cuurent userId", userId);

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
          console.log("read_message-emit");
          socket.emit("read_message_socket", {
            user_id: user.id,
            message_ids: [msg.id],
            receiver_id: msg.receiver_id,
            user_type: msg.user_type,
          });

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

        console.log("reply", reply);
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
              socket.emit("read_message_socket", {
                user_id: user.id,
                message_ids: [reply.id],
                receiver_id: reply.receiver_id,
                user_type: reply.user_type,
              });

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

  useEffect(() => {
    const socket = getSocket();
    connectSocket(user.id);

    const handleMessageEdited = (data) => {
      const { msgId, message, userId } = data;

      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg.id == msgId ? { ...msg, message, is_edited: 1 } : msg
        );

        return updatedMessages;
      });
    };

    const handleMessageDelete = (msgId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id == msgId ? { ...msg, is_deleted: 1 } : msg
        )
      );
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
  const [editMessage, setEditMessage] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = (msgId, msg) => {
    setEditMsgId(msgId);
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
    console.log("Forward message:", msgId);
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
      // Emit the 'delete_message' event to the server
      const socket = getSocket(); // Assuming you have a socket connection
      socket.emit("delete_message", { msgId, type });

      // Mark the message as deleted (set is_deleted = 1) in the state
      if (type == "message") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === msgId ? { ...msg, is_deleted: 1 } : msg
          )
        );
      } else if (type == "reply") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (!Array.isArray(msg.replies)) return msg;

            const updatedReplies = msg.replies.map((rep) =>
              rep.id === msgId ? { ...rep, is_deleted: 1 } : rep
            );

            return { ...msg, replies: updatedReplies };
          })
        );
      }

      console.log(`Message with ID ${msgId} marked as deleted`);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleQuote = (msg) => {
    console.log("Quote message:", msg);
    setSelectedQuoteMessage(msg);
    setIsReply(false);
    setReplyMsgId(null);
    setReplyMessage(null);
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
            selmsg.sender_id
          );
          fetchAroundMessageUrl.searchParams.append(
            "user_type",
            selmsg.group_id ? "group" : "user"
          );
          fetchAroundMessageUrl.searchParams.append(
            "receiver_id",
            selmsg.group_id ?? selmsg.receiver_id
          );
          fetchAroundMessageUrl.searchParams.append(
            "created_at",
            selmsg.created_at
          );
          fetchAroundMessageUrl.searchParams.append("limit", "50"); // Fetch a reasonable number of messages

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

          console.log("existingMessage", existingMessage);
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
          console.log("gonna highlight is", selectedMessage.id);

          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedMessageId(null);
          }, 5000);
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (selectedMessage != null) {
      console.log("selectedMessage", selectedMessage);
      scrollToMessage(selectedMessage);
    }
  }, [selectedMessage]);

  const isValidViewUserId =
    Number(view_user_id) > 0 && !isNaN(Number(view_user_id));

  const EmojiPopup = ({ onSelect }) => (
    <div className="ios absolute bottom-6 flex gap-1 px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm z-10">
      {["👍", "😂", "❤️", "😊", "😁", "🤝🏻"].map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
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

    socket.on("reactions_updated", handleReactionsUpdated);

    return () => {
      socket.off("reactions_updated", handleReactionsUpdated);
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

  const [openFileModal, setOpenFileModal] = useState(null);
  return (
    <div
      ref={containerRef}
      className={`messages-container ios flex flex-col p-3 ${
        theme == "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-b from-orange-50 to-white"
      } chat-messages-container-div chat-headAmsg overflow-y-auto`}
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
            <div key={date} className="space-y-4">
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
                      <div className="bg-gray-100 text-[10px] text-gray-600 px-3 py-1.5 rounded-full text-center flex items-center space-x-2 shadow-sm">
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

                const isSent = isValidViewUserId
                  ? msg.sender_id == view_user_id
                  : msg.sender_id == user.id;

                return (
                  <div
                    key={`${msg.id}-${msg.created_at}`}
                    ref={(el) => (messageRefs.current[msg.id] = el)}
                    style={{
                      opacity: isReply && replyMsgId !== msg.id ? "0.3" : "1",
                      filter:
                        isReply && replyMsgId !== msg.id ? "blur(3px)" : "none",
                      boxShadow:
                        isReply && replyMsgId === msg.id
                          ? "0px 0px 8px rgba(37, 99, 235, 0.5)"
                          : "none",
                      transition:
                        "opacity 0.3s ease, filter 0.3s ease, background-color 0.3s ease, transform 0.3s ease",
                    }}
                    className={`message-wrapper gap-2 rounded-lg py-3 w-full flex ${
                      isSent ? "flex-row-reverse" : "justify-start"
                    } ${
                      highlightedMessageId === msg.id
                        ? "animate-pulse-highlight bg-gray-300"
                        : ""
                    }  relative ${
                      theme == "dark" ? "hover:bg-gray-400" : "hover:bg-gray-50"
                    } border border-transparent hover:border-gray-200 msg-number-${
                      msg.id
                    } ${isSent ? "pr-2" : "pl-2"} ${
                      isReply && replyMsgId == msg.id
                        ? "ring-2 ring-blue-400 bg-blue-50 "
                        : ""
                    }`}
                  >
                    <div
                      className={`flex flex-col ${
                        isSent ? "items-end " : "items-start "
                      } `}
                    >
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
                          className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="flex justify-center items-center h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-sm font-medium">
                          {msg.sender_name ? msg.sender_name.charAt(0) : "U"}
                        </div>
                      )}
                    </div>
                    <div
                      className={`message relative max-w-[60%] min-w-[20%] ${
                        isSent
                          ? `${
                              theme == "dark"
                                ? "bg-gray-500 text-gray-50"
                                : "bg-gray-100 text-gray-900"
                            }`
                          : `${
                              theme == "dark"
                                ? "bg-gray-500 text-gray-50 border border-gray-400"
                                : "bg-gray-100 text-gray-900 border border-gray-200"
                            } `
                      } rounded-2xl px-4 py-3 shadow-sm ${
                        isSent ? "rounded-tr-sm" : "rounded-tl-sm"
                      }`}
                    >
                      <div
                        className={`text-xs  mb-1 font-medium ${
                          isSent
                            ? "text-white-600 text-right"
                            : `${
                                theme == "dark" ? "text-white" : "text-gray-600"
                              }`
                        }`}
                      >
                        {isSent && !view_user_id
                          ? "You"
                          : msg.sender_name ?? "Unknown User"}
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
                          const fileUrl = `https://rapidcollaborate.in/ccp${msg.filename}`;
                          const filenameOnly = msg.filename.split("/").pop();

                          return (
                            <div className="w-full mb-3">
                              {/* File Info Box */}
                              <details
                                open
                                className="bg-white/80 border border-gray-300 rounded-lg shadow-sm"
                              >
                                <summary className="flex items-center gap-3 cursor-pointer px-3 py-2 hover:bg-gray-50 transition rounded-lg">
                                  {isImage ? (
                                    <ImageIcon
                                      className="text-pink-500"
                                      size={15}
                                    />
                                  ) : ext === "mp4" || ext === "mov" ? (
                                    <VideoIcon
                                      className="text-purple-600"
                                      size={15}
                                    />
                                  ) : ["doc", "docx", "xls", "xlsx"].includes(
                                      ext
                                    ) ? (
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
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="f-11 text-blue-600 hover:underline  flex items-center"
                                    >
                                      {msg.filename.split("/").pop()}
                                    </a>
                                  </span>
                                </summary>

                                {/* File Preview */}
                                <div className="p-3 border-t border-gray-200">
                                  {isImage ? (
                                    <button
                                      onClick={() =>
                                        setOpenFileModal({
                                          url: `https://rapidcollaborate.in/ccp${msg.filename}`,
                                          name: msg.filename.split("/").pop(),
                                        })
                                      }
                                    >
                                      <img
                                        src={fileUrl}
                                        alt={msg.filename}
                                        className="rounded-md shadow max-w-36 h-full object-contain"
                                      />
                                    </button>
                                  ) : (
                                    <button
                                      className="text-sm text-blue-600 hover:underline flex items-center"
                                      onClick={() =>
                                        setOpenFileModal({
                                          url: `https://rapidcollaborate.in/ccp${msg.filename}`,
                                          name: msg.filename.split("/").pop(),
                                        })
                                      }
                                    >
                                      open{" "}
                                      <SquareArrowOutUpRightIcon
                                        size={15}
                                        className="ml-1"
                                      />
                                    </button>
                                  )}
                                </div>
                              </details>
                            </div>
                          );
                        })()}

                      <div className="message-content">
                        {msg.is_quoted == 1 &&
                          msg.quoted_msg &&
                          msg.quoted_msg_name &&
                          msg.quoted_msg_id && (
                            <div className="border-l-2 border-orange-500 bg-orange-50 px-2 py-1 rounded-sm mb-1 text-[11px] text-gray-800">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-gray-700 mr-1">
                                  {msg.quoted_msg_name?.length > 15
                                    ? msg.quoted_msg_name.slice(0, 15) + "…"
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
                                  className="text-orange-500 hover:underline"
                                >
                                  Go to message →
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
                          className={`prose prose-sm ${
                            isSent ? "text-start" : "text-start"
                          } max-w-none ${
                            isSingleEmoji(msg.message)
                              ? "text-[26px]"
                              : "text-[13px]"
                          }`}
                          dangerouslySetInnerHTML={{ __html: msg.message }}
                        ></div>
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
                            <span className="absolute top-[-8px] right-[-3px] animate-pulse">
                              <Pin
                                size={18}
                                className="text-orange-500 fill-orange-500 rotate-45"
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
                            <div className="mt-3 space-y-2.5 min-w-80">
                              {replies.map((reply) => {
                                if (
                                  reply.is_deleted == 1 &&
                                  reply.is_reply == 1
                                ) {
                                  return (
                                    <div
                                      key={`${reply.id}-${reply.created_at}`}
                                      className={`w-full flex justify-center my-2 `}
                                    >
                                      <div className="bg-gray-100 text-[10px] text-gray-600 px-3 py-1.5 rounded-full text-center flex items-center space-x-2 shadow-sm">
                                        <Trash2
                                          size={10}
                                          className="text-gray-500 mr-1"
                                        />
                                        <div>
                                          {reply.sender_name ?? ""} deleted
                                          their own reply
                                        </div>
                                        <div className="text-[9px] opacity-70">
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
                                    key={`${reply.id}-${reply.created_at}`}
                                    ref={(el) =>
                                      (messageRefs.current[reply.id] = el)
                                    }
                                    className={`reply-box  ${
                                      highlightedMessageId == reply.id
                                        ? " bg-gray-300"
                                        : " bg-gray-50"
                                    } border-l-2 border-blue-400 p-2 rounded text-sm text-gray-800 shadow-sm hover:shadow-md transition-shadow relative`}
                                  >
                                    <div
                                      className={`font-semibold text-gray-700 flex items-center gap-2 mb-1 `}
                                    >
                                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Reply
                                          size={10}
                                          className="text-blue-600"
                                        />
                                      </div>
                                      {reply.profile_pic &&
                                      reply.profile_pic !== "null" &&
                                      reply.profile_pic !== "" ? (
                                        <img
                                          src={
                                            reply.profile_pic.startsWith("http")
                                              ? reply.profile_pic
                                              : `https://rapidcollaborate.in/ccp${reply.profile_pic}`
                                          }
                                          className="h-6 w-6 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                      ) : (
                                        <div className="flex justify-center items-center h-6 w-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-sm font-medium">
                                          {reply.sender_name
                                            ? reply.sender_name.charAt(0)
                                            : "U"}
                                        </div>
                                      )}

                                      {reply.sender_id == user?.id &&
                                      !view_user_id
                                        ? "You"
                                        : reply.sender_name || "User"}
                                    </div>
                                    <div
                                      className="prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: reply.message,
                                      }}
                                    ></div>
                                    {(() => {
                                      let pinned = [];

                                      if (Array.isArray(reply.pinned_users)) {
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
                                        <span className="absolute top-[-8px] right-[-3px] animate-pulse">
                                          <Pin
                                            size={18}
                                            className="text-orange-500 fill-orange-500 rotate-45"
                                          />
                                        </span>
                                      ) : null;
                                    })()}
                                    {(() => {
                                      let reactions = [];

                                      try {
                                        const parsed =
                                          typeof reply.reactions === "string"
                                            ? JSON.parse(reply.reactions)
                                            : reply.reactions;

                                        if (Array.isArray(parsed)) {
                                          reactions = parsed;
                                        }
                                      } catch {
                                        reactions = [];
                                      }

                                      if (reactions.length === 0) return null;

                                      const reactionMap = reactions.reduce(
                                        (acc, r) => {
                                          acc[r.emoji] =
                                            (acc[r.emoji] || 0) + 1;
                                          return acc;
                                        },
                                        {}
                                      );

                                      return (
                                        <div className="mt-2 flex gap-2 flex-wrap text-sm relative">
                                          {hoveredReplyEmoji &&
                                            hoveredReplyEmoji == reply.id && (
                                              <div
                                                ref={tooltipRef}
                                                className="absolute top-[30px]  z-50 h-auto max-h-36 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md p-2 w-48 text-xs"
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
                                                            alt={user.name}
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

                                          {Object.entries(reactionMap).map(
                                            ([emoji, count]) => (
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
                                            )
                                          )}
                                        </div>
                                      );
                                    })()}
                                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                                      {formatTime(reply.created_at)}
                                    </div>

                                    {/* Reply Actions */}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <div
                        className={`message-time flex items-center text-xs ${
                          isSent ? "justify-end" : "justify-start"
                        } mt-1.5 ${
                          isSent
                            ? `${
                                theme == "dark"
                                  ? "text-gray-100"
                                  : "text-gray-600"
                              }`
                            : `${
                                theme == "dark"
                                  ? "text-gray-100"
                                  : "text-gray-400"
                              }`
                        }`}
                      >
                        {msg.is_edited == 1 && (
                          <p className="text-[9px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full mr-2 font-medium flex items-center">
                            <Pen size={8} className="mr-0.5" /> edited
                          </p>
                        )}{" "}
                        {formatTime(msg.created_at)}
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

                        const reactionMap = reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {});

                        return (
                          <div className="mt-2 flex gap-2 flex-wrap text-sm relative">
                            {hoveredEmoji && hoveredEmoji == msg.id && (
                              <div
                                ref={tooltipRef}
                                className="absolute text-black top-[30px]  z-50 h-auto max-h-36 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md p-2 w-48 text-xs"
                              >
                                {loadingReactions ? (
                                  <div>Loading...</div>
                                ) : (
                                  <div className="space-y-1 ios">
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
                                          alt={user.name}
                                          className="w-5 h-5 rounded-full"
                                        />
                                        <span>{user.name}</span>
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
                                  onMouseEnter={(e) =>
                                    handleReactionHover(
                                      e,
                                      emoji,
                                      msg,
                                      "message"
                                    )
                                  }
                                  //onMouseLeave={clearHover}
                                  className="bg-gray-100 ios border cursor-pointer text-gray-700 border-gray-300 px-2 py-0.5 rounded-full text-xs flex items-center"
                                >
                                  <span className="mr-1">{emoji}</span>
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
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div>
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToBottom}
                className="down-btn-set transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-1 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all z-10 flex items-center justify-center"
              >
                <ArrowDown size={20} />
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
            onClose={() => setOpenFileModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatFiles;
