import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Select , {components} from 'react-select';
import { useAuth } from '../../utils/idb'; // assuming your custom hook is here

const AddMembers = ({ groupId, onClose, members, finalFunction }) => {
  const { user,theme } = useAuth();
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
        const userRes = await fetch('https://webexback-06cc.onrender.com/api/users/getusersexcluding', {
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

  const baseURL = "https://rapidcollaborate.in/ccp";

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
        <span className={data.isDisabled ? `${theme == "dark" ? "text-black bg-red-200 cursor-not-allowed" : "bg-red-200 text-gray-900 cursor-not-allowed"}` : " text-gray-900"}>{data.label}</span>
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
            <div className={`w-5 h-5 rounded-full ${theme == "dark" ? "bg-gray-600 "  : "bg-gray-300"} overflow-hidden mr-1 text-xs flex items-center justify-center`}>
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
            const response = await fetch("https://webexback-06cc.onrender.com/api/groups/add-members", {
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
            finalFunction();
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
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg relative">
        

        <div className='flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg'>
          <h2 className="text-lg font-semibold text-white">Select Members</h2>
          <div>
            <button
            className="hover:bg-gray-100 text-white hover:text-black py-1 px-1 rounded"
            onClick={onClose} // Close modal without doing anything
          >
            <X size={15}  />
          </button>
          </div>
        </div>



        <div className='p-6'>
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
            className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 f-13"
            onClick={handleDone}
            disabled={submitting}
          >
            Done
          </button>
        </div>
      </div>
        </div>
    </motion.div>
  );
};

export default AddMembers;
