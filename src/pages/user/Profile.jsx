import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EditProfile from "./EditProfile";
import { useAuth } from "../../utils/idb";
import { Edit, Settings, X } from "lucide-react";
import ProfileSettings from "./ProfileSettings";

const Profile = ({ onClose }) => {
  const { user } = useAuth();
  const { theme } = useAuth();
  const name = user?.name || "John Doe";
  const bio = user?.bio || "Hey There!";
  const email = user?.email || "Guest";
  const pronounces = user?.pronouns || "He/Him";
  const profilePic = user?.profile_pic;
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState("profile");

  console.log(user?.seniority);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-3xl max-h-[90vh] ${
          theme == "dark" ? "bg-gray-200 text-black" : "bg-white"
        } rounded-lg shadow-xl overflow-y-auto `}
      >
        {/* HEADER */}
        <div
          className={`flex justify-between items-center px-4 py-3 bg-orange-500  rounded-t-lg`}
        >
          <h4 className="text-md  flex gap-2">
            <button
              className={`px-2 flex items-center py-1 rounded-lg transition duration-200 
                ${
                  tab === "profile"
                    ? "bg-gray-800 text-white font-semibold"
                    : "bg-gray-100 text-gray-800 font-light hover:bg-gray-200"
                }`}
              onClick={() => setTab("profile")}
            >
              <Edit size={14} className="mr-2" /> Edit Profile
            </button>
            <button
              className={`px-2 flex items-center py-1 rounded-lg transition duration-200 
                ${
                  tab === "settings"
                    ? "bg-gray-800 text-white font-semibold "
                    : "bg-gray-100 text-gray-800 font-light hover:bg-gray-200"
                }`}
              onClick={() => setTab("settings")}
            >
              <Settings size={14} className="mr-2" /> Settings
            </button>
          </h4>

          <button
            onClick={onClose}
            className="text-sm text-black bg-gray-100 hover:text-white hover:bg-gray-900 px-1 py-1 rounded"
          >
            <X size={13} />
          </button>
        </div>
        {tab == "profile" ? (
          <div className="flex items-start justify-center p-4 gap-2 h-lg min-h-lg max-h-lg">
            <div className="flex flex-col w-[400px] border h-full">
              <div className="profile-bg-set"></div>
              <div className="bg-white p-6 pb-4 flex flex-col items-center text-center ">
                <div className="profile-content-set flex flex-col items-center gap-1">
                  {/* Profile Picture */}
                  {profilePic ? (
                    <img
                      src={"https://rapidcollaborate.in/ccp" + profilePic}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border border-gray-300 shadow-md mb-2"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-semibold rounded-full shadow-md mb-4">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Profile Info */}
                  <h2 className="text-xl font-bold text-gray-900">{name} </h2>

                  <p className="text-gray-700 mt-1">{email}</p>
                  {user?.office_name && (
                    <p className="text-gray-600 mt-1">{user?.office_name}</p>
                  )}
                  {user?.city_name && (
                    <p className="text-gray-600 mt-1">{user?.city_name}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full">
              <EditProfile onClose={onClose} />
            </div>
            <AnimatePresence></AnimatePresence>
          </div>
        ) : (
          <div className="flex items-start justify-center p-3 gap-2 h-lg min-h-lg max-h-lg">
            <ProfileSettings />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
