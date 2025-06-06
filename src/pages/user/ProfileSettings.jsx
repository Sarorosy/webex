import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";
import { BellDot } from "lucide-react";

const ProfileSettings = () => {
  const { user, theme, updateNotifications } = useAuth();
  const [selectedTab, setSelectedTab] = useState("notifications");
  const [notificationSetting, setNotificationSetting] = useState(
    user?.notifications || "all"
  );
  const [saving, setSaving] = useState(false);

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
          {/* Add more tabs like Profile, Privacy, etc. here */}
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
      </div>
    </div>
  );
};

export default ProfileSettings;
