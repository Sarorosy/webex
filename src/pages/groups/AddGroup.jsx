import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Minus } from "lucide-react";
import Select, { components } from "react-select";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";

const AddGroup = ({ onClose, finalFunction }) => {
  const { user, theme } = useAuth();
  const [name, setName] = useState("");
  const [groupType, setGroupType] = useState("work");
  const [description, setDescription] = useState("");
  const [memberLimit, setMemberLimit] = useState(20);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Fetch users from the API
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://webexback-06cc.onrender.com/api/users/getusersforgroup",
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({ user_id: user?.id }),
          }
        );
        const data = await res.json();
        setUsers(data.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedMembers.length == 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("https://webexback-06cc.onrender.com/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          member_limit: memberLimit,
          created_by: user.id,
          selectedMembers: selectedMembers,
          group_type : groupType
        }),
      });

      const data = await response.json();

      if (data.status) {
        toast.success("Group created successfully!");
        onClose(); // Close the modal after creation
        finalFunction();
      } else {
        toast.error(data.message || "Error creating group");
      }
    } catch (error) {
      console.error("Error:", error);
      //toast.error('Something went wrong while creating the group.');
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

  const baseURL = "https://rapidcollaborate.in/ccp";

  // Custom Option with avatar
  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    const avatar = data.profile_pic ? `${baseURL}${data.profile_pic}` : null;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100"
      >
        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2 text-sm">
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-black">
              {data.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span
          className={
            data.isDisabled
              ? `${
                  theme == "dark"
                    ? "text-black bg-red-200 cursor-not-allowed"
                    : "bg-red-200 text-gray-900 cursor-not-allowed"
                }`
              : " text-gray-900"
          }
        >
          {data.label}
        </span>
      </div>
    );
  };

  const CustomMultiValue = (props) => {
    const { data } = props;
    const avatar = data.profile_pic ? `${baseURL}${data.profile_pic}` : null;

    return (
      <components.MultiValue {...props}>
        <div className="flex items-center">
          <div
            className={`w-5 h-5 rounded-full ${
              theme == "dark" ? "bg-gray-600 " : "bg-gray-300"
            } overflow-hidden mr-1 text-xs flex items-center justify-center`}
          >
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{data.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="text-black">{data.label}</span>
        </div>
      </components.MultiValue>
    );
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
        }  max-w-4xl  rounded-lg`}
      >
        <div className="flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg">
          <h2 className="text-lg font-semibold text-white">Add Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className=" p-4">
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1"
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
                  w-full p-2 px-3 border rounded-md
                `}
              >
                <option value="work">Work Group</option>
                <option value="team">Team Group</option>
              </select>
            </div>

            {user?.user_type != "user" && (
              <div>
                <label
                  htmlFor="memberLimit"
                  className="block text-sm font-medium  mb-2"
                >
                  Member Limit
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleMemberLimitChange("decrease")}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-lg font-medium">{memberLimit}</span>
                  <button
                    type="button"
                    onClick={() => handleMemberLimitChange("increase")}
                    className="px-2 py-1 bg-gray-200  rounded-full hover:bg-gray-300"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            )}
            

            <div className="md:col-span-2">
              <label className="block text-sm font-medium  mb-1">
                Select Members
              </label>
              <Select
                isMulti
                options={users.map((user) => ({
                  value: user.id,
                  name: user.name,
                  profile_pic: user.profile_pic,
                  label:
                    user.user_type === "user"
                      ? `${user.name} - present in ${user.group_present_count} group(s)`
                      : user.name,
                  isDisabled: user.is_available === 0,
                }))}
                onChange={(selected) => {
                  setSelectedMembers(selected.map((item) => item.value));
                }}
                
                className={`
                  ${
                    theme == "dark" ? "bg-gray-800 border-gray-400" : ""
                  }
                  w-full rounded-md
                `}
                components={{
                  Option: CustomOption,
                  MultiValue: CustomMultiValue,
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-orange-600 text-white px-2 py-1 rounded-md hover:bg-orange-700"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddGroup;
