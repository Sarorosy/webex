import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import { useState } from "react";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const {view_user_id, view_user_name} = useParams();

  return (
    <div className="flex flex-col h-screen p-1 border rounded sticky top-0">
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar view_user_id={view_user_id} view_user_name={view_user_name} selectedUser={selectedUser} onSelect={setSelectedUser} />
        {selectedUser && (
          <ChatArea selectedUser={selectedUser} view_user_id={view_user_id} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
