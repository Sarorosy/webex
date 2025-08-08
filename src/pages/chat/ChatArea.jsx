import { useState, useRef, useEffect } from "react";
import ChatSend from "./ChatSend";
import ChatMessages from "./ChatMessages";
import { getSocket, connectSocket } from "../../utils/Socket";
import { useAuth } from "../../utils/idb";
import TypingIndicator from "./TypingIndicator";
import ChatHeader from "./ChatHeader";
import { AnimatePresence } from "framer-motion";
import GroupInfo from "../groups/GroupInfo";
import SearchResults from "./SearchResults";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import PinnedMessages from "./PinnedMessages";
import ChatFiles from "./ChatFiles";
import PollMessages from "./PollMessages";
const ChatArea = ({
  view_user_id,
  selectedUser,
  setLeftGroupOpen,
  handleMouseDown,
  isResizing,
  sidebarWidth,
  ismentioned,
  newMessages,
  setNewMessages
}) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { selectedMessage, setSelectedMessage } = useSelectedUser();
  const typingTimeoutRef = useRef(null);
  const { user, theme } = useAuth();
  const socket = getSocket();

  const [chatTab, setChatTab] = useState("chats"); //chats, files

  const [isReply, setIsReply] = useState(false);
  const [replyMsgId, setReplyMsgId] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);

  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleGroupInfoClick = (groupId) => {
    setSelectedGroup(groupId);
    setGroupInfoOpen(true);
  };

  const [selectedQuoteMessage, setSelectedQuoteMessage] = useState(null);

  useEffect(() => {
    if (user?.id && selectedUser.id) {
      connectSocket(user.id);

      const handleTyping = ({ from, to }) => {
        if (to == user.id && from == parseInt(selectedUser.id)) {
          setIsTyping(true);

          // Clear previous timer and reset it
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      };

      socket.on("typing", handleTyping);

      return () => {
        socket.off("typing", handleTyping);
      };
    }
  }, [user?.id, selectedUser.id]);

  useEffect(() => {
    socket.on("typing", ({ from, to }) => {
      if (to == user.id && from == selectedUser.id) {
        setIsTyping(true);

        // Hide typing after 2 seconds of inactivity
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.off("typing");
    };
  }, [selectedUser?.id]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [pinMessagesOpen, setPinMessagesOpen] = useState(false);
  const [pollMessagesOpen, setPollMessagesOpen] = useState(false);

  // const [selectedMessage, setSelectedMessage] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState([]);

  const containerRef = useRef(null);
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight + 10000000,
        behavior: "smooth",
      });
    }
  };

  const [height, setHeight] = useState(90); // initial height
  const startResizing = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    // Change cursor to 'ns-resize'
    document.body.style.cursor = "row-resize";

    const onMouseMove = (e) => {
      const newHeight = startHeight - (e.clientY - startY);
      if (newHeight > 70) {
        setHeight(newHeight);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      // Reset cursor to default
      document.body.style.cursor = "default";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  

  return (
    <div
      className={`w-fit flex-1 rounded-lg pl-1 flex flex-col justify-between relative h-screen ${
        isResizing ? " select-none pointer-events-none fixed" : ""
      }`}
    >
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 left-0 h-full w-1.5 cursor-col-resize z-[99] bg-[] hover:bg-orange-300 hover:w-1.5"
      ></div>
      <ChatHeader
        selectedUser={selectedUser}
        isTyping={isTyping}
        handleGroupInfoClick={handleGroupInfoClick}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        setSelectedMessage={setSelectedMessage}
        query={query}
        setQuery={setQuery}
        setSearchResults={setSearchResults}
        setPinMessagesOpen={setPinMessagesOpen}
        setLeftGroupOpen={setLeftGroupOpen}
        setSearchLoading={setSearchLoading}
        setPollMessagesOpen={setPollMessagesOpen}
        chatTab={chatTab}
        setChatTab={setChatTab}
      />

      {/* Messages */}
      {chatTab == "chats" ? (
        <ChatMessages
          userId={selectedUser?.id}
          view_user_id={view_user_id}
          userType={selectedUser?.type}
          isReply={isReply}
          setIsReply={setIsReply}
          replyMsgId={replyMsgId}
          setReplyMsgId={setReplyMsgId}
          setReplyMessage={setReplyMessage}
          selectedMessage={selectedMessage}
          selectedQuoteMessage={selectedQuoteMessage}
          setSelectedQuoteMessage={setSelectedQuoteMessage}
          scrollToBottom={scrollToBottom}
          containerRef={containerRef}
          isTyping={isTyping}
          isResizing={isResizing}
          ismentioned={ismentioned}
          newMessages={newMessages}
          setNewMessages={setNewMessages}
        />
      ) : (
        <ChatFiles
          userId={selectedUser?.id}
          view_user_id={view_user_id}
          userType={selectedUser?.type}
          isReply={isReply}
          setIsReply={setIsReply}
          replyMsgId={replyMsgId}
          setReplyMsgId={setReplyMsgId}
          setReplyMessage={setReplyMessage}
          selectedMessage={selectedMessage}
          setSelectedQuoteMessage={setSelectedQuoteMessage}
          scrollToBottom={scrollToBottom}
          containerRef={containerRef}
        />
      )}

      {chatTab == "chats" && (
        <div className={` chat-text-n ${theme == "dark" ? "" : "bg-white"}`}>
          {/* Message Input */}
          <ChatSend
            userId={selectedUser?.id}
            type={selectedUser?.type}
            isReply={isReply}
            setIsReply={setIsReply}
            replyMsgId={replyMsgId}
            setReplyMsgId={setReplyMsgId}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
            selectedQuoteMessage={selectedQuoteMessage}
            setSelectedQuoteMessage={setSelectedQuoteMessage}
            scrollToBottom={scrollToBottom}
            startResizing={startResizing}
            height={height}
          />
        </div>
      )}

      <AnimatePresence>
        {groupInfoOpen && (
          <GroupInfo
            selectedGroup={selectedGroup}
            onClose={() => {
              setGroupInfoOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <SearchResults
        searchLoading={searchLoading}
        searchOpen={searchOpen}
        query={query}
        searchResults={searchResults}
        setSelectedMessage={setSelectedMessage}
        onClose={() => {
          setSearchOpen(false);
        }}
      />

      {pinMessagesOpen && (
        <PinnedMessages
          userId={user?.id}
          searchUserId={selectedUser?.id}
          type={selectedUser?.type}
          onClose={() => {
            setPinMessagesOpen(false);
          }}
          setSelectedMessage={setSelectedMessage}
        />
      )}

      {pollMessagesOpen && (
        <PollMessages
          userId={user?.id}
          searchUserId={selectedUser?.id}
          type={selectedUser?.type}
          onClose={() => {
            setPollMessagesOpen(false);
          }}
          setSelectedMessage={setSelectedMessage}
        />
      )}
    </div>
  );
};

export default ChatArea;
