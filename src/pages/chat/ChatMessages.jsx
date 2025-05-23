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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EditModal from "./EditModal";
import ReadPersons from "./ReadPersons";
import ReminderModal from "./ReminderModal";
import { useSelectedUser } from "../../utils/SelectedUserContext";

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

  const {selectedMessage, setSelectedMessage} = useSelectedUser();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const [messages, setMessages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [latestMessageId, setLatestMessageId] = useState(null);
  const containerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const messageRefs = useRef({});
  const { user } = useAuth();
  const topSentinelRef = useRef(null);
  const hasMoreRef = useRef(true);

  const limit = 20;

  useEffect(() => {
    setLatestMessageId(null);
  }, [view_user_id, userId]);

  const fetchMessages = async (skipCount = 0) => {
    if (isFetchingRef.current) return [];

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setMessageLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/chats/messages?sender_id=${
          view_user_id ?? user.id
        }&receiver_id=${userId}&skip=${skipCount}&limit=${limit}&user_type=${userType}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();
      const reversedData = data.reverse();

      if (reversedData.length > 0) {
        setLatestMessageId(reversedData[reversedData.length - 1].id);
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
  }, [userId, user?.id]);

  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length === 0 ? messages : null]);

  const handleScroll = async () => {
    const container = containerRef.current;

    if (!container || isLoading || isFetchingRef.current) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;
    setShowScrollToBottom(!isAtBottom);

    if (container.scrollTop < 100) {
      const prevScrollHeight = container.scrollHeight;

      const olderMessages = await fetchMessages(skip);

      if (olderMessages.length > 0) {
        setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
        setSkip(skip + olderMessages.length);

        const moreAvailable = olderMessages.length === limit;
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

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
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
          msg.user_type == "group" && msg.receiver_id == userId;

        const isPrivateMessage =
          msg.user_type == "user" &&
          ((msg.sender_id == user.id && msg.receiver_id == parsedUserId) ||
            (msg.sender_id == parsedUserId && msg.receiver_id == user.id));

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
            if (msg.id == reply.msg_id) {
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

  const handleDeleteMsg = (msgId) => {
    try {
      // Emit the 'delete_message' event to the server
      const socket = getSocket(); // Assuming you have a socket connection
      socket.emit("delete_message", msgId);

      // Mark the message as deleted (set is_deleted = 1) in the state
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === msgId ? { ...msg, is_deleted: 1 } : msg
        )
      );

      console.log(`Message with ID ${msgId} marked as deleted`);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  const scrollToMessage = async (selmsg) => {
    if (selmsg) {
      console.log("coming");
      // Check if the message is already in the current messages array
      let existingMessage = messages.find(
        (msg) => msg.id == selmsg.id
      );

      // If message is not found, we'll implement a multi-step fetch strategy
      if (!existingMessage) {
        try {
          
          // First, try to fetch messages around the selected message's timestamp
          const fetchAroundMessageUrl = new URL(
            "http://localhost:5000/api/chats/messages"
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
          existingMessage = mergedMessages.find(
            (msg) => msg.id == selmsg.id
          );
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

  useEffect(() => {
    if (selectedMessage != null) {
      console.log("selectedMessage", selectedMessage)
      scrollToMessage(selectedMessage);
    }
  }, [selectedMessage]);

  const isValidViewUserId =
    Number(view_user_id) > 0 && !isNaN(Number(view_user_id));

  return (
    <div
      ref={containerRef}
      className="messages-container flex flex-col p-3 bg-gradient-to-b from-orange-50 to-white chat-messages-container-div overflow-y-auto h-[90%]"
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
                if (msg.is_deleted == 1) {
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
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    onDoubleClick={() => handleReply(msg.id, msg.message)}
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
                        ? "animate-pulse-highlight bg-yellow-50"
                        : ""
                    } mb-3 relative hover:bg-gray-50 border border-transparent hover:border-gray-200 msg-number-${
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
                      {msg.profile_pic ? (
                        <img
                          src={"https://rapidcollaborate.in/webex" + msg.profile_pic}
                          className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="flex justify-center items-center h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-sm font-medium">
                          {msg.sender_name ? msg.sender_name.charAt(0) : "U"}
                        </div>
                      )}
                    </div>
                    <div
                      className={`message relative max-w-[70%] min-w-[20%] ${
                        isSent
                          ? "bg-gray-100 text-gray-900"
                          : "bg-white text-gray-800 border border-gray-200"
                      } rounded-2xl px-4 py-3 shadow-sm ${
                        isSent ? "rounded-tr-sm" : "rounded-tl-sm"
                      }`}
                    >
                      <div
                        className={`text-xs  mb-1 font-medium ${
                          isSent ? "text-white-600 text-right" : "text-gray-600"
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
                            "webp",
                          ].includes(ext);
                          const fileUrl = `https://rapidcollaborate.in/webex${msg.filename}`;
                          const filenameOnly = msg.filename.split('/').pop();

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
                                       {msg.filename.split('/').pop()}
                                    </a>
                                  </span>
                                </summary>

                                {/* File Preview */}
                                <div className="p-3 border-t border-gray-200">
                                  {isImage ? (
                                    <img
                                      src={fileUrl}
                                      alt={msg.filename}
                                      className="rounded-md shadow max-w-36 h-full object-contain"
                                    />
                                  ) : (
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline flex items-center"
                                    >
                                      open{" "}
                                      <SquareArrowOutUpRightIcon
                                        size={15}
                                        className="ml-1"
                                      />
                                    </a>
                                  )}
                                </div>
                              </details>
                            </div>
                          );
                        })()}

                      <div className="message-content">
                        <div
                          className="prose prose-sm max-w-none"
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
                            <div className="mt-3 space-y-2.5">
                              {replies.map((reply) => (
                                <div
                                  key={`${reply.id}-${reply.created_at}`}
                                  className="reply-box bg-gray-50 border-l-4 border-blue-400 p-3 rounded-md text-sm text-gray-800 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="font-semibold text-blue-700 flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                                      <Reply
                                        size={10}
                                        className="text-blue-600"
                                      />
                                    </div>
                                    {reply.sender_id == user?.id &&
                                    !view_user_id
                                      ? "You"
                                      : reply.reply_user_name || "User"}
                                  </div>
                                  <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                      __html: reply.reply_message,
                                    }}
                                  ></div>
                                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                                    <Clock size={10} className="mr-1" />
                                    {formatTime(reply.reply_at)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <div
                        className={`message-time flex items-center text-xs ${
                          isSent ? "justify-end" : "justify-start"
                        } mt-1.5 ${isSent ? "text-gray-600" : "text-gray-400"}`}
                      >
                        {msg.is_edited == 1 && (
                          <p className="text-[9px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full mr-2 font-medium flex items-center">
                            <Pen size={8} className="mr-0.5" /> edited
                          </p>
                        )}{" "}
                        <Clock size={10} className="mr-1" />
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                    {hoveredMessageId === msg.id && (
                      <div
                        className="chat-funt-set message-actions absolute -top-5 bg-white rounded-full flex z-10 border border-gray-200 transition-all duration-200"
                        style={{
                          [isSent ? "left" : "right"]: "2%",
                        }}
                      >
                        {isSent && (
                          <button
                            onClick={() => handleEdit(msg.id, msg.message)}
                            className="action-button p-2 px-3 text-gray-600 hover:bg-blue-50  transition-colors"
                            title="Edit message"
                          >
                            <Pen size={13} />
                          </button>
                        )}

                        <button
                          onClick={() => handleReply(msg.id, msg.message)}
                          className="action-button p-2 px-3 text-gray-600 hover:bg-green-50  transition-colors"
                          title="Reply"
                        >
                          <Reply size={13} />
                        </button>

                        <button
                          onClick={() => handleReminder(msg.id)}
                          className="action-button p-2 px-3 text-gray-600 hover:bg-purple-50  transition-colors"
                          title="Set reminder"
                        >
                          <BellDot size={13} />
                        </button>

                        <button
                          onClick={() => handlePinMsg(msg.id)}
                          className="action-button p-2 px-3 text-gray-600 hover:bg-orange-50  transition-colors"
                          title="Pin message"
                        >
                          <Pin size={13} />
                        </button>

                        {isSent && (
                          <button
                            onClick={() => handleDeleteMsg(msg.id)}
                            className="action-button p-2 px-3 text-gray-600 hover:bg-red-50  transition-colors"
                            title="Delete message"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
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
      </AnimatePresence>
    </div>
  );
};

export default ChatMessages;
