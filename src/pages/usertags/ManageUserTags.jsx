import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useAuth } from "../../utils/idb";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";

const API_URL = "https://webexback-06cc.onrender.com/api/usertags"; // adjust if needed

export default function ManageUserTags({ onClose }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tagsPerPage = 10;

  const { theme } = useAuth();

  // Fetch tags
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await axios.get(API_URL);
      setTags(res.data?.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await axios.post(API_URL, { name: newTag });
      setNewTag("");
      setShowCreate(false);
      fetchTags();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const updateTag = async (id) => {
    if (!editName.trim()) return;
    try {
      await axios.put(`${API_URL}/${id}`, { name: editName });
      setEditingId(null);
      setEditName("");
      fetchTags();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteTag = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`);
      setDeleteOpen(false);
      setDeleteId(null);
      fetchTags();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter + paginate
  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTags.length / tagsPerPage);
  const startIndex = (currentPage - 1) * tagsPerPage;
  const paginatedTags = filteredTags.slice(
    startIndex,
    startIndex + tagsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative w-full max-w-[450px] h-screen ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
        } shadow-xl flex flex-col`}
      >
        {/* Header */}
        <div
          className={`p-4 py-2 border-b font-semibold text-lg flex justify-between items-center sticky top-0
            ${
              theme === "dark"
                ? "bg-gray-700 text-white"
                : "bg-gray-200 text-black"
            }`}
        >
          <h1 className="text-lg font-semibold">Manage User Tags</h1>
          <button
            onClick={onClose}
            className="text-sm text-white bg-orange-600 px-1 py-1 rounded hover:bg-orange-800"
          >
            <X size={13} />
          </button>
        </div>

        {/* Search + Create */}
        <div className="flex items-center justify-end p-3 gap-2">
          {!showCreate && (

          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400"
          />
          )}
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1 bg-orange-600 text-white px-2 f-11 py-1 rounded hover:bg-orange-700"
          >
            {showCreate ? (
              <div className="flex items-center">
                <X size={13} className="mr-1" /> Close
              </div>
            ) : (
              <div className="flex items-center">
                <Plus size={13} className="mr-1" /> Create
              </div>
            )}
          </button>
        </div>

        {/* Add new tag (toggle) */}
        {showCreate && (
          <div className="flex mb-4 px-3 py-1">
            <input
              type="text"
              placeholder="Enter new tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400"
            />
            <button
              onClick={addTag}
              className="bg-orange-600 text-white px-4 rounded-r hover:bg-orange-700"
            >
              Add
            </button>
          </div>
        )}

        {/* Tag list */}
        <ul className="space-y-2 flex-1 overflow-y-auto px-3 pb-3">
          {paginatedTags.map((tag) => (
            <li
              key={tag.id}
              className="flex justify-between items-center border rounded px-3 py-2"
            >
              {editingId === tag.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`flex-1 border px-2 py-1 mr-2 rounded ${ theme == "dark" ? "bg-gray-500 border border-gray-500" : "" }`}
                />
              ) : (
                <span>{tag.name}</span>
              )}

              <div className="space-x-2">
                {editingId === tag.id ? (
                  <button
                    onClick={() => updateTag(tag.id)}
                    className="bg-green-500 text-white px-3 py-1 f-11 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(tag)}
                    className="bg-yellow-500 text-white px-3 py-1 f-11 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => handleDeleteConfirm(tag.id)}
                  className="bg-red-500 text-white px-3 py-1 f-11 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Delete confirm */}
        {deleteOpen && (
          <ConfirmationModal
            title="Are you sure you want to delete this tag?"
            message="This action cannot be undone."
            onYes={handleDeleteTag}
            onClose={() => setDeleteOpen(false)}
          />
        )}
      </motion.div>
    </div>
  );
}
