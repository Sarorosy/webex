import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, SendHorizonal, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

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
  userId,
  type,
}) => {
  const { user } = useAuth();

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

      const pollData = {
        question: question.trim(),
        options: trimmedOptions,
        allowMultiple,
        sender_id: user?.id ?? 1,
        sender_name: user?.name ?? "Puneet",
        profile_pic: user?.profile_pic ?? null,
        to: userId,
        type,
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
        toast.success("Poll created successfully");
        setOptions(["", ""]);
        setQuestion("");
        setAllowMultiple(false);
        setShowEmojiPickerIndex(null);
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
        className="relative  bg-gray-900 text-white w-full max-w-md p-4 rounded-xl shadow-xl ios"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create poll</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Question */}
        <div className="mb-4">
          <label className="font-semibold block mb-1">Question</label>
          <input
            type="text"
            placeholder="Ask question"
            className="w-full bg-transparent border-b border-gray-600 outline-none py-1"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="mb-4 h-44 custom-scrollbar overflow-y-auto">
          <label className="font-semibold block mb-1">Options</label>
          <div className="space-y-2">
            {options.map((opt, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border-b border-orange-500 py-1"
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
                  <Smile size={18} />
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveOption(index, index - 1)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveOption(index, index + 1)}
                    className="text-xs text-gray-400 hover:text-white"
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
        <div className="flex justify-end">
          <button
            onClick={handlePollSend}
            className="bg-orange-500 text-white rounded-full p-3"
          >
            <SendHorizonal />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePoll;
