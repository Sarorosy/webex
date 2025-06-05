import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { X } from "lucide-react";
import { useAuth } from "../../utils/idb";

const PinnedMessages = ({ userId, searchUserId, type, setSelectedMessage, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const {theme} = useAuth();

  useEffect(() => {

    setLoading(true);
    axios
      .post("https://webexback-vb1k.onrender.com/api/messages/pinned-messages", {
        user_id: userId,
        search_user_id: searchUserId,
        type,
      })
      .then((res) => {
        setMessages(res.data.messages || []);
      })
      .catch((err) => {
        console.error("Failed to fetch pinned messages:", err);
      })
      .finally(() => setLoading(false));
  }, [userId, searchUserId, type]);

  return (
    <AnimatePresence>
      
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "tween", duration: 0.3 }}
         className={`fixed top-0 left-0 w-[28.6%] h-[100vh] ${theme == "dark" ? "bg-gray-800 text-white" : "bg-white text-black"} shadow-xl border-l border-gray-300 z-[100] overflow-y-auto`}
        >
          <div className="p-4 border-b font-semibold text-lg bg-gray-300 flex justify-between items-center">
            <span>Pinned Messages</span>
            <button
              onClick={onClose}
              className="text-sm text-white bg-orange-600 px-1 py-1 rounded"
            >
              <X size={13}/>
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                    console.log("Clicked pinned message:", msg)
                    setSelectedMessage(msg)
                }}
                className={`p-3  border-b text-sm ${theme == "dark" ? " text-white hover:bg-gray-400 hover:text-black" : "text-gray-800 hover:bg-gray-100"} cursor-pointer`}
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
                  <div className="text-xs text-gray-500">
                    {msg.sender_name} –{" "}
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: msg.message }}
                />
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-500 italic">
              No pinned messages found.
            </div>
          )}
        </motion.div>
      
    </AnimatePresence>
  );
};

export default PinnedMessages;
