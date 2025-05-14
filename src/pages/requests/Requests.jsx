import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Requests = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const [limitToIncrease, setLimitToIncrease] = useState(1);
  const [activeRow, setActiveRow] = useState(null);
  const [limitUpdates, setLimitUpdates] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUserRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/userlimit/all");
      setUserRequests(res.data.requests);
    } catch (err) {
      console.error("Error fetching user limit requests:", err);
    }
  };

  const fetchGroupRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/grouplimit/all");
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
        "http://localhost:5000/api/userlimit/approve",
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
        "http://localhost:5000/api/grouplimit/approve",
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

  if (loading)
    return <div className="p-4 text-sm text-gray-500">Loading requests...</div>;

  return (
    <div className="p-4 space-y-8 flex flex-col border rounded sticky top-0 n-height">
      {/* User Limit Requests */}
      <div className="n-bg-light p-3 shadow-md">
        <h2 className="text-mg font-semibold mb-3 text-gray-800">
          User Limit Requests
        </h2>
        {userRequests.length === 0 ? (
          <p className="text-sm text-gray-500">
            No pending user limit requests.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded">
            <table className="min-w-full text-sm text-left text-gray-700">
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
                    <td className="px-4 py-2">{req.requested_at}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleUserApprove(req.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 f-13 rounded transition-colors duration-200"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Group Limit Requests */}
      <div className="n-bg-light p-3 shadow-md">
        <h2 className="text-md font-semibold mb-3 text-gray-800">
          Group Limit Requests
        </h2>
        {groupRequests.length === 0 ? (
          <p className="text-sm text-gray-500">
            No pending group limit requests.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded">
            <table className="min-w-full text-sm text-left text-gray-700">
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
                    <tr key={req.id} className="hover:bg-gray-50 border-b">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{req.sender_name}</td>
                      <td className="px-4 py-2">{req.group_name}</td>
                      <td className="px-4 py-2">{req.member_limit}</td>
                      <td className="px-4 py-2">{req.requested_at}</td>
                      <td className="px-4 py-2 text-center">
                        {isActive ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleGroupLimitChange(req.id, -1)}
                              className="bg-gray-300 px-2 rounded"
                            >
                              -
                            </button>
                            <span>{currentLimit}</span>
                            <button
                              onClick={() => handleGroupLimitChange(req.id, 1)}
                              className="bg-gray-300 px-2 rounded"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleGroupApprove(req.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 f-13 rounded"
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
                                [req.id]:  1,
                              }));
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 f-13 rounded"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
