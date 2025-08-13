import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const PollResults = ({ msg, onClose }) => {
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const fetchPollResults = async () => {
    try {
      const res = await fetch(`https://webexback-06cc.onrender.com/api/poll/get-results/${msg.id}`);
      const data = await res.json();
      if (data.status) {
        setPollData(data);
        if (data.options.length > 0) {
          setSelectedOptionId(data.options[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch poll results', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (msg?.id) fetchPollResults();
  }, [msg?.id]);

  const getUsersByOptionId = (id) => {
    return pollData?.options.find((opt) => opt.id === id)?.users || [];
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        className="bg-white w-full max-w-md max-h-[90vh] rounded-xl shadow-xl p-4 relative"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">
          <X size={18} />
        </button>

        <h2 className="text-base font-semibold text-center text-gray-800 mb-4">
          📊 {pollData?.poll_question || 'Poll Results'}
        </h2>

        {loading ? (
          <div className="text-center text-sm text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Option Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {pollData?.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border transition
                    ${
                      selectedOptionId === opt.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                    }
                  `}
                >
                  {opt.option}
                  <span className="bg-white text-blue-600 px-1 rounded-full text-[10px] font-semibold">
                    {opt.users?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Voter List */}
            <div className="overflow-y-auto max-h-[50vh] px-1">
              <div className="grid grid-cols-2 gap-2">
                {getUsersByOptionId(selectedOptionId).length > 0 ? (
                  getUsersByOptionId(selectedOptionId).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md text-sm shadow-sm"
                    >
                      {user.profile_pic ? (
  <img
    src={
      user.profile_pic.startsWith("http")
        ? user.profile_pic
        : `https://rapidcollaborate.in/ccp${user.profile_pic}`
    }
    alt={user.name}
    className="w-6 h-6 rounded-full object-cover"
    loading="lazy"
  />
) : (
  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
    {user.name?.charAt(0)}
  </div>
)}

                      <span className="text-gray-800 font-medium">{user.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-400 italic">No votes yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PollResults;
