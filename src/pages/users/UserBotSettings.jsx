import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

const UserBotSettings = ({ onClose, user }) => {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "present"
  const { theme } = useAuth();
  useEffect(() => {
    if (user?.id) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        `https://webexback-06cc.onrender.com/api/groups/user-present-groups/${user?.id}`
      );
      setGroups(res.data.groups || []);
      setSelectedGroups(res.data.existing_ids || []);
    } catch (err) {
      console.error("Error fetching groups", err);
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
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        // className="w-full max-w-md bg-white rounded-lg shadow-xl flex flex-col"
        className={`${
          theme == "dark"
            ? "bg-gray-300 text-gray-700"
            : "bg-white text-gray-700"
        }  max-w-4xl  rounded-lg w-[400px]`}
      >
        {/* Header */}

        <div className="flex justify-between items-center px-4 py-3 bg-orange-500  rounded-t-lg">
          <div className="flex items-center gap-3">
            {user?.profile_pic ? (
              <img
                src={
                  user.profile_pic.startsWith("http")
                    ? user.profile_pic
                    : `https://rapidcollaborate.in/ccp${user.profile_pic}`
                }
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-lg">
                {user?.name?.charAt(0)}
              </div>
            )}

            <div>
              <p className="font-semibold text-gray-100 text-sm">
                {user?.name}
              </p>
              <p
                className={`${
                  theme == "dark" ? "text-gray-100" : "text-gray-500"
                } `}
              >
                Bot Group Settings
              </p>
            </div>
          </div>
          <div>
            <button
              className="hover:bg-gray-100 text-white hover:text-black py-1 px-1 rounded"
              onClick={onClose} // Close modal without doing anything
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Search groups..."
            className={`
                  ${
                    theme == "dark"
                      ? "bg-gray-800 border-gray-400 text-gray-300"
                      : ""
                  }
                  w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring focus:ring-blue-200 f-13
                `}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Group List */}
        <div className="px-4 pt-3">
          <div className="flex gap-4 border-b ">
            {["all", "present"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm pb-2 border-b-2 ${
                  activeTab === tab
                    ? "border-orange-600 text-orange-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                } transition`}
              >
                {tab === "all" ? "All Groups" : "Present"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 px-3 h-80 max-h-80 overflow-y-auto mt-3 mx-1">
          {filteredGroups.map((group) => (
            <label
              key={group.group_id}
              className={`
                ${
                  theme == "dark"
                    ? "bg-gray-400 hover:bg-gray-500"
                    : "bg-gray-200 hover:bg-gray-300"
                }
                flex items-center justify-between py-2 px-3 border-b last:border-none cursor-pointer rounded-md transition mb-1
              `}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium text-gray-800">
                  {group.group_name}
                </span>
                {group.is_present && (
                  <span className=" mt-1 f-10 bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">
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
            className="px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 f-12"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserBotSettings;
