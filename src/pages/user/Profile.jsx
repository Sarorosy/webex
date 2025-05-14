import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import EditProfile from "./EditProfile";
import { useAuth } from "../../utils/idb";

const Profile = () => {
    const user = useAuth();
    const name = user.user.name || "John Doe";
    const bio = user.user.bio || "Hey There!";
    const email = user.user.email || "Guest";
    const pronounces = user.user.pronouns || "He/Him";
    const profilePic = user.user.profile_pic;
    const [editOpen, setEditOpen] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
            <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center w-full max-w-lg border border-gray-200 text-center">
                {/* Profile Picture */}
                {profilePic ? (
                    <img 
                        src={"http://localhost:5000"+ profilePic} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full border border-gray-300 shadow-md mb-4" 
                    />
                ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-semibold rounded-full shadow-md mb-4">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Profile Info */}
                <h2 className="text-xl font-bold text-gray-900">
                    {name} <span className="text-gray-500 text-sm font-normal">{pronounces}</span>
                </h2>
                <p className="text-gray-700 mt-1">{email}</p>
                <p className="text-gray-600 mt-1">{bio}</p>

                
                    <button onClick={()=>{setEditOpen(true)}} className="mt-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-100 transition">
                        Edit Profile
                    </button>
                
            </div>
            <AnimatePresence>
                {editOpen && (
                    <EditProfile  onClose={()=>{setEditOpen(false)}} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
