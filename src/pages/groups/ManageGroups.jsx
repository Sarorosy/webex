import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  RefreshCcw,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddGroup from "./AddGroup";

const ManageGroups = () => {
  const [groups, setGroups] = useState([]);
  const [addGroup, setAddGroup] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [loading, setLoading]= useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

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
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-medium text-lg">{group.group_name}</p>
                <p className="text-gray-500 text-sm">{group.description}</p>
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
              <div className="flex items-center gap-2">
                <button className="p-2 border rounded hover:bg-gray-100">
                  <Pencil size={18} />
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
        {addGroup && <AddGroup onClose={() => setAddGroup(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default ManageGroups;
