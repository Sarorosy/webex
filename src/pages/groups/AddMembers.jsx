import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Select , {components} from 'react-select';
import { useAuth } from '../../utils/idb'; // assuming your custom hook is here

const AddMembers = ({ groupId, onClose, members }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [groupMemberIds, setGroupMemberIds] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchGroupMembersAndUsers = async () => {
    try {
      
        const ids = Array.isArray(members) ? members.map((member) => member.id) : [];
        setGroupMemberIds(ids); // Optional: still store them if needed

        // Step 2: Fetch users excluding these IDs
        const userRes = await fetch('http://localhost:5000/api/users/getusersexcluding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exclude_ids: ids }),
        });
        const userData = await userRes.json();
        setUsers(userData.data || []);
      
    } catch (err) {
      console.error('Error fetching group members or users:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchGroupMembersAndUsers();
}, [groupId, user]);


  const handleDone = () => {
    const selectedIds = selectedOptions.map((opt) => opt.value);
    handleSubmit(selectedIds);
    
  };

  const options = users.map((u) => ({
    value: u.id,
    label: u.name,
  }));

  const baseURL = "http://localhost:5000";

  // Custom Option with avatar
  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    const avatar = data.profile_pic
      ? `${baseURL}${data.profile_pic}`
      : null;

    return (
      <div ref={innerRef} {...innerProps} className="flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100">
        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2 text-sm">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{data.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className={data.isDisabled ? "text-gray-400" : ""}>{data.label}</span>
      </div>
    );
  };

   const CustomMultiValue = (props) => {
      const { data } = props;
      const avatar = data.profile_pic
        ? `${baseURL}${data.profile_pic}`
        : null;
  
      return (
        <components.MultiValue {...props}>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden mr-1 text-xs flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{data.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span>{data.label}</span>
          </div>
        </components.MultiValue>
      );
    };
  
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async(ids) => {
        try{
            setSubmitting(true);
            const response = await fetch("http://localhost:5000/api/groups/add-members", {
                method : "POST",
                headers : { "Content-type" : "application/json"},
                body : JSON.stringify({
                    members : ids,
                    user_id: user?.id,
                    user_name : user?.name,
                    group_id : groupId
                })
            })
            const data = await response.json()
            onClose();
        }catch(err){
            console.log("Error ", err)
        }finally{
            setSubmitting(false)
        }
    }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X size={22} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Select Members</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
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
              components={{ Option: CustomOption, MultiValue: CustomMultiValue }}
            value={selectedOptions}
            onChange={setSelectedOptions}
            placeholder="Select users..."
          />
        )}

        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleDone}
            disabled={submitting}
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddMembers;
