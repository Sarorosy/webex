import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Minus } from "lucide-react";
import Select, { components } from "react-select";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";

const EditGroup = ({ selectedGroup, onClose, finalFunction }) => {
  const { user, theme } = useAuth();
  const [name, setName] = useState("");
  const [groupType, setGroupType] = useState("");
  const [description, setDescription] = useState("");
  const [memberLimit, setMemberLimit] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Fetch users from the API
    const fetchInfo = async () => {
      try {
        const res = await fetch(
          `https://webexback-06cc.onrender.com/api/groups/group/${selectedGroup.group_id}`
        );
        const data = await res.json();
        if (data.status) {
          setName(data.group.name);
          setGroupType(data.group.group_type);
          setDescription(data.group.description);
          setMemberLimit(data.group.member_limit);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchInfo();
  }, [selectedGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      const response = await fetch("https://webexback-06cc.onrender.com/api/groups/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedGroup?.group_id,
          name,
          description,
          member_limit: memberLimit,
          user_id: user?.id,
          sender_name: user?.name,
          group_type: groupType,
        }),
      });

      const data = await response.json();

      if (data.status) {
        toast.success("Group updated successfully!");
        onClose(); // Close the modal after creation
        finalFunction();
      } else {
        toast.error(data.message || "Error creating group");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong while creating the group.");
    } finally {
      setCreating(false);
    }
  };

  const handleMemberLimitChange = (operation) => {
    setMemberLimit((prev) => {
      if (operation === "increase") return prev + 1;
      if (operation === "decrease" && prev > 1) return prev - 1;
      return prev;
    });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className={`${
          theme == "dark" ? "bg-gray-300 text-gray-700" : "bg-white text-gray-700"
        }  max-w-4xl  rounded-lg w-[384px]`}
      >
        <div className="flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg">
          <h2 className="text-lg font-semibold text-white">Edit Group</h2>
          <div>
            <button
              className="hover:bg-gray-100 text-white hover:text-black py-1 px-1 rounded"
              onClick={onClose} // Close modal without doing anything
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4  ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Group Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              className={`
                  ${
                    theme == "dark" ? "bg-gray-800 border-gray-400 text-gray-300" : ""
                  }
                  w-full p-2 border rounded-md
                `}
              required
            />
          </div>
          <div>
            <label
              htmlFor="group_type"
              className="block text-sm font-medium mb-1"
            >
              Group Type
            </label>
            <select
              name="group_type"
              id="group_type"
              value={groupType}
              onChange={(e) => {
                setGroupType(e.target.value);
              }}
              className={`
                  ${
                    theme == "dark" ? "bg-gray-800 border-gray-400 text-gray-300" : ""
                  }
                  w-full p-2 border rounded-md
                `}
            >
              <option value="work">Work Group</option>
              <option value="team">Team Group</option>
            </select>
          </div>

          {user?.user_type != "user" && (
            <div className="md:col-span-2">
              <label
                htmlFor="memberLimit"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Member Limit
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleMemberLimitChange("decrease")}
                  className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  <Minus size={15} />
                </button>
                <span className="text-md font-medium">{memberLimit}</span>
                <button
                  type="button"
                  onClick={() => handleMemberLimitChange("increase")}
                  className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          )}

          
          </div>
          <div className="flex justify-end gap-2">
            {/* <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button> */}
            <button
              type="submit"
              disabled={creating}
              className="bg-orange-600 text-white px-2 py-1 rounded-md hover:bg-orange-700"
            >
              {creating ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditGroup;
