import React, { useEffect, useState } from "react";
import {
  Pencil,
  Trash,
  Plus,
  Search,
  CirclePlus,
  Frown,
  Trash2,
  MessagesSquare,
  X,
  PlusIcon,
  Mail,
  Key,
  KeyRound,
  Check,
  Shield,
  Bot,
  Infinity,
  Hash
} from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { encode } from "../../utils/encoder";
import { useAuth } from "../../utils/idb";
import UserBotSettings from "./UserBotSettings";
import UserLoopSettings from "./UserLoopSettings";
import UserTags from "./UserTags";

const getRandomColor = (id) => {
  const colors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-teal-400",
    "bg-orange-400",
  ];
  return colors[id % colors.length];
};

const ManageUsers = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [botSettingsOpen, setBotSettingsOpen] = useState(false);
  const [loopSettingsOpen, setLoopSettingsOpen] = useState(false);
  const [userTagsOpen, setUserTagsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { user, theme } = useAuth();

  // Subadmin permissions state
  const [markingSubadmin, setMarkingSubadmin] = useState(false);
  const [markingUserId, setMarkingUserId] = useState(null);
  const [permissions, setPermissions] = useState({
    view_users: false,
    add_users: false,
    edit_users: false,
    delete_users: false,
    access_requests: false,
    bot_settings: false,
    announcement: false,
  });

  const goToChat = (user) => {
    const encodedId = encode(user.id.toString());
    const encodedName = encode(user.name);
    navigate(`/chat/${encodedId}/${encodedName}`);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://webexback-06cc.onrender.com/api/users/fetchallusers"
      );
      const data = await response.json();
      if (data.status) {
        const filteredUsers = data.data.filter(
          (user) => user.user_type !== "admin"
        );
        setUsers(filteredUsers);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search input
  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
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

  const handleBotMessageClick = (user) => {
    setSelectedUser(user);
    setBotSettingsOpen(true);
  };
  const handleLoopClick = (user) => {
    setSelectedUser(user);
    setLoopSettingsOpen(true);
  };
  const handleTagClick = (user) => {
    setSelectedUser(user);
    setUserTagsOpen(true);
  };

  const handleEditClick = (id) => {
    setSelectedUser(id);
    setEditOpen(true);
  };

  const handleDelete = async (id) => {
    setSelectedUser(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(
        `https://webexback-06cc.onrender.com/api/users/delete/${selectedUser}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.status) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh users list
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    } finally {
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  };

  const toggleUserType = async (userId, currentType) => {
    if (currentType === "user") {
      // If marking as subadmin, show permissions dialog
      setMarkingUserId(userId);
      setMarkingSubadmin(true);
      // Reset permissions
      setPermissions({
        view_users: false,
        add_users: false,
        edit_users: false,
        delete_users: false,
        access_requests: false,
      });
    } else {
      // If marking back to user, just make the API call
      await updateUserType(userId, "user");
    }
  };

  const updateUserType = async (userId, newType, permissionsData = null) => {
    try {
      const requestBody = {
        user_id: userId,
        user_type: newType,
      };

      // Add permissions if provided (for subadmin)
      if (permissionsData) {
        requestBody.permissions = permissionsData;
      }

      const response = await fetch(
        `https://webexback-06cc.onrender.com/api/users/changeUserType`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (data.status) {
        toast.success(`Done`);
        fetchUsers(); // Refresh list
      } else {
        toast.error("Failed to update user type");
      }
    } catch (error) {
      console.error("Error updating user type:", error);
      toast.error("Error updating user type");
    }
  };

  const handlePermissionChange = (permission) => {
    setPermissions({
      ...permissions,
      [permission]: !permissions[permission],
    });
  };

  const confirmSubadminChange = async () => {
    await updateUserType(markingUserId, "subadmin", permissions);
    setMarkingSubadmin(false);
    setMarkingUserId(null);
  };

  const cancelSubadminChange = () => {
    setMarkingSubadmin(false);
    setMarkingUserId(null);
  };

  const handleEditPermissionsClick = (user) => {
    setMarkingUserId(user.id);
    setMarkingSubadmin(true);
    setPermissions({
      view_users: user.view_users == 1,
      add_users: user.add_users == 1,
      edit_users: user.edit_users == 1,
      delete_users: user.delete_users == 1,
      access_requests: user.access_requests == 1,
      bot_settings: user.bot_settings == 1,
      announcement: user.announcement == 1,
    });
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className={`fixed top-0 left-0 w-[45%]  ${
          theme == "dark"
            ? "bg-gray-800 text-white mw-dark"
            : "bg-white text-black"
        } shadow-xl border-r border-gray-300 z-[100] overflow-y-auto prose`}
      >
        <div
          className={`p-4 py-2 border-b font-semibold text-lg flex justify-between items-center sticky top-0
            ${
              theme == "dark"
                ? "bg-gray-500 text-white mw-dark"
                : "bg-gray-300 text-black"
            }
          `}
        >
          <div className="">
            <h4 className="text-lg font-semibold">Users</h4>
          </div>
          <div>
            <button
              onClick={onClose}
              className="text-sm text-white bg-orange-600 px-1 py-1 rounded"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="px-4 pt-4  mb-12">
          <div className="flex justify-end gap-2 items-center mb-3">
            <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-gray-100">
              <Search size={13} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                className="bg-transparent outline-none f-13 text-gray-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {(user?.user_type == "admin" ||
              (user?.user_type == "subadmin" && user?.add_users == 1)) && (
              <button
                onClick={() => setAddOpen(true)}
                className="bg-orange-500 text-white px-2 py-1 f-13 rounded-md flex items-center gap-1 hover:bg-orange-600 transition"
              >
                <PlusIcon size={12} />
                Add User
              </button>
            )}
          </div>

          {/* Users List */}
          <div className="overflow-y-auto h-[84vh] pr-3">
            <div className="">
              <div>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => (
                    <div
                      key={u.id}
                      className={`f-13 mb-2 border p-3 flex justify-between items-end ${
                        markingSubadmin && markingUserId !== u.id
                          ? "hidden"
                          : ""
                      }
                          ${
                            theme == "dark"
                              ? "bg-gray-700 "
                              : "bg-white text-black"
                          } 
                        
                        `}
                    >
                      <div className="flex gap-2">
                        <div className="text-center">
                          {u.trashed == 1 ? (
                            <div className="bg-red-300 mx-auto w-10 h-10 rounded-full flex items-center justify-center">
                              <Trash2 size={22} className="text-red-600" />
                            </div>
                          ) : u.profile_pic ? (
                            <img
                              src={
                                u.profile_pic.startsWith("http")
                                  ? u.profile_pic
                                  : `https://rapidcollaborate.in/ccp${u.profile_pic}`
                              }
                              alt="Profile"
                              className="w-7 h-7 rounded-full object-cover border"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className={`w-7 h-7 ${getRandomColor(
                                u.id
                              )} text-white flex items-center justify-center rounded-full text-xs font-bold`}
                            >
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <div
                            className={`${
                              theme == "dark" ? "text-white" : ""
                            } font-medium `}
                          >
                            {u.name}
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="flex items-center f-11">
                              <Mail size={13} className="mr-2 font-bold" />{" "}
                              {u.email}{" "}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content={
                                u.user_panel == "AP"
                                  ? "Attendance Panel"
                                  : "Service Provider"
                              }
                              className="bg-green-600 text-white px-1 py-0.5 rounded f-11"
                            >
                              {u.user_panel}
                            </div>
                            <div className="bg-green-600 text-white px-1 py-0.5 rounded f-11">
                              {u.seniority == "junior"
                                ? "Associate"
                                : "Sr. Associate"}
                            </div>
                            <div className="flex items-center">
                              {u.user_type}

                              {u.user_type == "subadmin" &&
                                user?.user_type == "admin" && (
                                  <button
                                    className="text-purple-500 ml-2"
                                    onClick={() => {
                                      handleEditPermissionsClick(u);
                                    }}
                                  >
                                    <Shield size={15} />
                                  </button>
                                )}

                               

                                
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="">
                        {u.trashed == 1 ? (
                          <div
                            className="text-red flex items-center justify-center"
                            style={{ textDecoration: "none !important" }}
                          >
                            <Frown size={20} />
                            <span>Deleted User</span>
                          </div>
                        ) : markingSubadmin && markingUserId === u.id ? (
                          <div className="w-full">
                            <div className="border-t pt-2 mt-2">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium flex items-center">
                                  <Shield
                                    size={16}
                                    className="mr-1 text-purple-600"
                                  />
                                  Subadmin Permissions
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2 mb-3">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="view_users"
                                    checked={permissions.view_users}
                                    onChange={() =>
                                      handlePermissionChange("view_users")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor="view_users"
                                    className="text-sm"
                                  >
                                    View Users
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="add_users"
                                    checked={permissions.add_users}
                                    onChange={() =>
                                      handlePermissionChange("add_users")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor="add_users"
                                    className="text-sm"
                                  >
                                    Add Users
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="edit_users"
                                    checked={permissions.edit_users}
                                    onChange={() =>
                                      handlePermissionChange("edit_users")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor="edit_users"
                                    className="text-sm"
                                  >
                                    Edit Users
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="delete_users"
                                    checked={permissions.delete_users}
                                    onChange={() =>
                                      handlePermissionChange("delete_users")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor="delete_users"
                                    className="text-sm"
                                  >
                                    Delete Users
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="access_requests"
                                    checked={permissions.access_requests}
                                    onChange={() =>
                                      handlePermissionChange("access_requests")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor="access_requests"
                                    className="text-sm"
                                  >
                                    Access Requests
                                  </label>
                                </div>

                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="bot_settings"
                                    checked={permissions.bot_settings}
                                    onChange={() =>
                                      handlePermissionChange("bot_settings")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor="bot_settings"
                                    className="text-sm"
                                  >
                                    Bot Settings
                                  </label>
                                </div>

                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="announcement"
                                    checked={permissions.announcement}
                                    onChange={() =>
                                      handlePermissionChange("announcement")
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor="announcement"
                                    className="text-sm"
                                  >
                                    Add Announcement
                                  </label>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={cancelSubadminChange}
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={confirmSubadminChange}
                                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs flex items-center"
                                >
                                  <Check size={12} className="mr-1" />
                                  Confirm
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end justify-start gap-2">
                            <div className="flex justify-start gap-2">
                              {(user?.user_type == "admin") && (
                                <button
                                  title="user Tags"
                                  onClick={() => handleTagClick(u)}
                                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-100 p-1 border rounded"
                                  style={{
                                    background: `${
                                      theme == "dark" ? "#f6f6f6" : ""
                                    }`,
                                  }}
                                >
                                  <Hash size={14} />
                                </button>
                              )}
                              {(user?.user_type == "admin" ||
                                (user?.user_type == "subadmin" &&
                                  user?.bot_settings == 1)) && (
                                <button
                                  title="Loop Updates"
                                  onClick={() => handleLoopClick(u)}
                                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-100 p-1 border rounded"
                                  style={{
                                    background: `${
                                      theme == "dark" ? "#f6f6f6" : ""
                                    }`,
                                  }}
                                >
                                  <Infinity size={15} />
                                </button>
                              )}

                              {(user?.user_type == "admin" ||
                                (user?.user_type == "subadmin" &&
                                  user?.bot_settings == 1)) && (
                                <button
                                  title="Edit Bot Messages"
                                  onClick={() => handleBotMessageClick(u)}
                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1 border rounded"
                                  style={{
                                    background: `${
                                      theme == "dark" ? "#f6f6f6" : ""
                                    }`,
                                  }}
                                >
                                  <Bot size={15} />
                                </button>
                              )}
                              {(user?.user_type == "admin" ||
                                (user?.user_type == "subadmin" &&
                                  user?.edit_users == 1)) && (
                                <button
                                  onClick={() => handleEditClick(u.id)}
                                  className="text-blue-500 hover:text-blue-700 p-1 border rounded"
                                  style={{
                                    background: `${
                                      theme == "dark" ? "#f6f6f6" : ""
                                    }`,
                                  }}
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                              {(user?.user_type == "admin" ||
                                (user?.user_type == "subadmin" &&
                                  user?.delete_users == 1)) && (
                                <button
                                  onClick={() => handleDelete(u.id)}
                                  className="text-red-500 hover:text-red-700 p-1 border rounded"
                                  style={{
                                    background: `${
                                      theme == "dark" ? "#f6f6f6" : ""
                                    }`,
                                  }}
                                >
                                  <Trash size={13} />
                                </button>
                              )}
                            </div>
                            <div className="flex justify-start gap-2">
                              {user?.user_type == "admin" && (
                                <button
                                  onClick={() => {
                                    onClose();
                                    goToChat(u);
                                  }}
                                  className="text-orange-500 hover:text-orange-700 flex items-center gap-1 border p-1 rounded f-11"
                                  style={{
                                    background: `${
                                      theme == "dark" ? "#f6f6f6" : ""
                                    }`,
                                  }}
                                >
                                  <MessagesSquare size={11} /> View Chats
                                </button>
                              )}
                              {user?.user_type == "admin" && (
                                <button
                                  onClick={() =>
                                    toggleUserType(u.id, u.user_type)
                                  }
                                  className="text-purple-500 hover:text-purple-700 border p-1 rounded f-11"
                                  style={{
                                    background: `${
                                      theme == "dark" ? "#f6f6f6" : ""
                                    }`,
                                  }}
                                >
                                  {u.user_type === "user"
                                    ? "Mark as Subadmin"
                                    : "Mark as User"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <div colSpan="5" className="text-center p-3 text-gray-500">
                      {loading ? "Loading..." : "No users found"}
                    </div>
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div className="w-full flex justify-start items-center gap-2 overflow-x-auto white-space-nowrap pb-4 pt-3">
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
          </div>
        </div>

        <AnimatePresence>
          {addOpen && (
            <AddUser
              onClose={() => {
                setAddOpen(false);
              }}
              after={fetchUsers}
            />
          )}
          {editOpen && (
            <EditUser
              onClose={() => {
                setEditOpen(false);
              }}
              userId={selectedUser}
              after={fetchUsers}
            />
          )}

          {botSettingsOpen && (
            <UserBotSettings
              onClose={() => {
                setBotSettingsOpen(false);
              }}
              user={selectedUser}
            />
          )}
          {loopSettingsOpen && (
            <UserLoopSettings
              onClose={() => {
                setLoopSettingsOpen(false);
              }}
              user={selectedUser}
            />
          )}
        {userTagsOpen && (
          <UserTags 
          onClose={()=>{setUserTagsOpen(false)}}
          user={selectedUser}
          after={fetchUsers}
          />
        )}

        </AnimatePresence>

        {isModalOpen && (
          <ConfirmationModal
            title="Are you sure you want to delete this user?"
            message="This action cannot be undone."
            onYes={confirmDelete}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ManageUsers;
