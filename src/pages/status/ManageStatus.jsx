import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw, X } from "lucide-react";
import AddStatus from "./AddStatus";

const ManageStatus = ({ onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [cloneData, setCloneData] = useState(null); // <== Add this

  // Open AddStatus and pass clone data
  const handleClone = (announcement) => {
    setCloneData(announcement);
    setAddOpen(true);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://webexback-06cc.onrender.com/api/status/all");
      if (res.data.status) {
        setAnnouncements(res.data.data);
      } else {
        toast.error("Failed to fetch polls");
      }
    } catch (err) {
      console.error("Error fetching polls:", err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-40"
          onClick={onClose}
        ></div>

        {/* Offcanvas Panel */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-5xl bg-white h-full shadow-xl overflow-y-auto"
        >
          {/* Close button */}
          <div className="flex items-center justify-between mb-2 px-4 py-3 bg-gray-300 sticky top-0">
            <div className="">
              <h4 className="text-lg font-semibold">Announcements</h4>
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

          <div className="space-y-4  p-4">
            <div className="w-full flex items-center justify-end">
              <button
                className="bg-gray-500 text-white rounded f-11 py-0.5 px-1 mr-2 flex items-center"
                onClick={fetchAnnouncements}
              >
                <RefreshCcw
                  size={15}
                  className={`mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                className="bg-orange-500 text-white rounded f-11 py-0.5 px-1 flex items-center"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={15} className="mr-1" />
                Add new
              </button>
            </div>

            {loading ? (
              <p>Loading Announcements...</p>
            ) : (
              <div className="overflow-auto ios">
                <table className="w-full text-sm border border-gray-300 rounded shadow">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Group</th>
                      <th className="px-3 py-2 text-left">Added By</th>
                      <th className="px-3 py-2 text-left">Announcement</th>
                      <th className="px-3 py-2 text-left">File</th>
                      <th className="px-3 py-2 text-left">Background</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Created At</th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">{item.group_name}</td>
                        <td className="px-3 py-2">{item.user_name ?? "Admin"}</td>
                        <td className="px-3 py-2 break-words max-w-xs">
                          {item.announcement}
                        </td>
                        <td className="px-3 py-2">
                          {item.is_file && item.file_name ? (
                            <a
                              href={
                                "https://rapidcollaborate.in/ccp" +
                                item.file_name
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              <img
                              src={
                                "https://rapidcollaborate.in/ccp" +
                                item.file_name
                              }
                              className="h-9 w-auto"
                              />
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: item.bgcolor }}
                            title={item.bgcolor}
                          ></div>
                        </td>
                        <td className={`px-3 py-2 ${item.status === 0 ? "text-red-500" : "text-green-600"}`}>
                          {item.status === 0 ? "Inactive" : "Active"}
                        </td>
                        <td className="px-3 py-2 text-xs">{item.created_at}</td>
                        <td className="px-3 py-2 text-xs">
                          <button
                            onClick={() => handleClone(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Clone
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {addOpen && (
  <AddStatus
    onClose={() => {
      setAddOpen(false);
      setCloneData(null);
    }}
    cloneData={cloneData}
    finalFunction={fetchAnnouncements}
  />
)}

    </AnimatePresence>
  );
};

export default ManageStatus;
