import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../utils/idb";
import { X, Paperclip, Send, File } from "lucide-react";
import { MentionComponent } from "@syncfusion/ej2-react-dropdowns";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-dropdowns/styles/material.css";
import "../chat/chatStyles.css";
import ScaleLoader from "react-spinners/ScaleLoader";
import EmojiPicker from "emoji-picker-react";
import { useSelectedUser } from "../../utils/SelectedUserContext";

function SendBroadcast({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const { user, theme } = useAuth();
  const [value, setValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false);
  const { messageLoading, setMessageLoading } = useSelectedUser();

  const inputRef = useRef();
  const mentionRef = useRef();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://webexback-06cc.onrender.com/api/users/fetchallusers"
      );
      if (res.data.status) {
        setUsers(res.data.data.filter((u) => u.user_type !== "admin"));
      } else toast.error("Failed to fetch users");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      const res = await axios.get("https://webexback-06cc.onrender.com/api/usertags");
      setTags(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching tags");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTags();
  }, []);

  const handlePaste = (e) => {
    e.preventDefault();

    const items = e.clipboardData.items;
    const target = e.target;

    const hasImage = target.querySelector("img"); // check if image already present

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith("image")) {
        if (hasImage) {
          setTimeout(() => {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const space = document.createTextNode(" ");
            range.insertNode(space);

            const afterSpace = document.createRange();
            afterSpace.setStartAfter(space);
            afterSpace.collapse(true);
            selection.removeAllRanges();
            selection.addRange(afterSpace);

            space.remove();

            // Trigger event *after* cursor reposition and DOM update
            triggerInputEvent(target);
          }, 0); // shorter delay works just as well
          return;
        }

        // If no image exists, insert image
        const file = item.getAsFile();
        const reader = new FileReader();

        reader.onload = (event) => {
          const img = document.createElement("img");
          img.src = event.target.result;
          img.style.maxWidth = "100%";

          const br = document.createElement("br");

          const selection = window.getSelection();
          if (!selection.rangeCount) return;

          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);

          range.setStartAfter(img);
          range.insertNode(br);

          // Move cursor after <br>
          const newRange = document.createRange();
          newRange.setStartAfter(br);
          newRange.collapse(true);

          selection.removeAllRanges();
          selection.addRange(newRange);

          // Insert space after 200ms to trigger update
          setTimeout(() => {
            const space = document.createTextNode(" ");
            const sel = window.getSelection();
            if (!sel.rangeCount) return;
            const r = sel.getRangeAt(0);
            r.insertNode(space);

            const afterSpace = document.createRange();
            afterSpace.setStartAfter(space);
            afterSpace.collapse(true);

            sel.removeAllRanges();
            sel.addRange(afterSpace);

            triggerInputEvent(target);
          }, 200);
        };

        reader.readAsDataURL(file);
        return;
      }
    }

    // If no image, insert plain text
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    triggerInputEvent(target);
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

  // Handle tag selection
  const handleSelectTag = (e) => {
    const tag = e.itemData; // {id, name}

    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id) ? prev : [...prev, tag]
    );

    // Insert tag into input
    const chatInput = inputRef.current;
    setValue(chatInput.innerHTML);

    setTimeout(() => {
      const chatInput = document.getElementById("chatInputuser");

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
    }, 0);
  };

  useEffect(() => {
    console.log("value", value);
    console.log("Selected Users", selectedUsers);
  }, [selectedUsers, value]);

  const handleInputChange = (e) => {
    const html = e.currentTarget.innerHTML;
    setValue(html);

    // Extract tags from the contentEditable (chips are spans with e-mention-chip)
    const div = document.createElement("div");
    div.innerHTML = html;
    const chips = [...div.querySelectorAll(".e-mention-chip")].map(
      (chip) => chip.textContent
    );

    // Sync `selectedTags` with actual chips present
    setSelectedTags(
      tags.filter((t) => chips.includes(t.name)) // only keep tags still in input
    );
  };

  // Whenever tags change → update selected users
  useEffect(() => {
    if (selectedTags.length === 0) {
      setSelectedUsers([]);
      return;
    }

    // Collect users that match ANY of the selected tags
    const tagIds = selectedTags.map((t) => String(t.id));
    const matchedUsers = users.filter((u) =>
      u.tags?.split(",").some((tagId) => tagIds.includes(tagId))
    );

    setSelectedUsers(matchedUsers.map((u) => ({ id: u.id, name: u.name })));
  }, [selectedTags, users]);

  const handleEmojiClick = (emojiData) => {
    const chatInput = inputRef.current;
    chatInput.innerHTML += emojiData.emoji;
    setValue(chatInput.innerHTML);
  };

  const [isSending, setIsSending] = useState(false);
  const [sendWithTags, setSendWithTags] = useState(false);

  const handleSend = async () => {
    if (isSending || (!value.trim() && !selectedFile)) return;

    let rawText = value.trim();

    if (!sendWithTags) {
      rawText = rawText.replace(/<span[^>]*class="e-mention-chip"[^>]*>.*?<\/span>/g, "");
    }

    // Step 1: Find all email addresses and replace with placeholders
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
    const emails = [];
    const maskedText = rawText.replace(emailRegex, (match) => {
      const placeholder = `__EMAIL_${emails.length}__`;
      emails.push(match);
      return placeholder;
    });

    // Step 2: Linkify only clean URLs
    const urlRegex = /\bhttps?:\/\/[^\s<>"']+/g;
    const linkified = maskedText.replace(urlRegex, (url) => {
      let href = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        href = "https://" + url;
      }
      return `<a href="${href}" class="messages-a-link" target="_blank">${url}</a>`;
    });

    // Step 3: Restore original emails
    const finalMessage = linkified.replace(/__EMAIL_(\d+)__/g, (_, index) => {
      return emails[parseInt(index)];
    });

    if (selectedUsers.length == 0) {
      toast.error("No users mentioned!");
      return;
    }

    const userIds = selectedUsers.map((user) => user.id);

    try {
      setIsSending(true);
      setSubmitBtnDisabled(true);
      setMessageLoading(true);
      setShowEmojiPicker(false);

      const formData = new FormData();
      formData.append("isReply", false);
      formData.append("user_type", "user");
      formData.append("sender_id", user.id);
      formData.append("receiver_ids", userIds);
      formData.append("message", finalMessage);
      formData.append("sender_name", user.name);
      formData.append("profile_pic", user.profile_pic);
      formData.append("selected_quote_message", null);
      formData.append("is_file", selectedFile ? "1" : "0");
      let selectedUserIds = [];

      formData.append("selected_users", JSON.stringify(selectedUserIds));
      if (selectedFile) {
        formData.append("selectedFile", selectedFile); // key should match `req.file`
      }

      const res = await fetch(
        "https://webexback-06cc.onrender.com/api/chats/send-broadcast",
        {
          method: "POST",
          body: formData, // No need for headers, browser sets Content-Type with boundary
        }
      );

      if (!res.ok) throw new Error("Message send failed");

      setValue(""); // Clear textarea
      setSelectedFile(null); // Clear file
      toast.success("Sent!");
      onClose();
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
      setSubmitBtnDisabled(false);
      setMessageLoading(false);
      setSelectedUsers([]);
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

  const [viewUsersOpen, setViewUsersOpen] = useState(false);
  const stripHtml = (input) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = input;

    // Remove all child nodes that are not <img>
    const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        return node.tagName !== "IMG"
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });

    let node;
    const nodesToRemove = [];

    while ((node = walker.nextNode())) {
      nodesToRemove.push(node);
    }

    nodesToRemove.forEach((n) => n.remove());

    return tmp.innerHTML.trim();
  };

  const cleanedValue = stripHtml(value).trim();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className={`fixed h-full top-0 right-0 w-[45%] ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
        } shadow-xl border-r border-gray-300 z-[100] overflow-y-auto prose`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center px-4 py-3 border-b font-semibold text-lg sticky top-0 ${
            theme === "dark"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          <h1>Send Broadcast</h1>
          <button
            onClick={onClose}
            className="text-white bg-orange-600 px-2 py-1 rounded hover:bg-orange-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col h-[90%] justify-end p-4 gap-2 ios relative">
          {selectedUsers.length > 0 && (
            <div className="flex flex-col gap-1 mb-2 border-b pb-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>
                  Message will be sent to {selectedUsers.length} user
                  {selectedUsers.length > 1 ? "s" : ""}
                  <button
                    className="underline ml-2"
                    onClick={() => {
                      setViewUsersOpen(!viewUsersOpen);
                    }}
                  >
                    {viewUsersOpen ? "Hide" : "View"}
                  </button>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {viewUsersOpen &&
                  selectedUsers.map((u) => {
                    const userDetails = users.find((user) => user.id === u.id);
                    return (
                      <div
                        key={u.id}
                        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {userDetails?.profile_pic ? (
                          <img
                            src={
                              userDetails.profile_pic.startsWith("http")
                                ? userDetails.profile_pic
                                : `https://rapidcollaborate.in/ccp${userDetails.profile_pic}`
                            }
                            alt={userDetails.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-orange-400 text-white text-xs font-bold">
                            {userDetails?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm">{userDetails?.name}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          {selectedFile && (
            <div className="flex items-end">
              <div
                className={` ${
                  theme == "dark" ? "bg-gray-200" : "bg-gray-300"
                } rounded chatfile text-[11px] flex  justify-center items-center relative px-2 py-1.5 gap-2 mb-1`}
                data-tooltip-id="my-tooltip"
                data-tooltip-content={selectedFile.name}
              >
                <div>
                  <File size={15} />
                </div>
                <div className="truncate max-w-[300px] text-center">
                  {selectedFile.name}
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className={`
                                ${
                                  theme == "dark"
                                    ? "text-gray-500 hover:text-red-500"
                                    : "text-gray-500 hover:text-red-500"
                                }
                                
                                `}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="relative flex items-start gap-2">
            <div className="flex flex-col items-center gap-2">
              <label className="cursor-pointer border border-orange-500 text-orange-500 hover:text-white px-1 py-1 rounded hover:bg-orange-600 transition">
                <Paperclip size={14} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </label>
              <button
                type="button"
                className="text-xl"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😊
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              {value.trim() === "" && (
                <div className="absolute left-3 top-3 text-gray-400 pointer-events-none select-none">
                  Type # to select tags...
                </div>
              )}
              <div
                id="chatInputuser"
                ref={inputRef}
                contentEditable
                className={`w-full h-28 overflow-y-auto px-3 py-2 border rounded focus:outline-none ${
                  theme === "dark"
                    ? "bg-gray-600 border-gray-500 text-gray-200"
                    : "bg-white border-gray-300"
                }`}
                onInput={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
              ></div>

              <MentionComponent
                dataSource={tags} // Tags list
                fields={{ text: "name" }}
                target="#chatInputuser"
                mentionChar="#"
                allowSpaces={true}
                popupHeight="200px"
                popupWidth="250px"
                select={handleSelectTag} // Tag selection
              />
            </div>
          </div>

          <div className="flex justify-end items-center">
            <div className="mr-12">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="sendOption"
                  value="without"
                  checked={!sendWithTags}
                  onChange={() => setSendWithTags(false)}
                />
                Send without tags
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sendOption"
                  value="with"
                  checked={sendWithTags}
                  onChange={() => setSendWithTags(true)}
                />
                Send with tags
              </label>
            </div>
            <button
              onClick={handleSend}
              disabled={submitBtnDisabled || cleanedValue === ""}
              className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition mt-2 w-20"
            >
              {submitBtnDisabled ? (
                <ScaleLoader color="#fff" height={14} width={3} radius={2} />
              ) : (
                <p className="flex items-center">
                  <Send size={13} /> Send
                </p>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SendBroadcast;
