import { motion } from "framer-motion";
import { X, Download } from "lucide-react";
import React from "react";

const FileModal = ({ fileUrl, filename,senderName, time, onClose }) => {
  const ext = filename.split(".").pop().toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "avif","svg", "webp"].includes(ext);

  const formattedTime = time ? new Date(time).toLocaleString() : "unknown time";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center text-white"
    >
      <div className="relative w-full h-full  overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {senderName && time && (

          <div>
            Shared by {senderName ?? "Unknown"}<br/>
            At {formattedTime ?? "unknown time"}
          </div>
          )}
          <span className="text-base font-medium truncate">{filename}</span>
          <div className="flex items-center gap-2">
            
            <button
              onClick={onClose}
              className="text-white hover:text-red-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center flex-col gap-5">
          {isImage ? (
            <img
              src={fileUrl}
              alt={filename}
              className="max-h-[80vh] object-contain"
            />
          ) : (
            <div className="text-center text-gray-600 text-sm">
              <p className="mb-2">This file cannot be previewed.</p>
              <p className="text-xs font-medium">{filename}</p>
            </div>
          )}
          <div className="flex justify-end items-end">
            <a
              href={fileUrl}
              target="_blank"
              download={fileUrl}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileModal;
