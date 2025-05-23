import React, { useState, useEffect, useRef } from "react";
import { Mention } from "primereact/mention";
import "./chatStyles.css";
import { MentionComponent } from "@syncfusion/ej2-react-dropdowns";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-dropdowns/styles/material.css";
import { useAuth } from "../../utils/idb";
import { getSocket, connectSocket } from "../../utils/Socket";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import { Paperclip, Send, X } from "lucide-react";
import { ScaleLoader } from "react-spinners";

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
  const mentionRef = useRef(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/groups/members/${userId}`
      );
      const data = await res.json();

      if (data.status) {
        const transformedUsers = data.members
          .filter((member) => member.id != user?.id) // Exclude self
          .map((member) => ({
            id: member.id,
            userName: member.name,
            userColor: "#6A0572",
            profilePic: member.profile_pic
              ? `https://rapidcollaborate.in/webex${member.profile_pic}`
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
    setValue("");
    setSelectedFile(null);
    setIsReply(false);
    if (type === "group") {
      fetchUsers();
    }
  }, [type, userId]);

  useEffect(() => {
    console.log("Fetched Group Users:", groupUsers);
  }, [groupUsers]);

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

  const handleInput = (e) => {
    setValue(e.target.value);

    const socket = getSocket();
    socket.emit("typing", {
      from: user.id,
      to: userId,
    });
  };

  const handleSend = async () => {
    if (!value.trim() && !selectedFile) return;

    const urlRegex =
      /((https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/g;

    const linkifiedMessage = value.trim().replace(urlRegex, (url) => {
      let href = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        href = "https://" + url;
      }
      return `<a href="${href}" class="messages-a-link" target="_blank">${url}</a>`;
    });

    try {
      setSubmitBtnDisabled(true);
      setMessageLoading(true);

      const formData = new FormData();
      formData.append("isReply", isReply);
      if (isReply && replyMsgId) formData.append("replyMsgId", replyMsgId);
      formData.append("user_type", type);
      formData.append("sender_id", user.id);
      formData.append("receiver_id", userId);
      formData.append("message", linkifiedMessage);
      formData.append("sender_name", user.name);
      formData.append("profile_pic", user.profile_pic);
      formData.append("is_file", selectedFile ? "1" : "0");
      let selectedUserIds = [];

      if (Array.isArray(selectedUsers)) {
        selectedUserIds = selectedUsers.map((user) => user.id);
      }

      formData.append("selected_users", JSON.stringify(selectedUserIds));
      if (selectedFile) {
        formData.append("selectedFile", selectedFile); // key should match `req.file`
      }

      const res = await fetch("http://localhost:5000/api/chats/send", {
        method: "POST",
        body: formData, // No need for headers, browser sets Content-Type with boundary
      });

      if (!res.ok) throw new Error("Message send failed");

      setValue(""); // Clear textarea
      setSelectedFile(null); // Clear file
      setIsReply(false);
      setReplyMsgId(null);
      setReplyMessage(null);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setSubmitBtnDisabled(false);
      setMessageLoading(false);
      setValue("");
      const chatInput = document.getElementById("chatInput");
      const chatInput2 = document.getElementById("chatInputuser");
      if (chatInput) {
        chatInput.innerHTML = "";
      }
      if (chatInput2) {
        chatInput2.innerHTML = "";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const mentionOpen = mentionRef.current?.isPopupOpen || false;
      if (!mentionOpen) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handlePasteold = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");

    // Insert plain text at the cursor position
    document.execCommand("insertText", false, text);
  };

  const handlePaste = (e) => {
  e.preventDefault();

  const clipboardData = e.clipboardData;
  const items = clipboardData.items;
  let imageFound = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      imageFound = true;

      const file = item.getAsFile();

      const reader = new FileReader();
      reader.onload = function (event) {
        const img = document.createElement("img");
        img.src = event.target.result;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.insertNode(img);

        const p = document.createElement("p");
        p.innerHTML = "<br>";
        range.setStartAfter(img);
        range.insertNode(p);

        range.setStartAfter(p);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        // 🔥 Manually trigger input event to notify React
        triggerInputEvent(e.target);
      };
      reader.readAsDataURL(file);

      break;
    }
  }

  if (!imageFound) {
    const text = clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    range.insertNode(p);

    range.setStartAfter(p);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    // 🔥 Manually trigger input event to notify React
    triggerInputEvent(e.target);
  }
};

// 🔁 Helper to dispatch an input event manually
const triggerInputEvent = (el) => {
  const event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);
};


  useEffect(() => {
    console.log("Selected users updated:", selectedUsers);
  }, [selectedUsers]);

  useEffect(() => {
    console.log("Value updated:", value);
  }, [value]);

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
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = value;

    // Get all mention names from spans
    const mentionedNames = Array.from(
      tempDiv.querySelectorAll(".e-mention-chip")
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
    <>
      {isReply && (
        <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 flex justify-between items-center absolute top-[-50px] w-full">
          <div>
            Replying to:{" "}
            <div
              dangerouslySetInnerHTML={{
                __html:
                  replyMessage
                    .split(/\s+/) // split by spaces
                    .slice(0, 10) // take first 10 words
                    .join(" ") +
                  (replyMessage.split(/\s+/).length > 10 ? "..." : ""),
              }}
            />
          </div>

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

      <div>
        {/* Paperclip icon (file input trigger) */}

        {/* Show selected file with X */}
        {selectedFile && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm chatfile absolute top-[-30px]">
              <span className="mr-2 truncate max-w-[150px]">
                {selectedFile.name}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="chat-send-container space-x-2 flex items-center justify-between mx-auto">
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
                className="w-full h-[70px] overflow-y-auto p-3 rounded border border-gray-300 focus:outline-none"
                placeholder="Type @ to mention someone..."
                onInput={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
              ></div>

              <MentionComponent
                dataSource={groupUsers}
                ref={mentionRef}
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
            // <textarea
            //   value={value}
            //   onChange={handleInput}
            //   onKeyDown={handleKeyDown}
            //   placeholder="Type your message..."
            //   rows={5}
            //   className="w-full h-[70px] border border-gray-300 rounded-md p-3 text-sm focus:outline-none resize-none"
            // />
            <div className="relative w-full">
              {value.trim() === "" && (
                <div className="absolute left-3 top-3 text-gray-400 pointer-events-none select-none">
                  Type your message...
                </div>
              )}
              <div
                id="chatInputuser"
                contentEditable
                className="w-full h-[70px] overflow-y-auto p-3 rounded border border-gray-300 focus:outline-none"
                placeholder="Type @ to mention someone..."
                onInput={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
              ></div>

              <MentionComponent
                dataSource={[]}
                ref={mentionRef}
                fields={{ text: "userName" }}
                target="#chatInputuser"
                mentionChar="^"
                allowSpaces={true}
                popupHeight="200px"
                popupWidth="250px"
                itemTemplate={itemTemplate}
                select={handleSelect} // Attach the select event handler
              />
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            {!isReply && (
              <label className="cursor-pointer border border-orange-500 text-orange-500 hover:text-white px-2 py-2 rounded hover:bg-orange-600 transition ">
                <Paperclip size={13} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </label>
            )}

            <button
              onClick={handleSend}
              disabled={submitBtnDisabled}
              className="bg-orange-500 text-white px-2 py-2 rounded hover:bg-orange-600 transition "
            >
              {submitBtnDisabled ? (
                <div className="mx-auto flex justify-center w-full">
                  <ScaleLoader
                    className="mx-auto"
                    color="#fff"
                    height={14}
                    width={3}
                    radius={2}
                  />
                </div>
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSend;
