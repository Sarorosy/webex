import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { Smile, Send, Palette, X } from 'lucide-react';

const COLORS = ['#1e1e1e', '#075E54', '#128C7E', '#25D366', '#ECE5DD', '#FFC107', '#FF5722'];

const AddStatus = ({ onClose }) => {
  const [status, setStatus] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [bgColor, setBgColor] = useState('#075E54');

  const emojiRef = useRef(null);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmoji]);

  const handleEmojiClick = (emojiData) => {
    setStatus((prev) => prev + emojiData.emoji);
  };

  const handleSend = () => {
    if (status.trim()) {
      console.log('Sending status:', status);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed inset-0 z-50"
    >
      <div className="w-full h-full relative" style={{ backgroundColor: bgColor }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white text-2xl z-20"
        >
          <X />
        </button>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
          <button onClick={() => setShowEmoji((prev) => !prev)} className="text-white">
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
          <div
            className="absolute bottom-24 right-4 z-30"
            ref={emojiRef}
          >
            <EmojiPicker theme="dark" onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* Status Input */}
        <div className="flex items-center justify-center h-full px-4 ios">
          <textarea
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Type a status"
            className="text-center text-white text-3xl w-full h-2/3 bg-transparent outline-none resize-none placeholder:text-gray-400"
          />
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
