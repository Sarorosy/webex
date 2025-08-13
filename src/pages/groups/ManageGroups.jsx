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
  X,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddGroup from "./AddGroup";
import GroupInfo from "./GroupInfo";
import EditGroup from "./EditGroup";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAuth } from "../../utils/idb";

const ManageGroups = ({ onClose }) => {
  const [groups, setGroups] = useState([]);
  const [addGroup, setAddGroup] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { theme } = useAuth();
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
  };
  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setEditOpen(true);
  };
  const handleDeleteGroup = async () => {
    try {
      const response = await fetch("https://webexback-06cc.onrender.com/api/groups/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ group_id: selectedGroup.group_id }),
      });
      const data = await response.json();
      if (data.status) {
        setDeleteOpen(false);
        fetchGroups();
        toast.success(data.message || "Success");
      } else {
        toast.error(data.message || "Error deleting group");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://webexback-06cc.onrender.com/api/groups/all");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.group_name.toLowerCase().includes(search.toLowerCase())
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    // Reset to page 1 if filters change
    setCurrentPage(1);
  }, []);

  const toggleGroup = (id) => {
    setExpandedGroupId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center ">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative w-full max-w-[400px] h-screen ${
          theme == "dark"
            ? "bg-gray-800 text-white mw-dark"
            : "bg-white text-black"
        }  shadow-xl `}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center text-lg font-semibold">
            Loading...
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div
              className={`p-4 py-2 border-b font-semibold text-lg flex justify-between items-center sticky top-0
            ${
              theme == "dark"
                ? "bg-gray-500 text-white mw-dark"
                : "bg-gray-300 text-black"
            }
          `}
            >
              <h4 className="text-lg font-semibold">Manage Groups</h4>
              <button
                onClick={onClose}
                className="text-sm text-white bg-orange-600 px-1 py-1 rounded hover:bg-orange-800"
              >
                <X size={13} />
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mb-3 justify-end items-center px-4 pt-4">
              <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-gray-100">
                <Search size={13} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="bg-transparent outline-none f-13"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <button
                  onClick={fetchGroups}
                  className="flex items-center gap-1 bg-orange-400 text-white px-2 py-1 rounded hover:bg-orange-500 f-11"
                >
                  <RefreshCcw size={12} />
                  Refresh
                </button>
              </div>
              <div>
                <button
                  onClick={() => setAddGroup(true)}
                  className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 f-11"
                >
                  <Plus size={12} />
                  Create
                </button>
              </div>
            </div>

            {/* GROUP LIST */}
            <div className="space-y-3 px-3 pb-4 overflow-y-auto h-[86vh]">
              {paginatedGroups.map((group) => (
                <div key={group.group_id} className="border px-2 py-2 rounded">
                  <div className="flex justify-between items-end gap-2">
                    <div>
                      <p className="font-medium text-md">{group.group_name}</p>
                      <div className="flex items-center mt-2">
                        <p
                          className="f-11 text-gray-600 border rounded-full px-1 py-0.5"
                          style={{ color: `${theme == "dark" ? "#fff" : ""}` }}
                        >
                          {group.members?.length || 0} members
                        </p>
                        {group.members?.length > 0 && (
                          <button
                            onClick={() => toggleGroup(group.group_id)}
                            className="text-orange-600 flex items-center f-13 hover:underline ml-2"
                          >
                            <Users size={12} className="mr-1" />
                            {expandedGroupId === group.group_id
                              ? "Hide Members"
                              : "View Members"}
                            {expandedGroupId === group.group_id ? (
                              <ChevronUp className="ml-1" size={12} />
                            ) : (
                              <ChevronDown className="ml-1" size={12} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end items-end gap-2">
                      <button
                        onClick={() => handleViewGroup(group)}
                        className="p-1 border rounded hover:bg-blue-200 text-blue-800"
                        style={{
                          background: `${theme == "dark" ? "#f6f6f6" : ""}`,
                        }}
                      >
                        <Info size={11} />
                      </button>
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="p-1 border rounded hover:bg-orange-200 text-orange-800"
                        style={{
                          background: `${theme == "dark" ? "#f6f6f6" : ""}`,
                        }}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setDeleteOpen(true);
                        }}
                        className="p-1 border rounded hover:bg-red-200 text-red-800"
                        style={{
                          background: `${theme == "dark" ? "#f6f6f6" : ""}`,
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Members Expandable */}
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
                              className="flex items-center gap-3 border-b border-gray-200 pb-2"
                            >
                              <img
                                src={
                                  member.profile_pic
                                    ? member.profile_pic.startsWith("http")
                                      ? member.profile_pic
                                      : `https://rapidcollaborate.in/ccp${member.profile_pic}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        member.user_name
                                      )}`
                                }
                                alt={member.user_name}
                                className="w-8 h-8 rounded-full object-cover"
                                loading="lazy"
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

              {totalPages > 1 && (
                <div className="w-full flex justify-start items-center white-space-nowrap pb-4 pt-3 gap-2 overflow-x-auto">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage == 1}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage == i + 1 ? "bg-purple-600 text-white" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage == totalPages}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Modals */}
            <AnimatePresence>
              {addGroup && (
                <AddGroup
                  onClose={() => setAddGroup(false)}
                  finalFunction={fetchGroups}
                />
              )}
              {viewOpen && selectedGroup && (
                <GroupInfo
                  selectedGroup={{
                    id: selectedGroup.group_id,
                    name: selectedGroup.group_name,
                  }}
                  onClose={() => setViewOpen(false)}
                />
              )}
              {editOpen && (
                <EditGroup
                  selectedGroup={selectedGroup}
                  onClose={() => setEditOpen(false)}
                  finalFunction={fetchGroups}
                />
              )}
              {deleteOpen && (
                <ConfirmationModal
                  title="Are you sure you want to delete this group?"
                  message="This action cannot be undone."
                  onYes={handleDeleteGroup}
                  onClose={() => setDeleteOpen(false)}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ManageGroups;
