import React, { useState, useEffect } from "react";
import { Mention } from "primereact/mention";
import "./chatStyles.css";
import { MentionComponent } from "@syncfusion/ej2-react-dropdowns";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-dropdowns/styles/material.css";
import { useAuth } from "../../utils/idb";
import { getSocket, connectSocket } from "../../utils/Socket";

const ChatSend = ({
  type,
  userId,
  isReply,
  setIsReply,
  replyMsgId,
  setReplyMsgId,
  replyMessage,
  setReplyMessage,
}) => {
  const [value, setValue] = useState("");
  // Dummy user data with an id
  const dummyUsers = [
  {
    id: 1,
    userName: "Sarah Johnson",
    userColor: "#FF6B6B",
    profilePic: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    userName: "Michael Chen",
    userColor: "#4ECDC4",
    profilePic: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    userName: "Aisha Patel",
    userColor: "#FFD166",
    profilePic: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    userName: "David Kim",
    userColor: "#6A0572",
    profilePic: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: 5,
    userName: "Elena Rodriguez",
    userColor: "#1A936F",
    profilePic: "https://i.pravatar.cc/150?img=5",
  },
];

  const [mentionData, setMentionData] = useState(
    dummyUsers.map((u) => u.userName)
  );
  const [selectedUsers, setSelectedUsers] = useState([]); // State to track selected users
  const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { user } = useAuth(); // Get sender_id

  const onSearch = (event) => {
    const query = event.query.toLowerCase();
    const filteredUsers = users.filter((user) =>
      user.nickname.toLowerCase().includes(query)
    );
    setSuggestions(filteredUsers);
  };

  const itemTemplate = (data) => (
  <div className="flex items-center gap-2 p-2">
    <img
      src={data.profilePic}
      alt={data.userName}
      className="w-8 h-8 rounded-full object-cover"
    />
    <span>{data.userName}</span>
  </div>
);


  const handleInput = (e) => {
    setValue(e.target.value);

    const socket = getSocket();
    socket.emit("typing", {
      from: user.id,
      to: userId,
    });
  };

  const handleSend = async () => {
    if (!value.trim()) return;

    try {
      setSubmitBtnDisabled(true);
      const res = await fetch("http://localhost:5000/api/chats/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isReply,
          replyMsgId,
          sender_id: user.id,
          receiver_id: userId,
          message: value.trim(),
          sender_name: user.name,
        }),
      });

      if (!res.ok) throw new Error("Message send failed");

      setValue(""); // Clear textarea
      setIsReply(false);
      setReplyMsgId(null);
      setReplyMessage(null);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSubmitBtnDisabled(false);
      setValue('')
      document.getElementById("chatInput").innerHTML = "";
    }
  };

  useEffect(() => {
    // Logging the selected users when the state changes
    console.log("Selected users updated:", selectedUsers);
  }, [selectedUsers]); // Runs every time selectedUsers changes

  useEffect(() => {
    // Logging value updates every time value changes
    console.log("Value updated:", value);
  }, [value]); // Runs every time value changes

  // Select event handler
  const handleSelect = (e) => {
    const selectedUser = e.itemData;
    const userId = selectedUser.id;
    const userName = selectedUser.userName;

    // Check if the user is already in the selectedUsers array
    if (!selectedUsers.some((user) => user.id === userId)) {
      // Add the selected user to the array
      setSelectedUsers((prevState) => [
        ...prevState,
        { id: userId, name: userName },
      ]);
    }

    // Append a space after selecting the user and update the input value
    const updatedValue = value + `@${userName} `;
    setValue(updatedValue);

    console.log(`Selected user ID: ${userId}, Name: ${userName}`);
  };

  // Input change handler to track value changes
  const handleInputChange = (e) => {
    setValue(e.target.innerHTML);
    console.log("Input changed, new value:", e.target.innerHTML);
  };

  return (
    <>
      {isReply && (
        <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 flex justify-between items-center">
          <div>Replying to : {replyMessage}</div>
          <button
            onClick={() => {
              setIsReply(false);
              setReplyMsgId(null);
              setReplyMessage(null);
            }}
            className="text-red-600 text-xs ml-2"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="chat-send-container space-x-2 flex items-end justify-between mx-auto">
        
        {type === "group" ? (
          <div className="relative w-full">
            {value.trim() === "" && (
              <div className="absolute left-3 top-3 text-gray-400 pointer-events-none select-none">
                Type @ to mention someone...
              </div>
            )}
            <div
              id="chatInput"
              contentEditable
              className="w-full min-h-[100px] p-3 rounded border border-gray-300 focus:outline-none"
              placeholder="Type @ to mention someone..."
              onInput={handleInputChange} // Track changes in the input
            ></div>

            <MentionComponent
              dataSource={dummyUsers}
              fields={{ text: "userName" }}
              target="#chatInput"
              mentionChar="@"
              allowSpaces={true}
              popupHeight="200px"
              popupWidth="250px"
              itemTemplate={itemTemplate} 
              select={handleSelect} // Attach the select event handler
            />
          </div>
        ) : (
          <textarea
            value={value}
            onChange={handleInput}
            placeholder="Type your message..."
            rows={5}
            className="w-full h-[80px] border border-gray-300 rounded-md p-3 text-sm focus:outline-none resize-none"
          />
        )}

        <button
          onClick={handleSend}
          disabled={submitBtnDisabled}
          className="mt-2 w-24 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition"
        >
          Send
        </button>
      </div>
    </>
  );
};

export default ChatSend;
