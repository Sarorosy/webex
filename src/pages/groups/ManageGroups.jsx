import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  RefreshCcw,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddGroup from "./AddGroup";
import GroupInfo from "./GroupInfo";
import EditGroup from "./EditGroup";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";

const ManageGroups = () => {
  const [groups, setGroups] = useState([]);
  const [addGroup, setAddGroup] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [loading, setLoading]= useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    setViewOpen(true);
  }
  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setEditOpen(true);
  }
  const handleDeleteGroup = async () => {
    try{
      const response = await fetch("http://localhost:5000/api/groups/delete",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({group_id: selectedGroup.id})
      })
      const data = await response.json();
      if(data.status){
        fetchGroups();
        toast.success(data.message || "Success");
      }else{
        toast.error(data.message || "Error deleting group");
      }
    }catch(err){
      console.log(err);
    }
  }

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/groups/all");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }finally{
      setLoading(false)
    }
  };

  const toggleGroup = (id) => {
    setExpandedGroupId((prev) => (prev === id ? null : id));
  };
  if(loading){
    return (
      <div className="text-center">
        Loading..
      </div>
    )
  }


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Manage Groups</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchGroups}
            className="flex items-center gap-2 bg-orange-400 text-white px-2 py-1 rounded hover:bg-orange-500"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
          <button
            onClick={() => setAddGroup(true)}
            className="flex items-center gap-2 bg-orange-400 text-white px-2 py-1 rounded hover:bg-orange-500"
          >
            <Plus size={18} />
            Add Group
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.group_id} className="border p-4 rounded shadow">
            <div className=" mb-2">
              <div>
                <p className="font-medium text-lg">{group.group_name}</p>
                <div className="flex items-center mt-2">
                  <p className="text-sm text-gray-600 border rounded-full px-1 py-0.5">
                    {group.members?.length || 0} members
                  </p>
                  {group.members?.length > 0 && (
                    <button
                      onClick={() => toggleGroup(group.group_id)}
                      className="text-orange-600 flex items-center text-sm hover:underline ml-2"
                    >
                      <Users size={18} className="mr-1" />
                      {expandedGroupId === group.group_id
                        ? "Hide Members"
                        : "View Members"}
                      {expandedGroupId === group.group_id ? (
                        <ChevronUp className="ml-1" size={16} />
                      ) : (
                        <ChevronDown className="ml-1" size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-end items-end gap-2">
                <button 
                onClick={()=>{
                  handleViewGroup(group)
                }}
                className="p-2 border rounded hover:bg-blue-200">
                  <Info size={18} />
                </button>
                <button 
                onClick={()=>{
                  handleEditGroup(group)
                }}
                className="p-2 border rounded hover:bg-orange-200">
                  <Pencil size={18} />
                </button>
                <button 
                onClick={()=>{
                  setSelectedGroup(group);
                  setDeleteOpen(true);
                }}
                className="p-2 border rounded hover:bg-red-200">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedGroupId === group.group_id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-2"
                >
                  <div className="border-t pt-2 space-y-2">
                    {group.members.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={
                            member.profile_pic
                              ? `http://localhost:5000${member.profile_pic}`
                              : "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(member.user_name)
                          }
                          alt={member.user_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {member.user_name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {addGroup && <AddGroup onClose={() => setAddGroup(false)} finalFunction={fetchGroups} />}
        {viewOpen && selectedGroup && <GroupInfo selectedGroup={{id:selectedGroup.group_id,name:selectedGroup?.group_name}} onClose={()=>{setViewOpen(false)}} />}
        {editOpen && <EditGroup selectedGroup={selectedGroup}  onClose={() => setEditOpen(false)} finalFunction={fetchGroups} />}
        {deleteOpen && (
          <ConfirmationModal
                title="Are you sure you want to delete this group?"
                message="This action cannot be undone."
                onYes={handleDeleteGroup} 
                onClose={() => setDeleteOpen(false)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageGroups;
