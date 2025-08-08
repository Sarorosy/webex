import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import {
  Smile,
  Send,
  Palette,
  X,
  ImagePlus,
  ImageOff,
  Users,
} from "lucide-react";
import { useAuth } from "../../utils/idb";
import Select from "react-select";
import toast from "react-hot-toast";
const COLORS = [
  "#1e1e1e",
  "#075E54",
  "#128C7E",
  "#25D366",
  "#ECE5DD",
  "#FFC107",
  "#FF5722",
  "#9C27B0",
  "#2196F3",
  "#FF9800",
];

const AddStatus = ({ onClose, cloneData = null, finalFunction }) => {
  const [status, setStatus] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [bgColor, setBgColor] = useState("#075E54");
  const [image, setImage] = useState(null);
  const [isFile, setIsFile] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [selectedGroups, setSelectedGroups] = useState([]);
  const { user } = useAuth();

  const emojiRef = useRef(null);
  const colorRef = useRef(null);

  const [groups, setGroups] = useState([]);

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
    const loadCloneData = async () => {
      if (cloneData) {
        setStatus(cloneData.announcement || "");
        setBgColor(cloneData.bgcolor || "#075E54");
        setIsFile(cloneData.is_file == 1);

        if (cloneData.is_file && cloneData.file_name) {
          const fullImageUrl =
            "https://rapidcollaborate.in/ccp" + cloneData.file_name;
          setImage(fullImageUrl); // preview only

          try {
            const proxyUrl = `https://webexback-06cc.onrender.com/api/status/proxy-image?url=${encodeURIComponent(
              fullImageUrl
            )}`;
            const response = await fetch(proxyUrl);
            const blob = await response.blob();
            const fileName =
              cloneData.file_name.split("/").pop() || "clone.png";
            const file = new File([blob], fileName, { type: blob.type });
            setImageFile(file);
          } catch (err) {
            console.error("Failed to load image blob for cloning:", err);
          }
        }

        setSelectedGroups([]);
      }
    };

    loadCloneData();
  }, [cloneData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
      if (colorRef.current && !colorRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupOptions = groups.map((group) => ({
    value: group.group_id,
    label: group.group_name,
  }));

  const handleEmojiClick = (emojiData) => {
    setStatus((prev) => prev + emojiData.emoji);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
      setIsFile(true);
    }
  };

  const handleSend = async () => {
    if (!status.trim()) {
      toast.error("Cant add empty status");
      return;
    }

    if (selectedGroups.length == 0) {
      toast.error("Please select at least one group");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("sender_id", user?.id);
      formData.append("sender_name", user?.name);
      formData.append("profile_pic", user?.profile_pic);
      formData.append(
        "group_id",
        selectedGroups.map((group) => group.value)
      );
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
        finalFunction();
      } else {
        toast.error(data.message || "Failed to add");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }
    setImage(null);
    setImageFile(null);
    setIsFile(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed inset-0 z-[999] flex flex-col ios"
    >
      <div
        className="flex-1 relative overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <h1 className="text-white font-semibold text-lg">
              Add Announcement
            </h1>

            <div className="flex items-center gap-2">
              {isFile ? (
                <button
                  onClick={removeImage}
                  className="text-red-400 hover:bg-red-500/20 p-2 rounded-full transition-colors"
                >
                  <ImageOff size={20} />
                </button>
              ) : (
                <label className="text-white hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors">
                  <ImagePlus size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}

              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <Smile size={20} />
              </button>

              <div className="relative" ref={colorRef}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <Palette size={20} />
                </button>

                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-sm rounded-lg p-4 w-64"
                  >
                    <div className="grid grid-cols-5 gap-3">
                      {COLORS.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setBgColor(color);
                            setShowColorPicker(false);
                          }}
                          className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                            bgColor === color
                              ? "border-white"
                              : "border-white/40"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pt-20 pb-32 px-4 h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto">
              <div
                className={`flex ${isFile ? "gap-6" : ""} h-full items-center`}
              >
                {/* Image Preview */}
                {isFile && image && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-1/2 max-w-md"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <img
                        src={image}
                        alt="Status preview"
                        className="w-full h-80 object-cover rounded-xl"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Text Input */}
                <div
                  className={`${
                    isFile ? "w-1/2" : "w-full"
                  } flex flex-col justify-center`}
                >
                  <textarea
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-transparent text-white text-3xl md:text-4xl lg:text-5xl font-light text-center placeholder:text-white/50 outline-none resize-none leading-relaxed"
                    rows={isFile ? 8 : 10}
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-white/70" />
                  <span className="text-white/70 text-sm font-medium">
                    Share with groups
                  </span>
                </div>
                <Select
                  options={groupOptions}
                  value={selectedGroups}
                  onChange={setSelectedGroups}
                  placeholder="Select groups..."
                  isMulti
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPlacement="top"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!status.trim() || selectedGroups.length === 0}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-full p-4 transition-colors shadow-lg"
              >
                <Send size={24} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-40 right-4 z-50"
            ref={emojiRef}
          >
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <EmojiPicker
                theme="dark"
                onEmojiClick={handleEmojiClick}
                width={350}
                height={400}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AddStatus;
