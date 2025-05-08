import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import { useState } from "react";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="flex flex-col h-screen p-1 border rounded sticky top-0">
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar onSelect={setSelectedUser} />
        {selectedUser && (
          <ChatArea selectedUser={selectedUser} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
