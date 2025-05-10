import React, { useState , useEffect, useRef} from "react";
import { motion } from "framer-motion";
import "./chatStyles.css";
import { MentionComponent } from "@syncfusion/ej2-react-dropdowns";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-dropdowns/styles/material.css";
import { useAuth } from "../../utils/idb";

const EditModal = ({ msgId, message, type, onClose, onUpdate }) => {
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
   const [mentionData, setMentionData] = useState(
     dummyUsers.map((u) => u.userName)
   );
   const [selectedUsers, setSelectedUsers] = useState([]); // State to track selected users

  const onSearch = (event) => {
    const query = event.query.toLowerCase();
    const filteredUsers = users.filter((user) =>
      user.nickname.toLowerCase().includes(query)
    );
    setSuggestions(filteredUsers);
  };

  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <span>{item.nickname}</span>
    </div>
  );

  const handleEdit = async () => {
    if (!value.trim()) return;

    try {
      setSubmitBtnDisabled(true);
      const res = await fetch(`http://localhost:5000/api/chats/edit/${msgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value.trim() }),
      });

      if (!res.ok) throw new Error("Message update failed");

      onUpdate && onUpdate(value.trim());
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
        className="bg-white p-6 rounded-md shadow-lg w-full max-w-md"
      >
        <h2 className="text-lg font-semibold mb-4">Edit Message</h2>
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
                        select={handleSelect} // Attach the select event handler
                      />
                    </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            placeholder="Edit your message..."
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none resize-none"
          />
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={submitBtnDisabled}
            className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
          >
            {submitBtnDisabled ? "Updating..." : "Update"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditModal;
