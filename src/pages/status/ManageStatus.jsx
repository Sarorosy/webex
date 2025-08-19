import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw, X } from "lucide-react";
import AddStatus from "./AddStatus";
import { useAuth } from "../../utils/idb";

const ManageStatus = ({ onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [cloneData, setCloneData] = useState(null); // <== Add this
  const { theme } = useAuth();

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
          className={`relative w-full max-w-5xl ${
          theme == "dark"
            ? "bg-gray-800 text-white mw-dark"
            : "bg-white text-black"
        } h-full shadow-xl flex flex-col`}
        >
          {/* Close button */}
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
                className="bg-gray-500 hover:bg-gray-600 text-white rounded f-11 py-1 px-2 mr-2 flex items-center"
                onClick={fetchAnnouncements}
              >
                <RefreshCcw
                  size={12}
                  className={`mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white rounded f-11 py-1 px-2 flex items-center"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={12} className="mr-1" />
                Add new
              </button>
            </div>
          </div>
          <div className="space-y-4 pt-0 p-4 flex-1 overflow-y-auto">
            

            {loading ? (
              <p>Loading Announcements...</p>
            ) : (
              <div className="overflow-auto ios">
                <table className="table-auto border border-gray-300 border-collapse w-full text-[12px] text-left">
                  <thead className={`bg-gray-200 ${
              theme == "dark"
                ? "bg-gray-500 text-white mw-dark"
                : "bg-gray-300 text-black"
            }`}>
                    <tr>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">#</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Group</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Added By</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Announcement</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">File</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Background</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Status</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Created At</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((item, index) => (
                      <tr
                        key={item.id}
                        className={` ${
              theme == "dark"
                ? "bg-gray-900 text-white mw-dark hover:bg-gray-800"
                : "hover:bg-gray-50"
            }`}
                      >
                        <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-2">{item.group_name}</td>
                        <td className="border border-gray-300 px-2 py-2">{item.user_name ?? "Admin"}</td>
                        <td className="border border-gray-300 px-2 py-2 break-words max-w-xs">
                          {item.announcement}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
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
                              className="h-6 w-auto"
                              />
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex justify-center">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.bgcolor }}
                            title={item.bgcolor}
                          ></div></div>
                        </td>
                        <td className={`border border-gray-300 px-2 py-2 ${item.status === 0 ? "text-red-500" : "text-green-600"}`}>
                          {item.status === 0 ? "Inactive" : "Active"}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">{item.created_at}</td>
                        <td className="border border-gray-300 px-2 py-2">
                          <button
                            onClick={() => handleClone(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-[11px] leading-none"
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
