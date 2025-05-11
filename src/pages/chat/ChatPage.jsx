import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { decode } from "../../utils/encoder";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  let { view_user_id, view_user_name } = useParams();

  
  if (view_user_id && view_user_name) {
    try {
      view_user_id = decode(view_user_id);
      view_user_name = decode(view_user_name);
    } catch (error) {
      console.error("Failed to decode:", error);
      // Optionally redirect or show error message
    }
  }

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
