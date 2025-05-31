import { useState } from "react";
import { AnimatePresence ,motion} from "framer-motion";
import EditProfile from "./EditProfile";
import { useAuth } from "../../utils/idb";
import { X } from "lucide-react";

const Profile = ({ onClose }) => {
  const {user} = useAuth();
  const {theme} = useAuth();
  const name = user?.name || "John Doe";
  const bio = user?.bio || "Hey There!";
  const email = user?.email || "Guest";
  const pronounces = user?.pronouns || "He/Him";
  const profilePic = user?.profile_pic;
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className={`relative w-full max-w-3xl max-h-[90vh] ${theme == "dark" ? "bg-gray-500 text-black" : "bg-white"} rounded shadow-xl overflow-y-auto `}
  >
      {/* HEADER */}
      <div className={`flex items-center justify-between mb-2 px-4 py-3 bg-gray-300  sticky top-0 z-50`}>
        <h4 className="text-lg font-semibold">Edit Profile</h4>
        <button onClick={onClose} className="text-sm text-white bg-orange-600 px-1 py-1 rounded">
        <X  size={13} />
        </button>
      </div>
      <div className="flex items-start justify-center p-3 gap-2 h-full">
        <div className="flex flex-col w-[400px] border h-full">
          <div className="profile-bg-set"></div>
          <div className="bg-white p-8 flex flex-col items-center text-center ">
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
              <h2 className="text-xl font-bold text-gray-900">
                {name}{" "}
               
              </h2>
              
              <p className="text-gray-700 mt-1">{email}</p>
              {user?.office_name && <p className="text-gray-600 mt-1">{user?.office_name}</p>}
              {user?.city_name && <p className="text-gray-600 mt-1">{user?.city_name}</p>}
            </div>
          </div>
        </div>
        <div className="w-full">
          <EditProfile
            onClose={onClose}
          />
        </div>
        <AnimatePresence></AnimatePresence>
      </div>
      </motion.div>
    </div>
  );
};

export default Profile;
