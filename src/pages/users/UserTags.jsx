import React, { useEffect, useState } from "react";
import Select from "react-select";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

const UserTags = ({ onClose, user , after}) => {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([user?.tags?.split(",")]);
  const { theme } = useAuth();

  useEffect(() => {
    if (user?.id) fetchTags();
  }, [user]);

  useEffect(() => {
    if (user?.tags && tags.length > 0) {
      const userTagIds = user.tags.split(",").map((t) => t.trim());
      const matched = tags
        .filter((t) => userTagIds.includes(String(t.id)))
        .map((t) => ({ value: t.id, label: t.name }));
      setSelectedTags(matched);
    }
  }, [user, tags]);

  const fetchTags = async () => {
    try {
      const res = await axios.get("https://webexback-06cc.onrender.com/api/usertags");
      setTags(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      if (!selectedTags.length) {
        toast.error("Please select at least one tag");
        return;
      }

      const tagIds = selectedTags.map((t) => t.value);

      const response = await fetch("https://webexback-06cc.onrender.com/api/users/update-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          tags: tagIds, // send array of ids
        }),
      });
      const data = await response.json();
      if (data.status) {
        toast.success(data.message || "User tags updated successfully");
        after();
        onClose();
      } else {
        toast.error(data.message || "Failed to update tags");
      }
    } catch (err) {
      console.error("Error saving settings", err);
    }
  };

  const tagOptions = tags.map((t) => ({ value: t.id, label: t.name }));

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
                Update User Tags
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

        {/* Multi-Select */}
        <div className="p-4">
          <Select
            options={tagOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select tags"
            isMulti
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

export default UserTags;
