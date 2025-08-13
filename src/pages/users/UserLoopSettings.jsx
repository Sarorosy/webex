import React, { useEffect, useState } from "react";
import Select from "react-select"; // import react-select
import { motion } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

const UserLoopSettings = ({ onClose, user }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null); // single select
  const [activeTab, setActiveTab] = useState("present"); // "all" | "present"
  const { theme } = useAuth();

  useEffect(() => {
    if (user?.id) fetchGroups();

    
  }, [user]);

  useEffect(() => {

  if (user?.loop_updates && groups.length > 0) {
    const groupObj = groups.find(g => g.group_id === user.loop_updates);
    if (groupObj) {
      setSelectedGroup({ value: groupObj.group_id, label: groupObj.group_name });
    }
  }
}, [user, groups]);


  useEffect(()=>{
    console.log(selectedGroup)
  },[selectedGroup])

  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        `https://webexback-06cc.onrender.com/api/groups/user-present-groups-only/${user?.id}`
      );
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  const handleSave = async () => {
    try {
      if (!selectedGroup) {
        toast.error("Please select a group");
        return;
      }

      const response = await fetch("https://webexback-06cc.onrender.com/api/users/loop-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          group_id: selectedGroup.value, // send as array
        }),
      });
      const data = await response.json();
      if (data.status) {
        toast.success(data.message || "Loop settings updated successfully");
        onClose();
      } else {
        toast.error(data.message || "Failed to update bot settings");
      }
    } catch (err) {
      console.error("Error saving settings", err);
    }
  };

  // react-select options
  const groupOptions = groups
    .filter((g) => activeTab === "all" || (activeTab === "present" && g.is_present))
    .map((g) => ({ value: g.group_id, label: g.group_name }));

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`${
          theme === "dark" ? "bg-gray-300 text-gray-700" : "bg-white text-gray-700"
        } max-w-4xl rounded-lg w-[400px]`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-orange-500 rounded-t-lg">
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
              <p className="font-semibold text-gray-100 text-sm">{user?.name}</p>
              <p className={`${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Loop Update Settings
              </p>
            </div>
          </div>
          <button
            className="hover:bg-gray-100 text-white hover:text-black py-1 px-1 rounded"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        {/* Dropdown */}
        <div className="p-4">
          <div className="flex gap-4 border-b mb-3">
            Select a group to send loop notifications
          </div>

          <Select
            options={groupOptions}
            value={selectedGroup}
            onChange={setSelectedGroup}
            placeholder="Select a group..."
            isClearable
          />
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

export default UserLoopSettings;
