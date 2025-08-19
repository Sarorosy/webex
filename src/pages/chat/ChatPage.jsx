import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { decode } from "../../utils/encoder";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import { useAuth } from "../../utils/idb";
import { AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import StartConversation from "./StartConversation";
import ScreenSharing from "../../components/ScreenSharing";
import { getSocket, connectSocket } from "../../utils/Socket";

const ChatPage = () => {
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const { selectedMessage, setSelectedMessage } = useSelectedUser();
  const { user, theme } = useAuth();
  let { view_user_id, view_user_name } = useParams();
  let { gouser, gotype } = useParams();
  const location = useLocation();
  const passedState = location.state;

  if (view_user_id && view_user_name) {
    try {
      view_user_id = decode(view_user_id);
      view_user_name = decode(view_user_name);
    } catch (error) {
      console.error("Failed to decode:", error);
      // Optionally redirect or show error message
    }
  }

  useEffect(() => {
    if (passedState) {
      if (passedState.type == "user") {
        setSelectedUser(passedState.data);
        setSelectedMessage(null); // clear message if needed
      } else if (passedState.type == "message") {
        const msg = passedState.data;
        setSelectedUser(msg.user);
        setSelectedMessage(msg);
      }
    }
  }, [passedState]); // ✅ Only run when passedState changes

  const [notificationClickUser, setNotificationClickUser] = useState(null);
  useEffect(() => {
    const handleMsg = (event) => {
      if (event.data?.type === "open_chat") {
        const data = event.data.payload;
        console.log(data);
        setNotificationClickUser({
          id: data.receiver_id || data.sender_id,
          type: data.receiver_id ? "group" : "user",
        });
        console.log(notificationClickUser);
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMsg);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMsg);
    };
  }, []);

  useEffect(() => {
    if (!user || !selectedUser) return;

    connectSocket(user.id);
    const socket = getSocket();

    const handleNewStatus = (incomingStatus) => {

      if (!incomingStatus || !incomingStatus.id) return;
      // Clone status data (ensures no mutation)
      const statusData = { ...incomingStatus };

      if (
        selectedUser &&
        selectedUser.type === "group" &&
        String(selectedUser.id) === String(statusData.group_id)
      ) {
        const updatedSelected = {
          ...selectedUser,
          is_status: 1,
          status_count: (selectedUser.status_count || 0) + 1,
          status: [...(selectedUser.status || []), statusData],
        };

        setSelectedUser(updatedSelected);
      } else {
      }
    };

    const handleStatusDeleted = ({ id, group_id }) => {
    if (
      selectedUser &&
      selectedUser.type === "group" &&
      String(selectedUser.id) === String(group_id)
    ) {
      const updatedStatuses = (selectedUser.status || []).filter(
        (status) => String(status.id) !== String(id)
      );

      const updatedSelected = {
        ...selectedUser,
        status: updatedStatuses,
        status_count:
          (selectedUser.status_count || 0) > 0
            ? selectedUser.status_count - 1
            : 0,
        is_status: updatedStatuses.length > 0 ? 1 : 0,
      };

      setSelectedUser(updatedSelected);
    }
  };

    socket.on("new_status", handleNewStatus);
    socket.on("status_deleted", handleStatusDeleted);

    return () => {
      socket.off("new_status", handleNewStatus);
      socket.off("status_deleted", handleStatusDeleted);
    };
  }, [user, selectedUser]);

  const [leftGroupOpen, setLeftGroupOpen] = useState(false);

  const confirmLeft = async () => {
    try {
      const response = await fetch(
        "https://webexback-06cc.onrender.com/api/groups/remove-member",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            delete_user_name: user?.name,
            user_id: user?.id,
            user_name: user?.name,
            post_user_id: user?.id,
            own: true,
            group_id: selectedUser?.id,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        setLeftGroupOpen(false);
        setSelectedUser(null);
        toast.success("Success");
      } else {
        toast.error(data.message || "Error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({
    startX: 0,
    startWidth: 300,
  });

  const handleMouseDown = (e) => {
    resizeRef.current.startX = e.clientX;
    resizeRef.current.startWidth = sidebarWidth;
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const deltaX = e.clientX - resizeRef.current.startX;
        const newWidth = resizeRef.current.startWidth + deltaX;
        if (newWidth >= 250 && newWidth <= 500) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const [ismentioned, setIsMentioned] = useState(false);
  const [newMessages, setNewMessages] = useState([]);
  const [taggedMessages, setTaggedMessages] = useState([]);

  return (
    <div className="flex flex-col rounded sticky top-0 n-height transition-all duration-200 ease-in-out">
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          view_user_id={view_user_id}
          view_user_name={view_user_name}
          selectedUser={selectedUser}
          onSelect={setSelectedUser}
          notificationClickUser={notificationClickUser}
          setNotificationClickUser={setNotificationClickUser}
          sidebarWidth={sidebarWidth}
          setIsMentioned={setIsMentioned}
          setNewMessages={setNewMessages}
          setTaggedMessages={setTaggedMessages}
        />
        {selectedUser ? (
           
          <ChatArea
            selectedUser={selectedUser}
            view_user_id={view_user_id}
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            setLeftGroupOpen={setLeftGroupOpen}
            handleMouseDown={handleMouseDown}
            isResizing={isResizing}
            sidebarWidth={sidebarWidth}
            ismentioned={ismentioned}
            newMessages={newMessages}
            setNewMessages={setNewMessages}
            taggedMessages={taggedMessages}
            setTaggedMessages={setTaggedMessages}
          />
        ) : (
          <div
            className={`flex flex-col flex-1 ${
              theme == "dark" ? "" : "bg-gradient-to-b from-orange-50"
            } rounded m-2 justify-between relative`}
          >
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 -left-2 h-full w-1.5 cursor-col-resize z-10 bg-[] hover:bg-orange-300 hover:w-1.5"
            ></div>
            <StartConversation />
          </div>
        )}
      </div>

      <AnimatePresence>
        {leftGroupOpen && (
          <ConfirmationModal
            title="Are you sure want to leave this group?"
            message="This action cannot be undone."
            onYes={confirmLeft}
            onClose={() => setLeftGroupOpen(false)}
          />
        )}
      </AnimatePresence>

      <ScreenSharing />
    </div>
  );
};

export default ChatPage;
