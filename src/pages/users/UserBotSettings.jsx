import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const UserBotSettings = ({ onClose, user }) => {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "present"

  useEffect(() => {
    if (user?.id) {
      fetchGroups();
      fetchUserGroupSettings();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        `https://webexback-06cc.onrender.com/api/groups/user-present-groups/${user?.id}`
      );
      setGroups(res.data.groups || []);
      setSelectedGroups(res.data.existing_ids || [])
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  const fetchUserGroupSettings = async () => {
    try {
      const res = await axios.get(`/api/bot-settings/${user.id}`);
      setSelectedGroups(res.data.group_ids || []);
    } catch (err) {
      console.error("Error fetching bot settings", err);
    }
  };

  const handleToggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    try {
      if (selectedGroups.length == 0) {
        toast.error("Please select at least one group");
        return;
      }
      const response = await fetch(
        "https://webexback-06cc.onrender.com/api/users/bot-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            group_ids: selectedGroups,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Bot settings updated successfully");
        onClose();
      } else {
        toast.error(data.message || "Failed to update bot settings");
      }
    } catch (err) {
      console.error("Error saving settings", err);
    }
  };

  const filteredGroups = groups
    .filter((group) =>
      group.group_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((group) =>
      activeTab === "present"
        ? group.is_present
        : activeTab === "selected"
        ? selectedGroups.includes(group.id)
        : true
    );

  useEffect(() => {
    console.log(selectedGroups);
  }, [selectedGroups]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b rounded-t-lg">
          <div className="flex items-center gap-3">
            {user?.profile_pic ? (
              <img
                src={"https://rapidcollaborate.in/ccp" + user.profile_pic}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-lg">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500">Bot Group Settings</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600 hover:text-red-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring focus:ring-blue-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Group List */}
        <div className="px-4 pt-4">
          <div className="flex gap-4 border-b mb-3">
            {["all", "present"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm pb-2 border-b-2 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                } transition`}
              >
                {tab === "all" ? "All Groups" : "Present"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 h-80 max-h-80 overflow-y-scroll">
          {filteredGroups.map((group) => (
            <label
              key={group.group_id}
              className="flex items-center justify-between py-3 px-2 border-b last:border-none cursor-pointer hover:bg-gray-50 rounded-md transition"
            >
              <div className="flex flex-col items-start">
                <span className="font-medium text-gray-800">
                  {group.group_name}
                </span>
                {group.is_present && (
                  <span className=" mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">
                    Present in Group
                  </span>
                )}
              </div>

              <input
                type="checkbox"
                checked={selectedGroups.includes(group.group_id)}
                onChange={() => handleToggleGroup(group.group_id)}
                className="w-4 h-4 accent-blue-600"
              />
            </label>
          ))}

          {filteredGroups.length === 0 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              No groups found
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2 rounded-b-lg">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserBotSettings;
