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
} from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { encode } from "../../utils/encoder";

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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const goToChat = (user) => {
    const encodedId = encode(user.id.toString());
    const encodedName = encode(user.name);
    navigate(`/chat/${encodedId}/${encodedName}`);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/fetchallusers"
      );
      const data = await response.json();
      if (data.status) {
        const filteredUsers = data.data.filter(user => user.user_type !== "admin");
      setUsers(filteredUsers);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search input
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );
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
        `http://localhost:5000/api/users/delete/${selectedUser}`,
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
    try {
      const newType = currentType === "user" ? "subadmin" : "user";

      const response = await fetch(
        `http://localhost:5000/api/users/changeUserType`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, user_type: newType }),
        }
      );

      const data = await response.json();

      if (data.status) {
        toast.success(`User marked as ${newType}`);
        fetchUsers(); // Refresh list
      } else {
        toast.error("Failed to update user type");
      }
    } catch (error) {
      console.error("Error updating user type:", error);
      toast.error("Error updating user type");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* Header and Search */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-gray-100">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            className="bg-transparent outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-1 hover:bg-blue-700 transition"
        >
          <CirclePlus size={16} />
          Add User
        </button>
      </div>

      {/* Users List */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 shadow-sm rounded-lg text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="border p-2">Profile</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Panel</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border text-center hover:bg-gray-50 transition"
                >
                  <td className="border p-2">
                    {user.trashed == 1 ? (
                      <div className="bg-red-300 mx-auto w-10 h-10 rounded-full flex items-center justify-center">
                        <Trash2 size={22} className="text-red-600" />
                      </div>
                    ) : user.profile_pic ? (
                      <img
                        src={"http://localhost:5000" + user.profile_pic}
                        alt="Profile"
                        className="w-10 h-10 rounded-full mx-auto object-cover border"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 ${getRandomColor(
                          user.id
                        )} text-white flex items-center justify-center rounded-full text-xs font-bold mx-auto`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>

                  <td
                    className="border p-2  font-medium"
                    style={{
                      color: user.trashed == 1 ? "red" : "#4b5563",
                      textDecoration: user.trashed == 1 ? "line-through" : "",
                    }}
                  >
                    {user.name}
                  </td>
                  <td
                    className="border p-2 "
                    style={{
                      color: user.trashed == 1 ? "red" : "#4b5563",
                      textDecoration: user.trashed == 1 ? "line-through" : "",
                    }}
                  >
                    {user.email}
                  </td>
                  <td
                    className="border p-2 "
                    style={{
                      color: user.trashed == 1 ? "red" : "#4b5563",
                      textDecoration: user.trashed == 1 ? "line-through" : "",
                    }}
                  >
                    {user.user_panel}
                  </td>
                  <td
                    className="border p-2 "
                    style={{
                      color: user.trashed == 1 ? "red" : "#4b5563",
                      textDecoration: user.trashed == 1 ? "line-through" : "",
                    }}
                  >
                    {user.user_type}
                  </td>
                  <td className="border p-2 ">
                    {user.trashed == 1 ? (
                      <div
                        className="text-red flex items-center justify-center"
                        style={{ textDecoration: "none !important" }}
                      >
                        {" "}
                        <Frown size={20} />
                        <span>Deleted User</span>
                      </div>
                    ) : (
                      <div className="flex justify-start gap-2">
                        <button
                          onClick={() => goToChat(user)}
                          className="text-orange-500 hover:text-orange-700 flex items-center mr-2 border p-1 rounded"
                        >
                          <MessagesSquare size={16} /> View Chats
                        </button>
                        

                        <button
                          onClick={() => handleEditClick(user.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={16} />
                        </button>
                        <button
                          onClick={() =>
                            toggleUserType(user.id, user.user_type)
                          }
                          className="text-purple-500 hover:text-purple-700 border p-1 rounded text-xs"
                        >
                          {user.user_type === "user"
                            ? "Mark as Subadmin"
                            : "Mark as User"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-3 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
      </AnimatePresence>

      {isModalOpen && (
        <ConfirmationModal
          title="Are you sure you want to delete this user?"
          message="This action cannot be undone."
          onYes={confirmDelete}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Users;
