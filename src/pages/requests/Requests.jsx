import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, X } from "lucide-react"; // Optional close icon
import { useAuth } from "../../utils/idb";

const Requests = ({ onClose }) => {
  const [userRequests, setUserRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const [limitUpdates, setLimitUpdates] = useState({});
  const [activeRow, setActiveRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(1);
  const { theme } = useAuth();

  const fetchUserRequests = async () => {
    try {
      const res = await axios.get("https://webexback-06cc.onrender.com/api/userlimit/all");
      setUserRequests(res.data.requests);
    } catch (err) {
      console.error("Error fetching user limit requests:", err);
    }
  };

  const fetchGroupRequests = async () => {
    try {
      const res = await axios.get("https://webexback-06cc.onrender.com/api/grouplimit/all");
      if (res.data.status) {
        setGroupRequests(res.data.requests);
      }
    } catch (err) {
      console.error("Error fetching group limit requests:", err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchUserRequests(), fetchGroupRequests()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleUserApprove = async (id) => {
    try {
      const res = await axios.post(
        "https://webexback-06cc.onrender.com/api/userlimit/approve",
        { id }
      );

      if (res.data?.status) {
        toast.success(res.data.message || "User approved successfully");
        setUserRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(res.data.message || "Approval failed");
        if (
          res.data.message === "Group was not found" ||
          res.data.message === "User already present in the group"
        ) {
          fetchUserRequests();
        }
      }
    } catch (err) {
      console.error("Failed to approve user request:", err);
      toast.error("Failed to approve request. Please try again.");
    }
  };

  const handleGroupLimitChange = (id, delta) => {
    setLimitUpdates((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const handleGroupApprove = async (id) => {
    const member_limit = limitUpdates[id] || 1;
    try {
      const res = await axios.post(
        "https://webexback-06cc.onrender.com/api/grouplimit/approve",
        { id, member_limit }
      );

      if (res.data?.status) {
        toast.success(res.data.message || "Group limit increased successfully");
        setGroupRequests((prev) => prev.filter((r) => r.id !== id));
        setActiveRow(null);
      } else {
        toast.error(res.data.message || "Approval failed");
        fetchGroupRequests();
      }
    } catch (err) {
      console.error("Failed to approve group request:", err);
      toast.error("Failed to approve group request. Please try again.");
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
          className={`relative w-full max-w-3xl h-full shadow-xl ${
          theme == "dark"
            ? "bg-gray-800 text-white mw-dark"
            : "bg-white text-black"
        }`}
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
                <h4 className="text-lg font-semibold">Requests</h4>
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

            <div className="flex space-x-2 mb-2">
              <button
                onClick={() => setTab(1)}
                className={`px-3 py-1 f-13 rounded ${tab === 1 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-orange-600 hover:text-white"}`}
              >
                User Requests
              </button>
              <button
                onClick={() => setTab(2)}
                className={`px-3 py-1 f-13 rounded ${tab === 2 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-orange-600 hover:text-white"}`}
              >
                Group Requests
              </button>
            </div>
            <div className="space-y-8">
  {tab === 1 && (
    <div className={`p-3 rounded ${theme == "dark" ? "bg-gray-600" : "bg-gray-100" }`}>
      <h2 className="text-md font-semibold mb-3 ">
        User Limit Requests
      </h2>
      {loading ? (
        <p className="text-sm ">Loading requests...</p>
      ) : userRequests.length === 0 ? (
        <p className="text-sm ">
          No pending user limit requests.
        </p>
      ) : (
        <table className="table-auto border border-gray-300 border-collapse w-full text-[12px] text-left">
          <thead className={`bg-gray-200 ${
              theme == "dark"
                ? "bg-gray-500 text-white mw-dark"
                : "bg-gray-300 text-black"
            }`}>
            <tr>
              <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">S.no</th>
              <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Sender</th>
              <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Request For</th>
              <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Group</th>
              <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Requested At</th>
              <th className="border border-gray-300 px-2 py-2 whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {userRequests.map((req, index) => (
              <tr key={req.id} className={` ${
              theme == "dark"
                ? "bg-gray-900 text-white mw-dark hover:bg-gray-800"
                : "hover:bg-gray-50"
            }`}>
                <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-2 py-2">{req.sender_name}</td>
                <td className="border border-gray-300 px-2 py-2">{req.user_name}</td>
                <td className="border border-gray-300 px-2 py-2">{req.group_name}</td>
                <td className="border border-gray-300 px-2 py-2">
                  {new Date(req.requested_at).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center">
                  <button
                    onClick={() => handleUserApprove(req.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded f-11"
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )}

              {tab === 2 && (
                <div className={`p-3 rounded ${theme == "dark" ? "bg-gray-600" : "bg-gray-100" }`}>
                  <h2 className="text-md font-semibold mb-3 ">
                    Group Limit Requests
                  </h2>
                  {groupRequests.length === 0 ? (
                    <p className="text-sm ">
                      No pending group limit requests.
                    </p>
                  ) : (
                    <table className="table-auto border border-gray-300 border-collapse w-full text-[12px] text-left">
                      <thead className={`bg-gray-200 ${
              theme == "dark"
                ? "bg-gray-500 text-white mw-dark"
                : "bg-gray-300 text-black"
            }`}>
                        <tr>
                          <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">S.no</th>
                          <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Sender</th>
                          <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Group</th>
                          <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Existing Limit</th>
                          <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Requested At</th>
                          <th className="border border-gray-300 px-2 py-2 whitespace-nowrap text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupRequests.map((req, index) => {
                          const isActive = activeRow === req.id;
                          const currentLimit = limitUpdates[req.id] ?? 1;

                          return (
                            <tr
                              key={req.id}
                              className={` ${
              theme == "dark"
                ? "bg-gray-900 text-white mw-dark hover:bg-gray-800"
                : "hover:bg-gray-50"
            }`}
                            >
                              <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                              <td className="border border-gray-300 px-2 py-2">{req.sender_name}</td>
                              <td className="border border-gray-300 px-2 py-2">{req.group_name}</td>
                              <td className="border border-gray-300 px-2 py-2">{req.member_limit}</td>
                              <td className="border border-gray-300 px-2 py-2">
                                {new Date(req.requested_at).toLocaleString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </td>
                              <td className="border border-gray-300 px-2 py-2 text-center">
                                {isActive ? (
                                  <div className="flex items-center justify-center space-x-2">
                                    <button
                                      onClick={() =>
                                        handleGroupLimitChange(req.id, -1)
                                      }
                                      className="bg-gray-300 px-2 rounded"
                                    >
                                      -
                                    </button>
                                    <span>{currentLimit}</span>
                                    <button
                                      onClick={() =>
                                        handleGroupLimitChange(req.id, 1)
                                      }
                                      className="bg-gray-300 px-2 rounded"
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={() => handleGroupApprove(req.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded f-11"
                                    >
                                      Approve
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setActiveRow(req.id);
                                      setLimitUpdates((prev) => ({
                                        ...prev,
                                        [req.id]: 1,
                                      }));
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded f-11"
                                  >
                                    Increase
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Requests;
