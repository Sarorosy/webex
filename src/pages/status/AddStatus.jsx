import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import { Smile, Send, Palette, X, ImagePlus, ImageOff } from "lucide-react";
import { useSelectedUser } from "../../utils/SelectedUserContext";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

const COLORS = [
  "#1e1e1e",
  "#075E54",
  "#128C7E",
  "#25D366",
  "#ECE5DD",
  "#FFC107",
  "#FF5722",
];

const AddStatus = ({ onClose }) => {
  const [status, setStatus] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [bgColor, setBgColor] = useState("#075E54");
  const [image, setImage] = useState(null);
  const [isFile, setIsFile] = useState(false);
  const [imageFile, setImageFile] = useState(null); // real file
  const { user } = useAuth();

  const { selectedGroupForStatus, setSelectedGroupForStatus } =
    useSelectedUser();
  const emojiRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);

  const handleEmojiClick = (emojiData) => {
    setStatus((prev) => prev + emojiData.emoji);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file); // store the file object for backend
      setImage(URL.createObjectURL(file)); // preview only
      setIsFile(true);
    }
  };

  const handleSend = async () => {
    if (!status.trim()) {
      toast.error("Cant add empty status");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("sender_id", user?.id);
      formData.append("sender_name", user?.name);
      formData.append("profile_pic", user?.profile_pic);
      formData.append("group_id", selectedGroupForStatus);
      formData.append("is_file", isFile ? 1 : 0);
      if (isFile && imageFile) {
        formData.append("file", imageFile); // Correct field name for multer
      }
      formData.append("announcement", status);
      formData.append("bgcolor", bgColor);

      const response = await fetch("https://webexback-06cc.onrender.com/api/status/add", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.status) {
        toast.success("Added");
        onClose();
      } else {
        toast.error(data.message || "Failed to add");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed inset-0 z-[999]"
    >
      <div
        className="w-full h-full relative z-[99999]"
        style={{ backgroundColor: bgColor }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white text-2xl"
        >
          <X />
        </button>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          {isFile ? (
            <button
              onClick={() => {
                URL.revokeObjectURL(image); // free memory
                setImage(null);
                setImageFile(null);
                setIsFile(false);
              }}
              className=" text-red-600 rounded-full transition"
            >
              <ImageOff size={24} />
            </button>
          ) : (
            <label className="text-white cursor-pointer">
              <ImagePlus />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}

          <button
            onClick={() => setShowEmoji((prev) => !prev)}
            className="text-white"
          >
            <Smile />
          </button>

          <div className="relative group">
            <button className="text-white">
              <Palette />
            </button>
            <div className="absolute top-8 right-0 flex gap-2 p-2 bg-black/70 rounded-md opacity-0 group-hover:opacity-100 transition">
              {COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setBgColor(color)}
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="absolute bottom-24 right-4" ref={emojiRef}>
            <EmojiPicker theme="dark" onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex items-center justify-center h-full px-4 ios gap-4">
          {isFile && image && (
            <div className="w-1/2 h-[60vh]">
              <img
                src={image}
                alt="Selected"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
          )}

          <div className={`${isFile ? "w-1/2" : "w-full"}`}>
            <textarea
              value={status}
              rows={10}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Type a status"
              className="text-white text-3xl w-full h-full bg-transparent outline-none resize-none placeholder:text-gray-400 text-center"
            />
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center"
        >
          <Send />
        </button>
      </div>
    </motion.div>
  );
};

export default AddStatus;
