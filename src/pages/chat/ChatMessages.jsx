import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../utils/idb";
import { getSocket, connectSocket } from "../../utils/Socket";
import toast from "react-hot-toast";
import { Forward, MapPin, Pen, Pin, Reply } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import EditModal from "./EditModal";

const ChatMessages = ({
  view_user_id,
  userId,
  userType,
  isReply,
  replyMsgId,
  setIsReply,
  setReplyMsgId,
  setReplyMessage,
}) => {
  const [messages, setMessages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const containerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const messageRefs = useRef({});
  const { user } = useAuth();

  const limit = 10;

  const fetchMessages = async (skipCount = 0) => {
    if (isFetchingRef.current) return [];

    try {
      isFetchingRef.current = true;
      setIsLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/chats/messages?sender_id=${
          view_user_id ?? user.id
        }&receiver_id=${userId}&skip=${skipCount}&limit=${limit}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();
      return data.reverse();
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialMessages = async () => {
      const initialMessages = await fetchMessages(0);
      setMessages(initialMessages);
      setSkip(initialMessages.length);
      setHasMore(initialMessages.length >= limit);
    };

    if (userId && user?.id) {
      loadInitialMessages();
    }

    return () => {
      setMessages([]);
      setSkip(0);
      setHasMore(true);
    };
  }, [userId, user?.id]);

  useEffect(() => {
    let mounted = true;

    if (user?.id && userId) {
      const socket = getSocket();
      connectSocket(user.id);

      const parsedUserId = parseInt(userId);

      const handleNewMessage = (msg) => {
        if (!mounted) return;

        const isRelevantMessage =
          (msg.sender_id == user.id && msg.receiver_id == parsedUserId) ||
          (msg.sender_id == parsedUserId && msg.receiver_id == user.id);

        if (isRelevantMessage) {
          setMessages((prevMessages) => {
            if (prevMessages.some((m) => m.id === msg.id)) {
              return prevMessages;
            }
            return [...prevMessages, msg];
          });

          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop =
                containerRef.current.scrollHeight;
            }
          }, 0);
        }
      };

      const handleNewReply = (reply) => {
        if (!mounted) return;

        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.id === reply.msg_id) {
              let existingReplies = [];

              try {
                existingReplies = Array.isArray(msg.replies)
                  ? msg.replies
                  : JSON.parse(msg.replies || "[]");
              } catch {
                existingReplies = [];
              }

              return {
                ...msg,
                replies: [...existingReplies, reply],
              };
            }
            return msg;
          })
        );
      };

      socket.off("new_message");
      socket.on("new_message", handleNewMessage);

      socket.off("new_reply");
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
    if (containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length === 0 ? messages : null]);

  const handleScroll = async () => {
    const container = containerRef.current;

    if (!container || !hasMore || isLoading || isFetchingRef.current) return;

    if (container.scrollTop < 100) {
      const prevScrollHeight = container.scrollHeight;

      const olderMessages = await fetchMessages(skip);

      if (olderMessages.length > 0) {
        setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
        setSkip(skip + olderMessages.length);
        setHasMore(olderMessages.length >= limit);

        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }, 10);
      } else {
        setHasMore(false);
      }
    }
  };

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
  };

  const handleForward = (msgId) => {
    console.log("Forward message:", msgId);
    toast.success("Forward clicked for message " + msgId);
  };
  const handlePinMsg = async (msgId) => {
    try {
      const userId = Number(user.id); // Ensure consistent variable
      const response = await fetch("http://localhost:5000/api/messages/pin", {
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
  const scrollToMessage = async (targetId) => {
    let found = messages.some((msg) => msg.id === targetId);

    while (!found && hasMore) {
      const olderMessages = await fetchMessages(skip);
      if (olderMessages.length === 0) break;

      setMessages((prev) => [...olderMessages, ...prev]);
      setSkip((prev) => prev + olderMessages.length);
      found = olderMessages.some((msg) => msg.id === targetId);
    }

    // Give React time to render
    setTimeout(() => {
      const el = messageRefs.current[targetId];
      if (el && containerRef.current) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const isValidViewUserId =
    Number(view_user_id) > 0 && !isNaN(Number(view_user_id));
  return (
    <div
      ref={containerRef}
      className="messages-container h-[70vh] overflow-y-auto flex flex-col p-4"
      onScroll={handleScroll}
    >
      {isLoading && (
        <div className="loading-indicator text-center py-2">Loading...</div>
      )}

      <div className="message-full-box w-full flex flex-col">
        {Object.keys(groupedMessages).length === 0 && !isLoading ? (
          <div className="no-messages text-center py-8 text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date}>
              <div className="date-separator flex items-center text-center text-xs text-gray-500 mt-4 mb-2 ">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-4 bg-gray-200 rounded-full">
                  {formatDate(messages[0].created_at)}
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {messages.map((msg) => {
                const isSent = isValidViewUserId
                  ? msg.sender_id == view_user_id
                  : msg.sender_id == user.id;

                return (
                  <div
                    key={msg.id}
                    ref={(el) => (messageRefs.current[msg.id] = el)}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    style={{
                      
                      opacity: isReply && replyMsgId !== msg.id ? "0.3" : "1",
                      filter:
                        isReply && replyMsgId !== msg.id ? "blur(3px)" : "none",
                      //backgroundColor:
                      //isReply && replyMsgId === msg.id ? "#FCFEFFFF" : "transparent", // Highlight
                      boxShadow:
                        isReply && replyMsgId === msg.id
                          ? "0px 0px 5px #3D3D3DFF"
                          : "none", // Glow effect
                      transition:
                        "opacity 0.3s ease, filter 0.3s ease, background-color 0.3s ease, transform 0.3s ease",
                    }}
                    className={`message-wrapper rounded py-2 w-full flex ${
                      isSent ? "justify-end" : "justify-start"
                    } mb-2 relative hover:bg-gray-100 border border-transparent hover:border-gray-300 msg-number-${msg.id}`}
                  >
                    <div
                      className={`text-xs mb-1 px-1 ${
                        isSent
                          ? "text-right text-blue-600"
                          : "text-left text-gray-600"
                      }`}
                    >
                      {isSent ? "You" : msg.sender_name ?? "Unknown User"}
                    </div>
                    <div
                      className={`message relative max-w-[70%] ${
                        isSent
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      } rounded-2xl px-3 py-2`}
                    >
                      <div className="message-content"
                      >
                        <div dangerouslySetInnerHTML={{ __html: msg.message }}></div>
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
                            <span className="absolute top-[-8px] right-[-3px]">
                              <Pin
                                size={18}
                                className="text-orange-600 fill-orange-600 rotate-45"
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
                            <div className="mt-2 space-y-2">
                              {replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="reply-box bg-white border-l-4 border-blue-500 p-2 rounded text-sm text-gray-800 shadow-sm"
                                >
                                  <div className="font-semibold text-blue-600">
                                    {reply.sender_id == user?.id
                                      ? "You"
                                      : reply.reply_user_name || "User"}
                                  </div>
                                  <div>{reply.reply_message}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {formatTime(reply.reply_at)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <div
                        className={`message-time text-xs opacity-70 ${
                          isSent ? "text-right" : "text-left"
                        } mt-1`}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                    {hoveredMessageId === msg.id && (
                      <div
                        className="border  message-actions absolute -top-5 bg-white rounded-full shadow-md flex p-1 z-10"
                        style={{
                          [isSent ? "left" : "right"]: "0",
                        }}
                      >
                        {isSent && (
                          <button
                            onClick={() => handleEdit(msg.id, msg.message)}
                            className="action-button p-1 text-gray-600 hover:bg-gray-100 rounded-full mx-1"
                          >
                            <Pen size={15} />
                          </button>
                        )}

                        <button
                          onClick={() => handleReply(msg.id, msg.message)}
                          className="action-button p-1 text-gray-600 hover:bg-gray-100 rounded-full mx-1"
                        >
                          <Reply size={15} />
                        </button>

                        <button
                          onClick={() => handleForward(msg.id)}
                          className="action-button p-1 text-gray-600 hover:bg-gray-100 rounded-full mx-1"
                        >
                          <Forward size={15} />
                        </button>

                        <button
                          onClick={() => handlePinMsg(msg.id)}
                          className="action-button p-1 text-gray-600 hover:bg-gray-100 rounded-full mx-1 rotate-45"
                        >
                          <Pin size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {editModalOpen && (
          <EditModal
            msgId={editMsgId}
            message={editMessage}
            type={userType}
            onClose={() => {
              setEditModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatMessages;
