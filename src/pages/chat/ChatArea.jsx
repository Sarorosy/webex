import { useState } from "react";
import ChatSend from "./ChatSend";
import ChatMessages from "./ChatMessages";

const ChatArea = ({ selectedUser }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "You", text: "Hello!" },
    { id: 2, sender: selectedUser?.name || "User", text: "Hi there!" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "You", text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 p-4 bg-white rounded shadow">
      <div className="flex items-center gap-3 border-b pb-3 mb-4 px-4 py-3 bg-orange-100 rounded-t-lg shadow-inner">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-400 text-white text-xl font-bold shadow">
          {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-wide">
          {selectedUser?.name || "Unknown User"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
       <ChatMessages userId={selectedUser?.id} />
      </div>

      {/* Message Input */}
      <ChatSend userId={selectedUser?.id} type={selectedUser?.type} onSend={(message)=>console.log(message)} />
    </div>
  );
};

export default ChatArea;
