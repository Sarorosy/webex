import {
  BarChart2,
  Building,
  CircleMinus,
  DoorOpen,
  InfoIcon,
  MoreVertical,
  Pin,
  ScreenShare,
  Search,
  Star,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";
import SearchResults from "./SearchResults";
import { connectSocket, getSocket } from "../../utils/Socket";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import axios from "axios";
import ScreenSharing from "../../components/ScreenSharing";
import TypingIndicator from "./TypingIndicator";
import ScheduledMessages from "./ScheduledMessages";

const ChatHeader = ({
  selectedUser,
  isTyping,
  handleGroupInfoClick,
  searchOpen,
  setSearchOpen,
  setPinMessagesOpen,
  setSelectedMessage,
  query,
  setQuery,
  setSearchResults,
  setLeftGroupOpen,
  chatTab,
  setChatTab,
  setSearchLoading,
  setPollMessagesOpen,
}) => {
  const { user, theme } = useAuth();

  //console.log(selectedUser)

  const [isFavourite, setIsFavourite] = useState(false);
  const { setSelectedUser } = useSelectedUser();
  const { selectedStatus, setSelectedStatus } = useSelectedUser();
  const { selectedGroupForStatus, setSelectedGroupForStatus } =
    useSelectedUser();

  useEffect(() => {
    connectSocket(user?.id);
    const socket = getSocket();

    const handleGroupUpdated = (data) => {
      if (selectedUser?.id == data.id && selectedUser?.type == "group") {
        setSelectedUser((prev) => ({
          ...prev,
          name: data.name,
          group_type: data.group_type,
        }));
      }
    };

    socket.on("group_updated", handleGroupUpdated);

    return () => {
      socket.off("group_updated", handleGroupUpdated);
    };
  }, [user?.id, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      try {
        const favourites = JSON.parse(selectedUser.favourites || "[]");
        setIsFavourite(
          Array.isArray(favourites) && favourites.includes(user?.id)
        );
      } catch (error) {
        console.error("Failed to parse favourites", error);
        setIsFavourite(false);
      }
    }
  }, [selectedUser, user?.id]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim() === "") {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const res = await fetch("https://webexback-06cc.onrender.com/api/messages/find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: selectedUser?.type,
            query,
            logged_in_userid: user.id,
            find_in_userid: selectedUser?.id,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.messages || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 400);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedUser?.id, user.id]);

  const handleFavourite = async () => {
    try {
      const res = await fetch("https://webexback-06cc.onrender.com/api/chats/favourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser?.id,
          user_id: user.id,
          type: selectedUser?.type,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsFavourite(!isFavourite);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  useEffect(() => {
    setSearchOpen(false);
    setSelectedMessage(null);
    setQuery("");
    setChatTab("chats");
  }, [selectedUser]);

  const sendScreenShareRequest = () => {
    const socket = getSocket();
    socket.emit("incoming-screen-share", {
      from: user,
      to: selectedUser,
    });
  };

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="w-full ">
      {/* HEADER */}
      <div
        className={`flex flex-col md:flex-row items-center justify-between gap-3 border-b pb-4 px-3 py-6 ${
          theme == "dark"
            ? "chat-header-bg-dark text-white bg-orange-600"
            : "chat-header-bg text-gray-800"
        }  shadow-inner`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 relative">
            <div
              className={`relative w-8 h-8 flex items-center justify-center rounded-full z-49
      ${
        selectedUser.type === "group" &&
        selectedUser.is_status === 1 &&
        Array.isArray(selectedUser.status) &&
        selectedUser.status.some((s) => s?.id !== null && s?.id !== undefined)
          ? "border-2 border-blue-500 cursor-pointer"
          : ""
      }
    `}
              onClick={(e) => {
                if (
                  selectedUser.type === "group" &&
                  selectedUser.is_status === 1
                ) {
                  const validStatuses = (selectedUser.status || []).filter(
                    (s) => s?.id !== null && s?.id !== undefined
                  );

                  if (validStatuses.length > 0) {
                    e.stopPropagation();
                    setSelectedStatus(validStatuses);
                    setSelectedGroupForStatus(selectedUser.id);
                  }
                }
              }}
            >
              {selectedUser?.profile_pic ? (
                <img
                  src={
                    selectedUser.profile_pic.startsWith("http")
                      ? selectedUser.profile_pic
                      : "https://rapidcollaborate.in/ccp" +
                        selectedUser.profile_pic
                  }
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`flex items-center justify-center ${
                    selectedUser?.type === "group" &&
                    selectedUser?.is_status === 1
                      ? "w-7 h-7"
                      : "w-8 h-8"
                  } rounded-full bg-orange-500 text-white text-lg font-bold shadow`}
                >
                  {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              {/* Small status dot */}
              {selectedUser?.type === "group" &&
                selectedUser?.is_status === 1 && Array.isArray(selectedUser.status) &&
                            selectedUser.status.some(
                              (s) => s?.id !== null && s?.id !== undefined
                            ) && (
                  <span className="absolute top-0 -right-1 w-3 h-3 border-2 border-white rounded-full bg-blue-600 cursor-pointer z-50" />
                )}
            </div>
          </div>

          <h2 className="text-lg font-bold  tracking-wide flex flex-col ml-2">
            <span className="flex items-center">
              {selectedUser?.id == user?.id && selectedUser?.type == "user"
                ? selectedUser?.name + " (You)"
                : selectedUser?.name || "Unknown User"}
              <button onClick={handleFavourite}>
                <Star
                  size={18}
                  className={`ml-2 ${
                    isFavourite
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </span>
            {/* {isTyping && (
              // <div className="typing-indicator italic  f-11">Typing...</div>
              // <TypingIndicator />
            )} */}
            {/* <AgoraCall /> */}
          </h2>

          {/* {selectedUser?.office_name && selectedUser?.city_name && (
            <p className="flex items-center ml-6">
              <Building className="mr-2 text-gray-700" size={15} />{" "}
              {selectedUser?.office_name}{" "}
              {selectedUser?.city_name ? ", " + selectedUser?.city_name : null}
            </p>
          )} */}
        </div>

        {/* Right Section */}
        <div className="flex justify-between items-center gap-3">
          {selectedUser?.type == "group" && selectedUser?.group_type && (
            <div
              className={`typing-indicator bg-gray-100 px-2 py-0.5 rounded uppercase f-11 text-black`}
            >
              {selectedUser?.group_type} group
            </div>
          )}
          {searchOpen ? (
            <div className="flex items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search..."
                className={` ${
                  theme == "dark" ? "text-black" : ""
                } px-2 py-1 pr-9 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 f-13`}
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                  setSearchResults([]);
                }}
                className="bg-red-500 text-white rounded hover:bg-red-800 p-1 font-bold text-md ml-[-26px]"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Search Messages"
              onClick={() => setSearchOpen(true)}
              className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
            >
              <Search size={13} />
            </button>
          )}
          {selectedUser?.type == "group" && (
            <div className="flex items-center gap-3">
              <button
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Group Info"
                onClick={() => handleGroupInfoClick(selectedUser)}
                className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
              >
                <InfoIcon size={13} />
              </button>
              <button
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Leave group"
                onClick={() => setLeftGroupOpen(true)}
                className="p-2 bg-red-300 text-black hover:text-white f-13 rounded-full hover:bg-red-600 transition"
              >
                <DoorOpen size={13} />
              </button>
            </div>
          )}
          {selectedUser?.type == "user" && (
            <button
              onClick={sendScreenShareRequest}
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Share your screen"
              className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
            >
              <ScreenShare size={13} />
            </button>
          )}

          <button
            data-tooltip-id="my-tooltip"
            data-tooltip-content="More"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
          >
            <MoreVertical size={13} />
          </button>
          {selectedUser?.type == "group" && (
            <button
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Polls"
              onClick={() => setPollMessagesOpen(true)}
              className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
            >
              <BarChart2 size={13} />
            </button>
          )}
          <button
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Pinned Messages"
            onClick={() => setPinMessagesOpen(true)}
            className="p-2 bg-gray-100 text-black f-13 rounded-full hover:bg-gray-300 transition"
          >
            <Pin size={13} />
          </button>
          <button
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Close Chat"
            onClick={() => setSelectedUser(null)}
            className="p-2 bg-red-200 text-black f-13 rounded-full hover:bg-gray-300 hover:text-red-500 transition"
          >
            <CircleMinus size={13} />
          </button>
        </div>
      </div>
      {showMenu && (
        <div className="py-0.5 px-4 z-50 message-file-selector">
          <button
            onClick={() => setChatTab("chats")}
            className={`px-1 py-0.5 rounded-lg f-11 font-medium transition duration-200 ${
              chatTab === "chats"
                ? "bg-orange-500 text-white  border"
                : "bg-white text-orange-500 border border-orange-200 hover:bg-orange-100"
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setChatTab("files")}
            className={`px-1 py-0.5 rounded-lg f-11 font-medium transition duration-200 ml-4 ${
              chatTab === "files"
                ? "bg-orange-500 text-white  border"
                : "bg-white text-orange-500 border border-orange-200 hover:bg-orange-100"
            }`}
          >
            Files
          </button>
        </div>
      )}
      <ScheduledMessages 
      userId={selectedUser?.id}
      userType={selectedUser?.type}
      />
      {/* FLOATING RESULTS */}
    </div>
  );
};

export default ChatHeader;
