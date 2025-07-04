import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Select, { components } from "react-select";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";

const InviteMembers = ({ groupId, onClose, members }) => {
  const { user ,theme} = useAuth();
  const [users, setUsers] = useState([]);
  const [groupMemberIds, setGroupMemberIds] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const baseURL = "https://rapidcollaborate.in/ccp";

  useEffect(() => {
    const fetchGroupMembersAndUsers = async () => {
      try {
        const ids = Array.isArray(members) ? members.map((member) => member.id) : [];
        setGroupMemberIds(ids); // Optional: still store them if needed

        // Step 2: Fetch users excluding these IDs
        const userRes = await fetch(
          "https://webexback-06cc.onrender.com/api/users/getusersexcluding",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exclude_ids: ids }),
          }
        );
        const userData = await userRes.json();

        // 🔥 Filter only users where is_available === 1
        const availableUsers = (userData.data || []).filter(
          (u) => u.is_available == 0
        );
        setUsers(availableUsers);
      } catch (err) {
        console.error("Error fetching group members or users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupMembersAndUsers();
  }, [groupId, user]);

  const handleInvite = async () => {
    const selectedIds = selectedOptions.map((opt) => opt.value);

    const sender_id = user?.id;
    const group_id = groupId;
    const requested_at = new Date().toISOString();

    const payload = {
      sender_id,
      group_id,
      user_ids: selectedIds,
      requested_at,
    };

    try {
      setInviting(true);
      const res = await fetch("https://webexback-06cc.onrender.com/api/userlimit/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status) {
        toast.success("Request sent");
        onClose(); // close modal or UI
      } else {
        console.error("Invite failed:", data.message || "Unknown error");
      }
    } catch (err) {
      console.error("Error sending invite:", err);
    } finally {
      setInviting(false);
    }
  };

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
            <span>{data.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span>{data.label}</span>
      </div>
    );
  };

  const CustomMultiValue = (props) => {
    const { data } = props;
    const avatar = data.profile_pic ? `${baseURL}${data.profile_pic}` : null;

    return (
      <components.MultiValue {...props}>
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden mr-1 text-xs flex items-center justify-center">
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
          <span>{data.label}</span>
        </div>
      </components.MultiValue>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`${theme == "dark" ? "bg-gray-400" : "bg-white"} w-full max-w-md rounded-lg shadow-lg relative`}>
       

        <div className='flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg'>
          <h2 className="text-lg font-semibold text-white">Invite Members</h2>
          <div>
            <button
            className="hover:bg-gray-100 text-white hover:text-black py-1 px-1 rounded"
            onClick={onClose} // Close modal without doing anything
          >
            <X size={15}  />
          </button>
          </div>
        </div>



        <div className="p-6">
          {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <Select
            isMulti
            options={users.map((u) => ({
              value: u.id,
              name: u.name,
              profile_pic: u.profile_pic,
              label: `${u.name}`,
            }))}
            components={{ Option: CustomOption, MultiValue: CustomMultiValue }}
            value={selectedOptions}
            onChange={setSelectedOptions}
            placeholder="Select users to invite..."
          />
        )}

        <div className="flex justify-end mt-4">
          <button
            className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
            onClick={handleInvite}
            disabled={inviting || loading}
          >
            Invite
          </button>
        </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InviteMembers;
