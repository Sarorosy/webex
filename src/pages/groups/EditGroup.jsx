import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Minus } from 'lucide-react';
import Select, { components } from "react-select";
import { useAuth } from '../../utils/idb';
import toast from 'react-hot-toast';

const EditGroup = ({ selectedGroup, onClose , finalFunction }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberLimit, setMemberLimit] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
      // Fetch users from the API
      const fetchInfo = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/groups/group/${selectedGroup.group_id}`);
          const data = await res.json();
          if(data.status){
            setName(data.group.name);
            setDescription(data.group.description);
            setMemberLimit(data.group.member_limit);
          }
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      fetchInfo();
    }, [selectedGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setCreating(true)
      const response = await fetch('http://localhost:5000/api/groups/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: selectedGroup?.group_id,
          name,
          description,
          member_limit: memberLimit,
          user_id : user?.id,
          sender_name : user?.name,
        }),
      });
  
      const data = await response.json();
  
      if (data.status) {
        toast.success('Group updated successfully!');
        onClose(); // Close the modal after creation
        finalFunction();
      } else {
        toast.error(data.message || 'Error creating group');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong while creating the group.');
    }finally{
      setCreating(false)
    }
  };
  

  const handleMemberLimitChange = (operation) => {
    setMemberLimit((prev) => {
      if (operation === 'increase') return prev + 1;
      if (operation === 'decrease' && prev > 1) return prev - 1;
      return prev;
    });
  };

  

  return (
    <motion.div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white w-full max-w-4xl h-auto p-8 overflow-y-auto rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Edit Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Group Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Group name'
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          

          {user?.user_type != "user" && (
            <div>
              <label htmlFor="memberLimit" className="block text-sm font-medium text-gray-700">
                Member Limit
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleMemberLimitChange('decrease')}
                  className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                >
                  <Minus size={18} />
                </button>
                <span className="text-lg font-medium">{memberLimit}</span>
                <button
                  type="button"
                  onClick={() => handleMemberLimitChange('increase')}
                  className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}

          

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
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
