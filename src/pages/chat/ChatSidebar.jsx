import React, { useState, useEffect } from "react";
import { Users, User, Users2, Search } from "lucide-react"; // Lucide icons
import { useAuth } from "../../utils/idb";

const ChatSidebar = ({onSelect}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]); // Will store groups and users
  const [filteredData, setFilteredData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/chats/getGroupsAndUsersInteracted",
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({ userId: user.id }),
          }
        );
        const data = await res.json();
        if (data.status) {
          setChats(data.data || []);
        } else {
          console.error("Error fetching chats data");
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, []);

  // Filter chats based on the selected tab and search query
  useEffect(() => {
    const filtered = chats.filter((chat) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "direct" && chat.type === "user") ||
        (activeTab === "group" && chat.type === "group");

      const matchesSearch = chat.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

    setFilteredData(filtered);
  }, [chats, activeTab, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r sticky top-0">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search Spaces, Persons"
            className="p-2 border rounded-md w-full "
          />
        </div>
        <div className="flex justify-start gap-2 mb-4 bg-white p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
              activeTab === "all"
                ? "bg-gray-200 text-black font-semibold"
                : "text-gray-600"
            }`}
          >
            <Users size={16} />
            All
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
              activeTab === "direct"
                ? "bg-gray-200 text-black font-semibold"
                : "text-gray-600"
            }`}
          >
            <User size={16} />
            Direct
          </button>
          <button
            onClick={() => setActiveTab("group")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
              activeTab === "group"
                ? "bg-gray-200 text-black font-semibold"
                : "text-gray-600"
            }`}
          >
            <Users2 size={16} />
            Group
          </button>
        </div>
      </div>

      {/* Render filtered data */}
      {filteredData.map((chat) => (
        <div
          key={chat.id}
          onClick={()=>{onSelect(chat)}}
          className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-200"
        >
          <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center">
            {chat.name[0]}
          </div>
          <span className={`truncate`}>{chat.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ChatSidebar;
