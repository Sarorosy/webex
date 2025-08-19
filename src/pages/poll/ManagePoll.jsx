import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCcw, X } from "lucide-react"; // Optional close icon
import CreatePoll from "../chat/CreatePoll";
import { useAuth } from "../../utils/idb";

const ManagePoll = ({ onClose }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [showEmojiPickerIndex, setShowEmojiPickerIndex] = useState(null);
  const { theme } = useAuth();
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
            <div key={opt.id} className="text-sm ">
              {opt.option}{" "}
              <span className="text-xs ">
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
          className={`relative w-full max-w-5xl ${
          theme == "dark"
            ? "bg-gray-800 text-white mw-dark"
            : "bg-white text-black"
        }  h-full shadow-xl flex flex-col`}
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
                className="bg-gray-500 text-white rounded f-11 py-1 px-2 mr-2 flex items-center"
                onClick={fetchPolls}
              >
                <RefreshCcw
                  size={12}
                  className={`mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                className="bg-orange-500 text-white rounded f-11 py-1 px-2 flex items-center"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={12} className="mr-1" />
                Add new
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-0 p-4 flex-1 overflow-y-auto">
            

            {loading ? (
              <p>Loading polls...</p>
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
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Question</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Options (Votes)</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Group/User</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Created At</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Multiple</th>
                      <th className="border border-gray-300 px-2 py-2 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {polls.map((poll, index) => (
                      <tr
                        key={poll.id}
                        className={` ${
              theme == "dark"
                ? "bg-gray-900 text-white mw-dark hover:bg-gray-800"
                : "hover:bg-gray-50"
            }`}
                      >
                        <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-2">{poll.poll_question}</td>
                        <td className="border border-gray-300 px-2 py-2">
                          {renderOptionsSummary(poll.poll_options)}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          {poll.group_name
                            ? poll.group_name
                            : `User ID: ${poll.receiver_id}`}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-xs">{poll.created_at}</td>
                        <td className="border border-gray-300 px-2 py-2">
                          {poll.is_multiple_poll ? "Yes" : "No"}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <button
                            onClick={() => handleClonePoll(poll)}
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
