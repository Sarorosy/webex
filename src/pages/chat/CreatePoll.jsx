import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, SendHorizonal, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";
import Select from 'react-select';

const CreatePoll = ({
  onClose,
  question,
  setQuestion,
  options,
  setOptions,
  allowMultiple,
  setAllowMultiple,
  showEmojiPickerIndex,
  setShowEmojiPickerIndex,
  finalFunction
}) => {
  const { user ,theme } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("https://webexback-06cc.onrender.com/api/groups/all");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
    }
  };

  useEffect(() => {
    const nonEmptyOptions = options.filter((opt) => opt.trim() !== "").length;
    if (nonEmptyOptions === options.length && options.length < 6) {
      setOptions([...options, ""]);
    }
  }, [options]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const moveOption = (from, to) => {
    if (to < 0 || to >= options.length) return;
    const updated = [...options];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setOptions(updated);
  };

  const handleEmojiClick = (emojiObject, index) => {
    const updated = [...options];
    updated[index] += emojiObject.emoji;
    setOptions(updated);
    setShowEmojiPickerIndex(null);
  };
  const groupOptions = groups.map((group) => ({
    value: group.group_id,
    label: group.group_name,
  }));

  const handlePollSend = async () => {
    try {
      const trimmedOptions = options
        .map((opt) => opt.trim())
        .filter((opt) => opt !== "");

      if (!question.trim()) {
        toast.error("Please enter a question");
        return;
      }

      if (trimmedOptions.length < 2) {
        toast.error("Please provide at least 2 options");
        return;
      }
      if(selectedGroups.length == 0){
        toast.error("Please select at least one group");
        return;
      }

      const pollData = {
        question: question.trim(),
        options: trimmedOptions,
        allowMultiple,
        sender_id: user?.id ?? 1,
        sender_name: user?.name ?? "Puneet",
        profile_pic: user?.profile_pic ?? null,
        to: selectedGroups.map(group => group.value),
        type: "group",
      };

      const response = await fetch("https://webexback-06cc.onrender.com/api/poll/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollData),
      });
      const data = await response.json();
      if (data.status) {
        onClose();
        toast.success("Poll created successfully");
        setOptions(["", ""]);
        setQuestion("");
        setAllowMultiple(false);
        setShowEmojiPickerIndex(null);
        finalFunction();
        
      } else {
        toast.error(data.message || "Failed to create poll");
      }
    } catch (e) {
      console.error("Error sending poll:", e);
      toast.error("Something went wrong while creating the poll");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: "9999999" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ zIndex: "9999999" }}
        className="w-full max-w-md ios "
      >
        <div
        className={`${
          theme == "dark" ? "bg-gray-300 text-gray-700" : "bg-white text-gray-700"
        }  max-w-4xl  rounded-lg`}
      >
        <div className="flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg">
          <h2 className="text-lg font-semibold text-white">Create poll</h2>
          <button onClick={onClose}>
            <X size={20}  className="text-white" />
          </button>
        </div>
        <div className="p-4">

        {/* Question */}
        <div className="mb-4">
          <label className="font-semibold block mb-1">Question</label>
          <input
            type="text"
            placeholder="Ask question"
            className={`
                  ${
                    theme == "dark" ? "bg-gray-800 border-gray-400 text-gray-300" : ""
                  }
                  w-full p-2 border rounded
                `}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="mb-4 max-h-44 custom-scrollbar overflow-y-auto">
          <label className="font-semibold block mb-1">Options</label>
          <div className="space-y-2">
            {options.map((opt, index) => (
              <div
                key={index}
                className={`
                  ${
                    theme == "dark" ? "bg-gray-800 border-gray-400 text-gray-300" : "bg-white text-gray-500" 
                  }
                  w-full p-2 border rounded flex items-center gap-2
                `}
              >
                <input
                  type="text"
                  placeholder="Add"
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPickerIndex(
                      showEmojiPickerIndex === index ? null : index
                    )
                  }
                >
                  <Smile size={17} />
                </button>
                <div className="flex flex-col gap-[0px]">
                  <button
                    onClick={() => moveOption(index, index - 1)}
                    className="text-[9px] text-gray-400 hover:text-white leading-none"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveOption(index, index + 1)}
                    className="text-[9px] text-gray-400 hover:text-white leading-none"
                  >
                    ▼
                  </button>
                </div>
                {showEmojiPickerIndex === index && (
                  <div className="absolute z-50 mt-40">
                    <EmojiPicker
                      theme="dark"
                      onEmojiClick={(e) => handleEmojiClick(e, index)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="font-semibold block mb-1">Select Groups</label>
          <Select
            options={groupOptions}
            isMulti
            value={selectedGroups}
            onChange={setSelectedGroups}
            className={`
                  ${
                    theme == "dark" ? "bg-gray-800 border-gray-400" : "bg-white text-gray-600"
                  }
                  w-full rounded
                `}
          />
        </div>

        {/* Multiple choice toggle */}
        <div className="flex items-center justify-between mb-4">
          <span>Allow multiple answers</span>
          <button
            onClick={() => setAllowMultiple(!allowMultiple)}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              allowMultiple ? "bg-orange-500" : "bg-gray-600"
            }`}
          >
            <motion.div
              layout
              className="w-4 h-4 bg-white rounded-full shadow-md"
              animate={{ x: allowMultiple ? 16 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Submit button */}
        <div className="flex justify-end border-t border-gay-300 pt-3">
          <button
            onClick={handlePollSend}
            className="bg-orange-500 text-white rounded-full p-3"
          >
            <SendHorizonal size={15} />
          </button>
        </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePoll;
