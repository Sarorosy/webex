import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";
import { BellDot, Circle, CircleMinus } from "lucide-react";

const ProfileSettings = () => {
  const { user, theme, updateNotifications, updateAvailability } = useAuth();
  const [selectedTab, setSelectedTab] = useState("notifications");
  const [notificationSetting, setNotificationSetting] = useState(
    user?.notifications || "all"
  );
  const [saving, setSaving] = useState(false);

  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [availabilityDuration, setAvailabilityDuration] = useState("");

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.post(
        "https://webexback-06cc.onrender.com/api/users/updateusersettings",
        {
          userId: user?.id,
          notifications: notificationSetting,
        }
      );

      if (res.data.status) {
        toast.success("Settings updated successfully");
        updateNotifications(notificationSetting);
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  const handleSaveAvailability = async () => {
    try {
      if (!availabilityStatus) {
        return toast.error("Please select an availability status");
      } else if (availabilityStatus != "available" && !availabilityDuration) {
        return toast.error("Please select an availability duration");
      }
      setSaving(true);

      const now = new Date();
      const availabilityUntil = new Date(now);
      let formattedAvailabilityUntil = "";
      if (availabilityStatus != "available") {
        const durationMap = {
          "30min": 30,
          "1hr": 60,
          "2hr": 120,
          "12hr": 720,
          "7days": 10080, // 7 * 24 * 60
          "14days": 20160,
        };

        const minutesToAdd = durationMap[availabilityDuration];
        if (!minutesToAdd) {
          return toast.error("Invalid duration");
        }

        availabilityUntil.setMinutes(
          availabilityUntil.getMinutes() + minutesToAdd
        );

        const pad = (n) => String(n).padStart(2, "0");
        formattedAvailabilityUntil = `${availabilityUntil.getFullYear()}-${pad(
          availabilityUntil.getMonth() + 1
        )}-${pad(availabilityUntil.getDate())} ${pad(
          availabilityUntil.getHours()
        )}:${pad(availabilityUntil.getMinutes())}:${pad(
          availabilityUntil.getSeconds()
        )}`;
      }

      const response = await fetch(
        "https://webexback-06cc.onrender.com/api/users/updateuseravailability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.id,
            availability_status: availabilityStatus,
            availability_duration:
              availabilityStatus == "available"
                ? null
                : formattedAvailabilityUntil,
          }),
        }
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Updated");
        updateAvailability(availabilityStatus);
      } else {
        toast.error("Failed to update");
      }
    } catch (e) {
      console.log("An error occured", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full min-h-xl py-3 px-2">
      {/* Sidebar */}
      <div
        className={`w-64 ${
          theme == "dark" ? "bg-gray-200 " : "bg-white"
        } rounded-lg shadow p-4 border`}
      >
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full flex items-center text-left px-3 py-1  rounded-md ${
                selectedTab === "notifications"
                  ? "bg-orange-600 text-white"
                  : "hover:bg-gray-200 text-gray-800"
              }`}
              onClick={() => setSelectedTab("notifications")}
            >
              <BellDot size={14} className="mr-2" /> Notifications
            </button>
          </li>
          <li>
            <button
              className={`w-full flex items-center text-left px-3 py-1  rounded-md ${
                selectedTab === "availability"
                  ? "bg-orange-600 text-white"
                  : "hover:bg-gray-200 text-gray-800"
              }`}
              onClick={() => setSelectedTab("availability")}
            >
              <CircleMinus size={14} className="mr-2" /> Availability
            </button>
          </li>
        </ul>
      </div>

      {/* Detail Pane */}
      <div
        className={`flex-1 ml-6 ${
          theme == "dark" ? "bg-gray-200 " : "bg-white"
        } rounded-lg shadow p-6 border`}
      >
        {selectedTab === "notifications" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Notification Settings
            </h3>
            <div className="space-y-3">
              <div className="space-y-4">
                <label className="block">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="notifications"
                      value="all"
                      checked={notificationSetting === "all"}
                      onChange={(e) => setNotificationSetting(e.target.value)}
                      className="form-radio text-orange-600"
                    />
                    <span className="font-medium text-gray-800">
                      All Notifications
                    </span>
                  </div>
                  <div className="ml-7 text-gray-500 f-11">
                    Get notified for all activity including messages, mentions.
                  </div>
                </label>

                <label className="block">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="notifications"
                      value="directand@"
                      checked={notificationSetting === "directand@"}
                      onChange={(e) => setNotificationSetting(e.target.value)}
                      className="form-radio text-orange-600"
                    />
                    <span className="font-medium text-gray-800">
                      Direct and @ Mentions Only
                    </span>
                  </div>
                  <div className="ml-7 text-gray-500 f-11">
                    Only receive notifications for direct messages and when
                    you're specifically mentioned in groups.
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-7">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-2 py-1 rounded-md f-13 hover:bg-gray-600"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {selectedTab === "availability" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              Availability Settings
              {user?.availability  ? (
                <span className="f-11 ml-3 text-gray-700">
                  Current Availability : {user?.availability}
                </span>
              ) : (
                <span className="f-11 ml-3 text-gray-700">
                  Current Availability : available
                </span>
              )}
            </h3>

            <div className="space-y-6">
              {/* Status Selection */}
              <div>
                <h4 className="font-medium mb-2">Select Status</h4>
                <div className="flex items-center space-x-4 f-11">
                  <button
                    type="button"
                    onClick={() => setAvailabilityStatus("available")}
                    className={`flex items-center px-3 py-1 rounded-md text-sm font-medium border ${
                      availabilityStatus === "available"
                        ? "bg-green-100 text-green-600  border-green-600"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <Circle
                      size={14}
                      strokeWidth={3}
                      className="mr-2 text-green-600 font-bold fill-green-600"
                    />
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityStatus("busy")}
                    className={`flex items-center px-3 py-1 rounded-md text-sm font-medium border ${
                      availabilityStatus === "busy"
                        ? "bg-red-100 text-red-600  border-red-600"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <Circle
                      size={14}
                      strokeWidth={3}
                      className="mr-2 text-red-600 font-bold"
                    />
                    Busy
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailabilityStatus("dnd")}
                    className={`flex items-center px-3 py-1 rounded-md text-sm font-medium border ${
                      availabilityStatus === "dnd"
                        ? "bg-red-100 text-red-600  border-red-600"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <CircleMinus
                      size={14}
                      strokeWidth={3}
                      className="mr-2 text-red-600 font-bold"
                    />
                    Do Not Disturb
                  </button>
                </div>
              </div>

              {/* Duration Selection */}
              {availabilityStatus && availabilityStatus != "available" && (
                <div>
                  <h4 className="font-medium mb-2">Duration</h4>
                  <select
                    value={availabilityDuration}
                    onChange={(e) => setAvailabilityDuration(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm"
                  >
                    <option value="">Select Duration</option>
                    <option value="30min">30 minutes</option>
                    <option value="1hr">1 hour</option>
                    <option value="2hr">2 hours</option>
                    <option value="12hr">12 hours</option>
                    <option value="7days">7 days</option>
                    <option value="14days">14 days</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-7">
              <button
                onClick={handleSaveAvailability}
                className="bg-black text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600"
              >
                Save Availability
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
