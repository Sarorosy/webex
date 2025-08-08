import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw, X } from "lucide-react"; // Optional close icon
import CreatePoll from "../chat/CreatePoll";

const ManagePoll = ({ onClose }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [showEmojiPickerIndex, setShowEmojiPickerIndex] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://webexback-06cc.onrender.com/api/messages/all-poll-messages"
      );
      if (res.data.status) {
        setPolls(res.data.messages);
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

  const renderOptionsSummary = (pollOptionsJson) => {
    try {
      const options = JSON.parse(pollOptionsJson);

      return (
        <div className="flex flex-col gap-1">
          {options.map((opt) => (
            <div key={opt.id} className="text-sm text-gray-700">
              {opt.option}{" "}
              <span className="text-xs text-gray-500">
                ({opt.users.length} votes)
              </span>
            </div>
          ))}
        </div>
      );
    } catch (err) {
      return <div className="text-red-500 text-sm">Invalid options</div>;
    }
  };

  const handleClonePoll = (poll) => {
  try {
    const clonedOptions = JSON.parse(poll.poll_options).map((opt) => ({
      option: opt.option,
      users: [],
    }));

    setQuestion(poll.poll_question + " (Clone)");
    setOptions(clonedOptions.map((o) => o.option));
    setAllowMultiple(!!poll.is_multiple_poll);
    setAddOpen(true);
  } catch (err) {
    toast.error("Failed to clone poll");
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
              <h4 className="text-lg font-semibold">Polls</h4>
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
                onClick={fetchPolls}
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
              <p>Loading polls...</p>
            ) : (
              <div className="overflow-auto ios">
                <table className="w-full text-sm border border-gray-300 rounded shadow">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Question</th>
                      <th className="px-3 py-2 text-left">Options (Votes)</th>
                      <th className="px-3 py-2 text-left">Group/User</th>
                      <th className="px-3 py-2 text-left">Created At</th>
                      <th className="px-3 py-2 text-left">Multiple</th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {polls.map((poll, index) => (
                      <tr
                        key={poll.id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">{poll.poll_question}</td>
                        <td className="px-3 py-2">
                          {renderOptionsSummary(poll.poll_options)}
                        </td>
                        <td className="px-3 py-2">
                          {poll.group_name
                            ? poll.group_name
                            : `User ID: ${poll.receiver_id}`}
                        </td>
                        <td className="px-3 py-2 text-xs">{poll.created_at}</td>
                        <td className="px-3 py-2">
                          {poll.is_multiple_poll ? "Yes" : "No"}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleClonePoll(poll)}
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
        <CreatePoll
          onClose={() => {
            setAddOpen(false);
          }}
          question={question}
          setQuestion={setQuestion}
          options={options}
          setOptions={setOptions}
          allowMultiple={allowMultiple}
          setAllowMultiple={setAllowMultiple}
          showEmojiPickerIndex={showEmojiPickerIndex}
          setShowEmojiPickerIndex={setShowEmojiPickerIndex}
          finalFunction={fetchPolls}
        />
      )}
    </AnimatePresence>
  );
};

export default ManagePoll;
