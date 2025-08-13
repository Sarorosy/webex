import React, { useState, useEffect, useRef } from "react";
import { Mention } from "primereact/mention";
import "./chatStyles.css";
import { MentionComponent } from "@syncfusion/ej2-react-dropdowns";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-dropdowns/styles/material.css";
import { useAuth } from "../../utils/idb";
import { getSocket, connectSocket } from "../../utils/Socket";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import {
  BarChart2,
  ChevronsDown,
  ChevronsUp,
  Clock4,
  File,
  Megaphone,
  Paperclip,
  Plus,
  QuoteIcon,
  Scaling,
  Send,
  Target,
  X,
} from "lucide-react";
import { ScaleLoader } from "react-spinners";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import CreatePoll from "./CreatePoll";
import AddStatus from "../status/AddStatus";
import ScheduleMessageModal from "./ScheduleMessageModal";
import moment from "moment";

const ChatSend = ({
  type,
  userId,
  isReply,
  setIsReply,
  replyMsgId,
  setReplyMsgId,
  replyMessage,
  setReplyMessage,
  selectedQuoteMessage,
  setSelectedQuoteMessage,
  scrollToBottom,
  startResizing,
  height,
}) => {
  const [value, setValue] = useState("");
  const mentionRef = useRef(null);
  const inputRef = useRef(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const { messageLoading, setMessageLoading } = useSelectedUser();
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedHours, setSelectedHours] = useState(null);

  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");

  const localStorageKey = `chat_input_${userId}_type_${type}`;

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const TYPING_TIMEOUT = 2000;

  useEffect(() => {
    const socket = getSocket();
    connectSocket(user?.id);
    if (!value.trim()) return;

    if (socket && socket.connected && user?.id && userId) {
      socket.emit("typing", { from: user?.id, to: userId });
      setIsTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, TYPING_TIMEOUT);
    }
  }, [value]);

  // Optional cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const fetchUsersold = async () => {
    try {
      const res = await fetch(
        `https://webexback-06cc.onrender.com/api/groups/members/${userId}`
      );
      const data = await res.json();

      if (data.status) {
        const transformedUsers = data.members
          .filter((member) => member.id != user?.id) // Exclude self
          .map((member) => ({
            id: member.id,
            userName: member.name,
            userColor: "#6A0572",
            seniority: member.seniority ?? "junior",
            profilePic: member.profile_pic
              ? `https://rapidcollaborate.in/ccp${member.profile_pic}`
              : null,
            email: member.email,
            user_panel: member.user_panel,
            logged_in_status: true,
          }));

        if (
          selectedUser?.type == "group" &&
          selectedUser?.group_type == "team" &&
          user?.seniority == "senior"
        ) {
          const allUser = {
            id: "all",
            userName: "All",
            userColor: "#000000",
            profilePic: null,
            logged_in_status: true,
          };

          const finalList = [allUser, ...transformedUsers];

          setGroupUsers(finalList);
          updateGroupLoginStatus(finalList);
        } else {
          const allUser = {
            id: "all",
            userName: "All",
            userColor: "#000000",
            profilePic: null,
          };

          const finalList = [allUser, ...transformedUsers];
          setGroupUsers(finalList);
          updateGroupLoginStatus(finalList);
        }
      } else {
        console.error(data.message || "Failed to fetch group members");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `https://webexback-06cc.onrender.com/api/groups/members/${userId}`
      );
      const data = await res.json();

      if (data.status) {
        const transformedUsers = data.members
          .filter((member) => member.id != user?.id) // only exclude self here
          .map((member) => ({
            id: member.id,
            userName: member.name,
            userColor: "#6A0572",
            seniority: member.seniority ?? "junior",
            profilePic: member.profile_pic
        ? member.profile_pic.startsWith("http")
          ? member.profile_pic
          : `https://rapidcollaborate.in/ccp${member.profile_pic}`
        : null,
            email: member.email,
            user_panel: member.user_panel,
          }));

        // Include "All"
        const allUser = {
          id: "all",
          userName: "All",
          userColor: "#000000",
          profilePic: null,
          logged_in_status: true,
        };

        let fullList;
        if (
          selectedUser &&
          selectedUser?.type == "group" &&
          selectedUser?.group_type == "team" &&
          user?.seniority == "junior"
        ) {
          fullList = transformedUsers;
        } else {
          fullList = [allUser, ...transformedUsers];
        }

        // Check login status and filter out "Leave"
        const updatedUsers = await Promise.all(
          fullList.map(async (u) => {
            if (u.id === "all") return u;

            let logged_in_status = true;
            let isLeave = false;

            try {
              let url = "";

              if (u.user_panel === "AP") {
                url =
                  "https://www.thehrbulb.com/team-member-panel/api/checkLoggedInorNot";
              } else if (u.user_panel === "SP") {
                url =
                  "https://elementk.in/spbackend/api/login-history/check-login-status";
              }

              if (url) {
                const res = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: u.email }),
                });

                // if (!res.ok) {
                //   isLeave = true;
                //   logged_in_status = false;
                // } else {

                // }

                const result = await res.json();
                if (result.message === "Leave") {
                  isLeave = true;
                } else {
                  logged_in_status = result.message === "Loggedin";
                }
              }
            } catch (err) {
              console.error("Login check failed for", u.email, err);
              logged_in_status = false;
            }

            return isLeave ? null : { ...u, logged_in_status };
          })
        );

        if (user?.seniority == "senior") {
          setGroupUsers(fullList);
        } else {
          const filtered = updatedUsers.filter(Boolean); // remove nulls
          setGroupUsers(filtered);
        }
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
    setScheduleModalOpen(false);
    setSelectedHours(null);
    setSelectedQuoteMessage(null);
    if (type === "group") {
      fetchUsers();
    }

    const chatInput = document.getElementById("chatInput");
    const chatInput2 = document.getElementById("chatInputuser");
    if (chatInput) {
      chatInput.innerHTML = "";
    }
    if (chatInput2) {
      chatInput2.innerHTML = "";
    }
  }, [type, userId]);

  useEffect(() => {
    console.log("Fetched Group Users:", groupUsers);
  }, [groupUsers]);

  const [selectedUsers, setSelectedUsers] = useState([]); // State to track selected users
  const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false);
  const { user, theme, trackMessagedUser } = useAuth(); // Get sender_id

  useEffect(() => {
    console.log("selected Users:", selectedUsers);
  }, [selectedUsers]);

  useEffect(() => {
    const hasAll = selectedUsers.some((u) => u.id == "all");
    if (hasAll) {
      // setSelectedUsers(groupUsers);
    }
  }, [selectedUsers, groupUsers]);

  const itemTemplate = (data) => {
    const groupType = selectedUser?.group_type; // assumes selectedUser is available
    const isJunior = user?.seniority == "junior";
    const isTaggingJunior = data.seniority == "junior";
    const isTaggingSenior = data.seniority == "senior";

    let isDisabled = false;

    if (
      selectedUser?.type == "group" &&
      groupType == "work" &&
      isJunior &&
      isTaggingSenior
    ) {
      isDisabled = true;
    }
    // else if (
    //   selectedUser?.type == "group" &&
    //   groupType == "team" &&
    //   isJunior &&
    //   isTaggingJunior
    // ) {
    //   isDisabled = true;
    // }

    return (
      <div
        className={`flex items-center gap-2 p-2 ${
          isDisabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {data.profilePic ? (
          <img
            src={data.profilePic}
            alt={data.userName}
            loading="lazy"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white  font-semibold text-sm`}
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
  };

  // Select event handler
  const handleSelect = (e) => {
    const selUser = e.itemData;
    const userId = selUser.id;
    const userName = selUser.userName;

    const mentionSeniority = selUser.seniority;

    const groupType = selectedUser?.group_type;
    const isJunior = user?.seniority === "junior";

    if (groupType === "work" && isJunior && mentionSeniority === "senior") {
      toast.error("You can't tag Senior Associate");
      e.cancel = true;
      return;
    }

    // if (groupType === "team" && isJunior && mentionSeniority === "junior") {
    //   toast.error("You can't tag Associate");
    //   e.cancel = true;
    //   return;
    // }

    if (userId == "all") {
      const hasAll = selectedUsers.some((user) => user.id == "all");

      if (hasAll) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers([
          { id: "all", name: "All" },
          ...groupUsers.map((u) => ({
            id: u.id,
            name: u.userName,
          })),
        ]);
      }

      //return; // Skip rest of the logic for 'all'
    }

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

  useEffect(() => {
    const chatInput = document.getElementById("chatInput");

    const updateSelectedUsersFromDOM = () => {
      if (!chatInput) return;

      const chips = chatInput.querySelectorAll(".e-mention-chip");
      const chipNames = Array.from(chips).map((chip) =>
        chip.textContent.trim()
      );

      // 💡 If "All" is mentioned, include all group users
      if (chipNames.includes("All")) {
        setSelectedUsers([
          { id: "all", name: "All" },
          ...groupUsers.map((u) => ({
            id: u.id,
            name: u.userName,
          })),
        ]);
      } else {
        // Normal filtering logic
        const updatedUsers = selectedUsers.filter((u) =>
          chipNames.includes(u.name)
        );

        // Prevent unnecessary state updates
        if (updatedUsers.length !== selectedUsers.length) {
          setSelectedUsers(updatedUsers);
        }
      }
    };

    const observer = new MutationObserver(() => {
      updateSelectedUsersFromDOM();
    });

    if (chatInput) {
      observer.observe(chatInput, {
        childList: true,
        subtree: true,
      });

      chatInput.addEventListener("input", updateSelectedUsersFromDOM);
      chatInput.addEventListener("blur", updateSelectedUsersFromDOM);
    }

    return () => {
      observer.disconnect();
      if (chatInput) {
        chatInput.removeEventListener("input", updateSelectedUsersFromDOM);
        chatInput.removeEventListener("blur", updateSelectedUsersFromDOM);
      }
    };
  }, [selectedUsers, groupUsers]);

  const handleSelectt = (e) => {
    const selectedUser = e.itemData;
    const userId = selectedUser.id;
    const userName = selectedUser.userName;

    if (userId == "all") {
      const hasAll = selectedUsers.some((user) => user.id == "all");

      if (hasAll) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers([
          { id: "all", name: "All" },
          ...groupUsers.map((u) => ({
            id: u.id,
            name: u.userName,
          })),
        ]);
      }

      //return; // Skip rest of the logic for 'all'
    }

    // Check if the user is already in the selectedUsers array
    if (!selectedUsers.some((user) => user.id == userId)) {
      // Add the selected user to the arrayMore actions
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

  const itemTemplatee = (data) => (
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
          <span className="custom-margin">
            {data.userName?.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span>{data.userName}</span>
    </div>
  );

  const [isSending, setIsSending] = useState(false);
  const handleSend = async () => {
    if (isSending || (!value.trim() && !selectedFile)) return;

    const rawText = value.trim();

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

    if (type == "user" && user?.seniority == "junior") {
      const prevMessagedUserIds = user?.messagedUserIds || [];
      console.log("prevMessagedUserIds", prevMessagedUserIds);
      const isNewUser = !prevMessagedUserIds.includes(userId);
      console.log("isNewUser", isNewUser);
      console.log("message_count", user?.message_count || 0);

      if (isNewUser && (user?.message_count || 0) >= 5) {
        toast.custom(
          (t) => (
            <div
              className={`max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 p-4 flex items-start space-x-4 ${
                t.visible ? "animate-enter" : "animate-leave"
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Message Limit Reached
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  You've messaged 5 different users. Please continue the
                  conversation in a group instead.
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ),
          {
            duration: 6000,
            position: "top-right",
            id: "one-to-one-limit",
            ariaProps: {
              role: "status",
              "aria-live": "polite",
            },
          }
        );
      }

      await trackMessagedUser(userId);
    }

    try {
      setIsSending(true);
      setSubmitBtnDisabled(true);
      setMessageLoading(true);
      setShowEmojiPicker(false);

      const formData = new FormData();
      formData.append("isReply", isReply);
      if (isReply && replyMsgId) formData.append("replyMsgId", replyMsgId);
      formData.append("user_type", type);
      formData.append("sender_id", user.id);
      formData.append("receiver_id", userId);
      formData.append("message", finalMessage);
      formData.append("sender_name", user.name);
      formData.append("profile_pic", user.profile_pic);
      formData.append(
        "selected_quote_message",
        selectedQuoteMessage ? JSON.stringify(selectedQuoteMessage) : null
      );
      formData.append("is_file", selectedFile ? "1" : "0");
      let selectedUserIds = [];

      if (Array.isArray(selectedUsers)) {
        selectedUserIds = selectedUsers.map((user) => user.id);
      }

      formData.append("selected_users", JSON.stringify(selectedUserIds));
      if (selectedFile) {
        formData.append("selectedFile", selectedFile); // key should match `req.file`
      }

      const res = await fetch(
        "https://webexback-06cc.onrender.com/api/chats/send",
        {
          method: "POST",
          body: formData, // No need for headers, browser sets Content-Type with boundary
        }
      );

      if (!res.ok) throw new Error("Message send failed");

      setValue(""); // Clear textarea
      setSelectedFile(null); // Clear file
      setIsReply(false);
      setReplyMsgId(null);
      setReplyMessage(null);
      setSelectedQuoteMessage(null);
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
      localStorage.removeItem(localStorageKey);
      scrollToBottom();
    }
  };

  const handleSchedule = async () => {
    if (isSending || (!value.trim() && !selectedFile)) return;

    if (!selectedHours) {
      toast.error("Please Select a time");
      return;
    }

    let scheduleAt;
      if (selectedHours === "custom") {
        if (!customDate || !customTime) {
          toast.error("Please select both date and time for custom schedule.");
          return;
        }
        scheduleAt = moment(
          `${customDate} ${customTime}`,
          "YYYY-MM-DD HH:mm"
        ).format("YYYY-MM-DD HH:mm:ss");
      } else {
        scheduleAt = moment()
          .add(selectedHours, "hours")
          .format("YYYY-MM-DD HH:mm:ss");
      }

    const rawText = value.trim();

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


    try {
      setIsSending(true);
      setSubmitBtnDisabled(true);
      setMessageLoading(true);
      setShowEmojiPicker(false);

      

      const formData = new FormData();
      formData.append("isReply", isReply);
      if (isReply && replyMsgId) formData.append("replyMsgId", replyMsgId);
      formData.append("user_type", type);
      formData.append("sender_id", user.id);
      formData.append("receiver_id", userId);
      formData.append("message", finalMessage);
      formData.append("sender_name", user.name);
      formData.append("profile_pic", user.profile_pic);
      // Append to formData
      formData.append("schedule_at", scheduleAt);
      formData.append(
        "selected_quote_message",
        selectedQuoteMessage ? JSON.stringify(selectedQuoteMessage) : null
      );
      formData.append("is_file", selectedFile ? "1" : "0");
      let selectedUserIds = [];

      if (Array.isArray(selectedUsers)) {
        selectedUserIds = selectedUsers.map((user) => user.id);
      }

      formData.append("selected_users", JSON.stringify(selectedUserIds));
      if (selectedFile) {
        formData.append("selectedFile", selectedFile); // key should match `req.file`
      }

      const res = await fetch(
        "https://webexback-06cc.onrender.com/api/chats/schedule",
        {
          method: "POST",
          body: formData, // No need for headers, browser sets Content-Type with boundary
        }
      );

      if (!res.ok) throw new Error("Message send failed");

      setValue(""); // Clear textarea
      setSelectedFile(null); // Clear file
      setIsReply(false);
      setReplyMsgId(null);
      setReplyMessage(null);
      setSelectedQuoteMessage(null);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
      setSubmitBtnDisabled(false);
      setMessageLoading(false);
      setSelectedUsers([]);
      setValue("");
      setScheduleModalOpen(false);
      setSelectedHours(null);
      const chatInput = document.getElementById("chatInput");
      const chatInput2 = document.getElementById("chatInputuser");
      if (chatInput) {
        chatInput.innerHTML = "";
      }
      if (chatInput2) {
        chatInput2.innerHTML = "";
      }
      localStorage.removeItem(localStorageKey);
      scrollToBottom();
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

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (!inputRef.current) return;

      const value = inputRef.current.innerHTML.trim();

      if (value && value !== "<br>") {
        setValue(value);
      }
    });

    if (inputRef.current) {
      observer.observe(inputRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => observer.disconnect();
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

  // 🔁 Helper to dispatch an input event manually
  function triggerInputEvent(el) {
    const event = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(event);
  }

  useEffect(() => {
    console.log("Value updated:", value);
  }, [value]);

  // Input change handler to track value changes
  const handleInputChange = (e) => {
    setValue(e.target.innerHTML);
    localStorage.setItem(localStorageKey, e.target.innerHTML);
    //console.log("Input changed, new value:", e.target.innerHTML);
  };
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const onEmojiClick = (event, emojiObject) => {
    const emoji = event.emoji;

    //console.log("Emoji clicked:", event);

    if (inputRef.current) {
      inputRef.current.focus();

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      range.deleteContents();

      // Create a text node with emoji and insert it
      const textNode = document.createTextNode(emoji);
      range.insertNode(textNode);

      // Move the caret immediately after the inserted emoji node
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);

      // Collapse the range to the end point (so caret is after emoji)
      sel.removeAllRanges();
      sel.addRange(range);

      // Update the state with new innerHTML of contentEditable div
      setValue(inputRef.current.innerHTML);

      // Save to localStorage
      localStorage.setItem(localStorageKey, inputRef.current.innerHTML);
      setShowEmojiPicker(false);
    }
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
    // if (updatedSelectedUsers.length !== selectedUsers.length) {
    //   setSelectedUsers(updatedSelectedUsers);
    //   console.log("Cleaned up selectedUsers:", updatedSelectedUsers);
    // }
  }, [value]);

  useEffect(() => {
    if (isReply && inputRef.current) {
      inputRef.current.focus();

      // Optional: Move cursor to the end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputRef.current);
      range.collapse(false); // move cursor to the end
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isReply]);

  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem(localStorageKey);
        if (saved) {
          //console.log("Restoring saved input:", saved);
          setValue(saved);
          if (inputRef.current) {
            inputRef.current.innerHTML = saved;
          }
        }
      } catch (error) {
        console.error("Failed to restore input:", error);
      }
    })();
  }, [localStorageKey, userId, type]);

  useEffect(() => {
    const socket = getSocket();
    connectSocket(user.id);

    const handleFetchMembers = (data) => {
      const { group_id } = data;
      if (group_id == userId && type == "group") {
        fetchUsers();
      }
    };

    socket.on("fetch_group_members", handleFetchMembers);

    return () => {
      socket.off("fetch_group_members", handleFetchMembers);
    };
  }, [userId, type]);

  const containerRef = useRef();

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
    <>
      {isReply && (
        <div
          className={`ios p-3 rounded text-xs flex justify-between items-center mb-1 
          ${
            theme == "dark"
              ? "bg-gray-900 text-gray-50 border border-gray-700 border-1"
              : "bg-gray-100 text-gray-600 border border-gray-200 border-1"
          }
        `}
        >
          <div>
            Replying to:{" "}
            <div
              dangerouslySetInnerHTML={{
                __html:
                  replyMessage.length > 60
                    ? replyMessage.slice(0, 60) + "..."
                    : replyMessage,
              }}
            />
          </div>

          <button
            onClick={() => {
              setIsReply(false);
              setReplyMsgId(null);
              setReplyMessage(null);
            }}
            className="p-0.5 bg-red-600 text-white hover:bg-red-700 rounded ml-2"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {selectedQuoteMessage && (
        <div
          className={`ios p-3 rounded text-xs flex justify-between items-center mb-1   
          ${
            theme == "dark"
              ? "bg-gray-900 text-gray-50 border border-gray-700 border-1"
              : "bg-gray-100 text-gray-600 border border-gray-200 border-1"
          }
        `}
        >
          <div>
            <div className="flex items-center gap-2">
              <QuoteIcon size={15} className="text-orange-500" />{" "}
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedQuoteMessage.sender_name,
                }}
              />
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  selectedQuoteMessage.message.length > 60
                    ? selectedQuoteMessage.message.slice(0, 60) + "..."
                    : selectedQuoteMessage.message,
              }}
            />
          </div>

          <button
            onClick={() => {
              setSelectedQuoteMessage(null);
            }}
            className="p-0.5 bg-red-600 text-white hover:bg-red-700 rounded ml-2"
          >
            <X size={18} />
          </button>
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

      <div className="relative">
        {/* Paperclip icon (file input trigger) */}
        <div
          onMouseDown={startResizing}
          className={`cursor-row-resize absolute top-[1px] right-[50%] z-50  p-0.5 rounded
          ${
            theme == "dark"
              ? "text-gray-100 bg-orange-700"
              : "text-gray-600 bg-gray-100 hover:text-gray-300 hover:bg-white"
          }
        `}
          data-tooltip-id="my-tooltip"
          data-tooltip-content="Drag to resize"
        >
          {height >= 250 ? (
            <ChevronsDown
              size={14}
              className={`${theme == "dark" ? "" : ""}`}
            />
          ) : (
            <ChevronsUp size={14} className={`${theme == "dark" ? "" : ""}`} />
          )}
        </div>
        <div
          ref={containerRef}
          style={{ height }}
          className={`${
            theme == "dark" ? "bg-gray-700" : "bg-gray-100"
          } chat-send-container space-x-2 flex items-end justify-between mx-auto max-h-[250px] min-h-[90px] ios py-2 px-2 rounded items-stretch`}
        >
          <div className="flex flex-col items-center justify-start gap-2 h-fill">
            {user?.user_type == "admin" ? (
              <div className="relative">
                {/* Toggle Button */}
                <button
                  onClick={() => setIsToolbarOpen(!isToolbarOpen)}
                  className={`p-1 rounded-full hover:bg-orange-100 text-orange-500 transition-all duration-200 ${
                    isToolbarOpen ? "rotate-45" : ""
                  }`}
                >
                  <Plus size={20} />
                </button>

                {/* Floating Toolbar */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={
                    isToolbarOpen
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.95 }
                  }
                  transition={{ duration: 0.2 }}
                  style={{ height: "100px" }}
                  className="absolute z-10 bg-white h-8 max-h-8 shadow-md rounded-md p-2 flex items-center gap-2 top-[-40px] left-0"
                >
                  {/* File Upload */}
                  <label className="h-6 cursor-pointer border border-orange-500 text-orange-500 hover:text-white px-2 py-1 rounded hover:bg-orange-600 transition flex items-center gap-1">
                    <Paperclip size={14} />
                    <span className="text-sm hidden sm:inline">File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </label>
                </motion.div>
              </div>
            ) : (
              <label className="cursor-pointer border border-orange-500 text-orange-500 hover:text-white px-1 py-1 rounded hover:bg-orange-600 transition ">
                <Paperclip size={14} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </label>
            )}

            <button
              type="button"
              className=" text-xl"
              onClick={() => setShowEmojiPicker((val) => !val)}
              aria-label="Toggle emoji picker"
            >
              😊
            </button>

            {/* Emoji picker popup */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 z-50">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  lazyLoadEmojis={true}
                  theme="dark"
                />
              </div>
            )}
          </div>
          {/* Show selected file with X */}

          {type === "group" ? (
            <div className="relative w-full flex">
              {value.trim() === "" && (
                <div className="absolute left-3 top-3 text-gray-400 pointer-events-none select-none">
                  Type @ to mention someone...
                </div>
              )}

              <div
                className={`overflow-auto border rounded-b w-full ${
                  theme === "dark"
                    ? "bg-gray-600 border-gray-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <div
                  id="chatInput"
                  ref={inputRef}
                  contentEditable
                  className={`w-full h-full overflow-y-auto px-3 py-2 rounded border  focus:outline-none 
                  ${
                    theme == "dark"
                      ? "bg-gray-600 border-gray-500 text-gray-200"
                      : "bg-white border-gray-300"
                  }  
                `}
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
            </div>
          ) : (
            <div className="relative w-full flex">
              {value.trim() === "" && (
                <div className="absolute left-3 top-3 text-gray-400 pointer-events-none select-none">
                  Type your message...
                </div>
              )}

              <div
                className={`overflow-auto border rounded-b w-full ${
                  theme === "dark"
                    ? "bg-gray-600 border-gray-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <div
                  id="chatInputuser"
                  ref={inputRef}
                  contentEditable
                  className={`w-full h-full overflow-y-auto px-3 py-2 rounded border  focus:outline-none 
                  ${
                    theme == "dark"
                      ? "bg-gray-600 border-gray-500 text-gray-200"
                      : "bg-white border-gray-300"
                  }  
                `}
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
            </div>
          )}
          <div className="flex flex-col items-center gap-2 justify-end">
            {!isReply && (
              <button
                onClick={() => {
                  setScheduleModalOpen(true);
                }}
                disabled={submitBtnDisabled || cleanedValue === ""}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Schedule Message"
                className="bg-gray-500 text-white px-2 py-2 rounded hover:bg-gray-600 transition "
              >
                  <Clock4 size={13} />
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={submitBtnDisabled || cleanedValue === ""}
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
      {scheduleModalOpen && (
        <ScheduleMessageModal
          onClose={() => {
            setScheduleModalOpen(false);
          }}
          onSchedule={handleSchedule}
          selectedHours={selectedHours}
          setSelectedHours={setSelectedHours}
          customDate={customDate}
          setCustomDate={setCustomDate}
          customTime={customTime}
          setCustomTime={setCustomTime}
        />
      )}
    </>
  );
};

export default ChatSend;
