import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, X } from "lucide-react"; // Optional close icon

const Requests = ({ onClose }) => {
  const [userRequests, setUserRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const [limitUpdates, setLimitUpdates] = useState({});
  const [activeRow, setActiveRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(1);

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
          className="relative w-full max-w-3xl bg-white h-full shadow-xl overflow-y-auto"
        >
          {/* Close button */}
          <div className="flex items-center justify-between mb-2 px-4 py-3 bg-gray-300 sticky top-0">
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
    <div className="n-bg-light p-3 shadow-md">
      <h2 className="text-md font-semibold mb-3 text-gray-800">
        User Limit Requests
      </h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading requests...</p>
      ) : userRequests.length === 0 ? (
        <p className="text-sm text-gray-500">
          No pending user limit requests.
        </p>
      ) : (
        <table className="min-w-full f-13 text-left text-gray-700">
          <thead className="bg-gray-300 border-b">
            <tr>
              <th className="px-4 py-2">S.no</th>
              <th className="px-4 py-2">Sender</th>
              <th className="px-4 py-2">Request For</th>
              <th className="px-4 py-2">Group</th>
              <th className="px-4 py-2">Requested At</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {userRequests.map((req, index) => (
              <tr key={req.id} className="hover:bg-gray-50 border-b">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{req.sender_name}</td>
                <td className="px-4 py-2">{req.user_name}</td>
                <td className="px-4 py-2">{req.group_name}</td>
                <td className="px-4 py-2">
                  {new Date(req.requested_at).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td className="px-4 py-2 text-center">
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
                <div className="n-bg-light p-3 shadow-md">
                  <h2 className="text-md font-semibold mb-3 text-gray-800">
                    Group Limit Requests
                  </h2>
                  {groupRequests.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No pending group limit requests.
                    </p>
                  ) : (
                    <table className="min-w-full f-13 text-left text-gray-700">
                      <thead className="bg-gray-300 border-b">
                        <tr>
                          <th className="px-4 py-2">S.no</th>
                          <th className="px-4 py-2">Sender</th>
                          <th className="px-4 py-2">Group</th>
                          <th className="px-4 py-2">Existing Limit</th>
                          <th className="px-4 py-2">Requested At</th>
                          <th className="px-4 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupRequests.map((req, index) => {
                          const isActive = activeRow === req.id;
                          const currentLimit = limitUpdates[req.id] ?? 1;

                          return (
                            <tr
                              key={req.id}
                              className="hover:bg-gray-50 border-b"
                            >
                              <td className="px-4 py-2">{index + 1}</td>
                              <td className="px-4 py-2">{req.sender_name}</td>
                              <td className="px-4 py-2">{req.group_name}</td>
                              <td className="px-4 py-2">{req.member_limit}</td>
                              <td className="px-4 py-2">
                                {new Date(req.requested_at).toLocaleString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </td>
                              <td className="px-4 py-2 text-center">
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
