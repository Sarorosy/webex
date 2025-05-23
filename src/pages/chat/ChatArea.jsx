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

const ChatArea = ({view_user_id, selectedUser, setLeftGroupOpen }) => {
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const {selectedMessage , setSelectedMessage} = useSelectedUser();
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();
  const socket = getSocket();


  const [isReply, setIsReply] = useState(false);
  const [replyMsgId, setReplyMsgId] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleGroupInfoClick = (groupId) => {
    setSelectedGroup(groupId);
    setGroupInfoOpen(true);
  }

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
  
  // const [selectedMessage, setSelectedMessage] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  

  return (
    <div className="flex flex-col flex-1 bg-white rounded m-2 ml-0 justify-between">
      <div>
        <div className="chat-headAmsg">
        <ChatHeader selectedUser={selectedUser} isTyping={isTyping} handleGroupInfoClick={handleGroupInfoClick} searchOpen={searchOpen} setSearchOpen={setSearchOpen} setSelectedMessage={setSelectedMessage} query={query} setQuery={setQuery} setSearchResults={setSearchResults} setPinMessagesOpen={setPinMessagesOpen} setLeftGroupOpen={setLeftGroupOpen} />

        {/* Messages */}
       
          <ChatMessages userId={selectedUser?.id} view_user_id={view_user_id} userType={selectedUser?.type} isReply={isReply} setIsReply={setIsReply} replyMsgId={replyMsgId} setReplyMsgId={setReplyMsgId} setReplyMessage={setReplyMessage} selectedMessage={selectedMessage} />
        
        </div>
        <div className="chat-text-n mt-2 bg-white">
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
            
          />
        </div>
      </div>
      
      <AnimatePresence>
        {groupInfoOpen && (
          <GroupInfo selectedGroup={selectedGroup} onClose={()=>{setGroupInfoOpen(false)}} />
        )}
      </AnimatePresence>

      <SearchResults
        searchOpen={searchOpen}
        query={query}
        searchResults={searchResults}
        setSelectedMessage={setSelectedMessage}
        onClose={()=>{setSearchOpen(false)}}
      />

      {pinMessagesOpen && (
        <PinnedMessages userId={user?.id} searchUserId={selectedUser?.id} type={selectedUser?.type} onClose={()=>{setPinMessagesOpen(false)}} setSelectedMessage={setSelectedMessage} />
      )}
    </div>
  );
};

export default ChatArea;
