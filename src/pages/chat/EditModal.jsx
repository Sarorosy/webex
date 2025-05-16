import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./chatStyles.css";
import { MentionComponent } from "@syncfusion/ej2-react-dropdowns";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-dropdowns/styles/material.css";
import { useAuth } from "../../utils/idb";
import { connectSocket, getSocket } from "../../utils/Socket";
import { X } from "lucide-react";

const EditModal = ({ msgId,userId, message, type, onClose, onUpdate }) => {
  const [value, setValue] = useState(message);
  const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { user } = useAuth();
  const chatInputRef = useRef(null);

  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.innerHTML = message; // Set initial content
    }
  }, [message]);

  const dummyUsers = [
    { id: 1, userName: "Sarah Johnson", userColor: "#FF6B6B" },
    { id: 2, userName: "Michael Chen", userColor: "#4ECDC4" },
    { id: 3, userName: "Aisha Patel", userColor: "#FFD166" },
    { id: 4, userName: "David Kim", userColor: "#6A0572" },
    { id: 5, userName: "Elena Rodriguez", userColor: "#1A936F" },
  ];
  const [groupUsers, setGroupUsers] = useState([]);
  
    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/groups/members/${userId}`);
        const data = await res.json();
  
        if (data.status) {
          const transformedUsers = data.members.map((member, index) => ({
            id: member.id,
            userName: member.name,
            userColor: '#6A0572',
            profilePic: member.profile_pic
              ? `http://localhost:5000${member.profile_pic}`
              : null,
          }));
  
          setGroupUsers(transformedUsers);
        } else {
          console.error(data.message || "Failed to fetch group members");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
  
    useEffect(() => {
      if (type === "group") {
        fetchUsers();
      }
    }, [type, userId]); 

  const [selectedUsers, setSelectedUsers] = useState([]); // State to track selected users

  const onSearch = (event) => {
    const query = event.query.toLowerCase();
    const filteredUsers = users.filter((user) =>
      user.nickname.toLowerCase().includes(query)
    );
    setSuggestions(filteredUsers);
  };

  const itemTemplate = (data) => (
    <div className="flex items-center gap-2 p-2">
      {data.profilePic ? (
        <img
          src={data.profilePic}
          alt={data.userName}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-start text-white font-semibold text-sm "
          style={{
            backgroundColor: data.userColor,
          }}
        >
          {data.userName?.charAt(0).toUpperCase()}
        </div>

      )}
      <span>{data.userName}</span>
    </div>
  );

  const handleEdit = async () => {
    if (!value.trim()) return;

    try {
      setSubmitBtnDisabled(true);
      const socket = getSocket();
      connectSocket(user?.id);

      // Emit 'edit_message' event with the updated message data
      socket.emit("edit_message", {
        msgId,
        message: value.trim(),
        userId: user.id, // User ID to identify who is editing
      });

      onClose();
    } catch (error) {
      console.error("Edit error:", error);
    } finally {
      setSubmitBtnDisabled(false);
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

  // Let the MentionComponent update the DOM first
  setTimeout(() => {
    const chatInput = document.getElementById("chatInput");
    
    // Create a space text node
    const spaceNode = document.createTextNode(" ");
    
    // Insert space at the end of the content
    const selection = window.getSelection();
    const range = document.createRange();
    
    // Set cursor at the end of the contentEditable div
    range.selectNodeContents(chatInput);
    range.collapse(false); // Collapse to end
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Insert space at cursor position
    document.execCommand("insertText", false, " ");
    
    // Update the value state with the new content
    setValue(chatInput.innerHTML);
    
    // Focus back on the input
    chatInput.focus();
    
    console.log(`Selected user ID: ${userId}, Name: ${userName}`);
  }, 0);
};
  // Input change handler to track value changes
  const handleInputChange = (e) => {
    setValue(e.target.innerHTML);
    console.log("Input changed, new value:", e.target.innerHTML);
  };

  useEffect(() => {
  // Create a dummy DOM to parse the HTML value
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = value;

  // Get all mention names from spans
  const mentionedNames = Array.from(
    tempDiv.querySelectorAll('.e-mention-chip')
  ).map((el) => el.textContent.trim());

  // Filter out users no longer mentioned
  const updatedSelectedUsers = selectedUsers.filter((user) =>
    mentionedNames.includes(user.name)
  );

  // Update state only if changed
  if (updatedSelectedUsers.length !== selectedUsers.length) {
    setSelectedUsers(updatedSelectedUsers);
    console.log("Cleaned up selectedUsers:", updatedSelectedUsers);
  }
}, [value]);


  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-md shadow-lg w-full max-w-md"
      >
        <div className='flex justify-between items-center px-4 py-2 bg-orange-500'>
          <h2 className="text-lg font-semibold text-white">Edit Message</h2>
          <div>
            <button
            className="hover:bg-gray-100 text-white hover:text-black py-1 px-2 rounded"
            onClick={onClose} // Close modal without doing anything
          >
            <X size={15}  />
          </button>
          </div>
        </div>
        <div className=" p-4">
        {type === "group" ? (
          <div className="relative w-full">
            {value.trim() === "" && (
              <div className="absolute left-3 top-3 text-gray-400 pointer-events-none select-none">
                Type @ to mention someone...
              </div>
            )}
            <div
              id="chatInput"
              ref={chatInputRef}
              contentEditable
              className="w-full min-h-[8px] p-3 rounded border border-gray-300 focus:outline-none"
              placeholder="Type @ to mention someone..."
              onInput={handleInputChange} // Track changes in the input
            ></div>

            <MentionComponent
              dataSource={groupUsers}
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
            onChange={(e) => setValue(e.target.value)}
            rows={1}
            placeholder="Edit your message..."
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none resize-none"
          />
        )}

        <div className="mt-4 flex justify-end gap-2">
          
          <button
            onClick={handleEdit}
            disabled={submitBtnDisabled}
            className="px-4 py-1 rounded border border-orange-500 hover:text-white hover:bg-orange-500 f-13"
          >
            {submitBtnDisabled ? "Updating..." : "Update"}
          </button>
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditModal;
