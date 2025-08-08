import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Trash, Trash2 } from "lucide-react";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";
import ConfirmationModal from '../../components/ConfirmationModal'

const StatusPage = ({ onClose, statuses = [],selectedGroupForStatus }) => {
  const { user } = useAuth();
  const validStatuses = statuses.filter((s) => s?.id !== null && s?.id !== undefined);
const [currentIndex, setCurrentIndex] = useState(0);
const currentStatus = validStatuses[currentIndex];
  console.log(statuses);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? statuses.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === statuses.length - 1 ? 0 : prev + 1));
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const pad = (n) => (n < 10 ? "0" + n : n);
    const formatTime = (d) => {
      let hours = d.getHours();
      const minutes = pad(d.getMinutes());
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    };

    if (isSameDay(date, now)) {
      return `Today at ${formatTime(date)}`;
    } else if (isSameDay(date, yesterday)) {
      return `Yesterday at ${formatTime(date)}`;
    } else {
      return `${pad(date.getDate())}/${pad(
        date.getMonth() + 1
      )}/${date.getFullYear()} at ${formatTime(date)}`;
    }
  };

  const hasImage = currentStatus?.is_file == 1 && currentStatus?.file_name;
  const imageUrl = hasImage
    ? "https://rapidcollaborate.in/ccp" + currentStatus.file_name
    : null;
  const hasText = !!currentStatus?.announcement;

  const formattedCreatedAt = currentStatus?.created_at
    ? formatRelativeDate(currentStatus.created_at)
    : "";

  const [selectedStatusToDelete, setSelectedStatusToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDelete = async (id) => {
    setSelectedStatusToDelete(id);
    setDeleteModalOpen(true);
  };

  const deleteStatus = async () => {
    try {
      const response = await fetch("https://webexback-06cc.onrender.com/api/status/delete/", {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ id: selectedStatusToDelete, group_id : selectedGroupForStatus }),
      });
      const data = await response.json();
      if (data.status) {
        toast.success("deleted");
        setDeleteModalOpen(false);
        onClose();
      } else {
        toast.error(data.message || "Error while deleting");
      }
    } catch (e) {
      console.error("Errror while deleting ", e);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 w-full h-full text-white z-50 flex flex-col ios"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#1e2a33] border-b border-gray-700 ">
        <p className="text-lg font-semibold">Announcement</p>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white text-xl"
        >
          <X />
        </button>
      </div>
      {validStatuses.length > 0 && (
        <div className="w-full flex space-x-1 px-4 py-2 bg-[#1e2a33]">
          {validStatuses.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                index < currentIndex
                  ? "bg-gray-500"
                  : index === currentIndex
                  ? "bg-white"
                  : "bg-gray-700"
              }`}
            ></div>
          ))}
        </div>
      )}

      {/* Status Content */}
      {validStatuses.length > 0 ? (
        <div
          className="flex-1 relative flex items-center justify-center px-4 py-6"
          style={{ backgroundColor: currentStatus?.bgcolor || "#111b21" }}
        >
          {/* Prev Button */}
          {validStatuses.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 p-2 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {formattedCreatedAt && (
            <div className="absolute bottom-4 right-6 text-xs text-gray-300 bg-black/40 px-2 py-1 rounded">
              {formattedCreatedAt}
            </div>
          )}
          {user?.user_type === "admin" && (
            <button
              onClick={() => handleDelete(currentStatus.id)} // use your ID field
              className="absolute top-4 right-6  bg-red-600 text-white p-1 rounded-full flex items-center"
              title="Expire Status"
            >
              Expire <Trash2 size={16} className="ml-2"/>
            </button>
          )}

          {/* Status Layout */}
          <div className="w-full max-w-5xl mx-auto flex items-center justify-center border border-white/20 rounded-lg overflow-hidden shadow-lg bg-black/20 min-h-[400px]">
            {hasImage && hasText && (
              <>
                {/* Image Left */}
                <div className="w-1/2 h-full">
                  <img
                    src={imageUrl}
                    alt="status"
                    className="w-full h-[60vh] object-contain"
                  />
                </div>

                {/* Text Right */}
                <div className="w-1/2 h-full p-4 overflow-y-auto text-sm text-white leading-relaxed">
                  <p className="whitespace-pre-wrap">
                    {currentStatus.announcement}
                  </p>
                </div>
              </>
            )}

            {hasImage && !hasText && (
              <img
                src={imageUrl}
                alt="status"
                className="w-full h-[60vh] object-contain"
              />
            )}

            {!hasImage && hasText && (
              <div className="text-center text-sm px-6 py-4 leading-relaxed max-h-[400px] overflow-y-auto w-full">
                {currentStatus.announcement}
              </div>
            )}
          </div>

          {/* Next Button */}
          {validStatuses.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 p-2 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <div className="text-center mt-10 text-gray-400">
          No statuses available.
        </div>
      )}

      {deleteModalOpen && (
        <ConfirmationModal
        title="Are you want to delete?"
        message="this action cannot be undone"
        onYes={deleteStatus}
        onClose={()=>{setDeleteModalOpen(true)}}
        />
      )}
    </motion.div>
  );
};

export default StatusPage;
