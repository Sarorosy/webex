import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { X } from "lucide-react";
import { useAuth } from "../../utils/idb";
import { connectSocket, getSocket } from "../../utils/Socket";

const PinnedMessages = ({ userId, searchUserId, type, setSelectedMessage, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user, theme} = useAuth();

  const fetchPinnedMessages = async (userId, searchUserId, type) => {
  setLoading(true);
  try {
    const res = await axios.post(
      "https://webexback-06cc.onrender.com/api/messages/pinned-messages",
      {
        user_id: userId,
        search_user_id: searchUserId,
        type,
      }
    );
    setMessages(res.data.messages || []);
  } catch (err) {
    console.error("Failed to fetch pinned messages:", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPinnedMessages(userId, searchUserId, type);
}, [userId, searchUserId, type]);



  useEffect(() => {
      if (!user) return;
  
      connectSocket(user.id);
      const socket = getSocket();
  
      
  
      const handlePinMsg = (msgObj) => {
        const { user_id } = msgObj;
  
        // Update chats list if deleted message is the last message
        if(user_id == userId){
          fetchPinnedMessages(userId, searchUserId, type);
        }
      };
  
      socket.on("pinUpdated", handlePinMsg);
  
      return () => {
        socket.off("pinUpdated", handlePinMsg);
      };
    }, [user]);

  return (
    <AnimatePresence>
      
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "tween", duration: 0.3 }}
         className={`fixed top-0 left-0 w-[24.6%] h-[100vh] ${theme == "dark" ? "bg-gray-800 text-white mw-dark" : "bg-white text-black"} shadow-xl border-l border-gray-300 z-[100] overflow-y-auto prose`}
        >
          <div className={`p-4 py-2 border-b font-semibold text-lg flex justify-between items-center sticky top-0
            ${theme == "dark" ? "bg-gray-500 text-white mw-dark" : "bg-gray-300 text-black"}
          `}>
            <span>Pinned Messages</span>
            <button
              onClick={onClose}
              className="text-sm text-white bg-orange-600 px-1 py-1 rounded  hover:bg-orange-800"
            >
              <X size={13}/>
            </button>
          </div>

          {loading ? (
            <div className="p-4 ">Loading...</div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                    console.log("Clicked pinned message:", msg)
                    setSelectedMessage(msg)
                }}
                className={`p-3 f-13 border-b  ${theme == "dark" ? " text-white hover:bg-gray-700  mw-dark" : "text-gray-800 hover:bg-gray-100"} cursor-pointer `}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.profile_pic ? (
                    <img
                      src={`https://rapidcollaborate.in/ccp${msg.profile_pic}`}
                      alt={msg.sender_name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-xs uppercase">
                      {msg.sender_name.charAt(0)}
                    </div>
                  )}
                  <div className="text-xs ">
                    {msg.sender_name} –{" "}
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
                <div
                  className=""
                  dangerouslySetInnerHTML={{ __html: msg.message }}
                />
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500 italic">
              No pinned messages found.
            </div>
          )}
        </motion.div>
      
    </AnimatePresence>
  );
};

export default PinnedMessages;
