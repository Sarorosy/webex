import React, { useState } from "react";
import { motion } from "framer-motion";
import moment from "moment";

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

  const today = moment().format("YYYY-MM-DD");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
      >
        <h2 className="text-lg font-semibold mb-4">Schedule Message</h2>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Deliver after:
        </label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          value={selectedHours || ""}
          onChange={(e) => setSelectedHours(e.target.value)}
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={customDate}
                 min={today}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded px-3 py-2"
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

        {selectedHours && selectedHours === "custom" && customDate && customTime && (
          <div className="mb-4 text-sm f-11">
            Your message will be delivered at:{" "}
            <strong>
              {moment(`${customDate} ${customTime}`, "YYYY-MM-DD HH:mm").format(
                "LLL"
              )}
            </strong>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="f-11 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSchedule}
            disabled={
              !selectedHours ||
              (selectedHours === "custom" && (!customDate || !customTime))
            }
            className="f-11 px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm disabled:bg-gray-400"
          >
            Schedule
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleMessageModal;
