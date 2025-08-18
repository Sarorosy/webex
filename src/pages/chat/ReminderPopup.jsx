import { useEffect, useState } from "react";
import { getSocket, connectSocket } from "../../utils/Socket";
import { motion, AnimatePresence } from "framer-motion";
import bell from "../../assets/bell.png";
import { useAuth } from "../../utils/idb";
import { X } from "lucide-react"; // Requires lucide-react installed

const ReminderPopup = () => {
  const [reminder, setReminder] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    connectSocket(user.id);

    const handleReminder = (data) => {
      console.log("📣 Reminder Received:", data);

      if (data?.reminder?.user_id === user.id) {
        setReminder(data.reminder);
      }
    };

    socket.on("reminder", handleReminder);

    return () => {
      socket.off("reminder", handleReminder);
    };
  }, [user?.id]);

  const handleClose = () => setReminder(null);

  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-6 right-6 bg-white shadow-2xl rounded-2xl w-[380px] z-[1000] border border-gray-200 overflow-hidden"
        >
          <div className="bg-orange-600 text-white flex justify-between items-center px-4 py-3">
            <div className="flex items-center gap-2">
              <img src={bell} alt="Bell" className="w-5 h-5" />
              <h3 className="font-semibold text-[17px]">Reminder Alert</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-gray-700 text-sm">
              <strong>Message: </strong>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: reminder.message }}
              ></div>
            </p>
            <div className="text-sm text-gray-700">
              <p>
                <strong>Time:</strong>{" "}
                {new Date(reminder.time).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReminderPopup;
