import React, { useState } from "react";
import { motion } from "framer-motion";
import moment from "moment";
import { useAuth } from "../../utils/idb";
import { X } from "lucide-react";

const options = [
  { label: "1 Hour", value: 1 },
  { label: "2 Hours", value: 2 },
  { label: "4 Hours", value: 4 },
  { label: "8 Hours", value: 8 },
  { label: "12 Hours", value: 12 },
  { label: "24 Hours", value: 24 },
  { label: "custom", value: "custom" },
];

const ScheduleMessageModal = ({
  onClose,
  onSchedule,
  selectedHours,
  setSelectedHours,
  customDate,
  setCustomDate,
  customTime,
  setCustomTime,
}) => {
  const { theme } = useAuth();
  const today = moment().format("YYYY-MM-DD");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`${
          theme == "dark"
            ? "bg-gray-300 text-gray-700"
            : "bg-white text-gray-700"
        }  w-[400px]  rounded-lg`}
      >
        <div className="flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg">
          <h2 className="text-[17px] font-semibold text-white">
            Schedule Message
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium mb-1">
            Deliver after:
          </label>
          <select
            className={`
                  ${
                    theme == "dark"
                      ? "bg-gray-800 border-gray-400 text-gray-300"
                      : ""
                  }
                  w-full p-2 border rounded-md
                `}
            value={selectedHours || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedHours(value === "custom" ? "custom" : Number(value));
            }}
          >
            <option value="" disabled>
              Select time
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {selectedHours == "custom" && (
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className={`${theme == "dark" ? "bg-gray-800 text-white" : "bg-white"} px-1 py-1 rounded`}>
                <label className="block text-sm font-medium ">
                  Date
                </label>
                <input
                  type="date"
                  className={`w-full border border-gray-300 rounded px-3 py-2 ${theme == "dark" ? "bg-gray-800 text-white" : "bg-white accent-slate-100"}`}
                  value={customDate}
                  min={today}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
              <div className={`${theme == "dark" ? "bg-gray-800 text-white" : "bg-white"} px-1 py-1 rounded`}>
                <label className="block text-sm font-medium ">
                  Time
                </label>
                <input
                  type="time"
                  className={`w-full border border-gray-300 rounded px-3 py-2 ${theme == "dark" ? "bg-gray-800 text-white" : "bg-white accent-slate-100"}`}
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {selectedHours && selectedHours != "custom" && (
            <div className="mb-4 text-sm f-11">
              Your message will be delivered at:{" "}
              <strong>
                {moment().add(selectedHours, "hours").format("LLL")}
              </strong>
            </div>
          )}
          {selectedHours &&
            selectedHours === "custom" &&
            customDate &&
            customTime && (
              <div className="mb-4 text-sm f-11">
                Your message will be delivered at:{" "}
                <strong>
                  {moment(
                    `${customDate} ${customTime}`,
                    "YYYY-MM-DD HH:mm"
                  ).format("LLL")}
                </strong>
              </div>
            )}

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={onClose}
              className="f-11 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onSchedule}
              disabled={!selectedHours}
              className="f-11 bg-orange-600 text-white px-2 py-1 rounded-md hover:bg-orange-700 disabled:bg-orange-300 disabled:text-gray-100 disabled:cursor-no-drop"
            >
              Schedule
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleMessageModal;
