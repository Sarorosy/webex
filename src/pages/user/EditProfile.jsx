import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios"; // Import axios for API calls
import { useAuth } from "../../utils/idb";

const EditProfile = ({ onClose }) => {
    const { user, login } = useAuth(); 
    const [name, setName] = useState(user?.name || "");
    const [pronouns, setPronouns] = useState(user?.pronouns || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [profilePic, setProfilePic] = useState(user && (user.profile_pic) ? "http://localhost:5000" +user.profile_pic : null);
    const [loading, setLoading] = useState(false);

    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        // Validate file type (allow only webp, jpg, jpeg, png)
        const allowedTypes = ["image/webp", "image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Please upload a webp, jpg, jpeg, or png image.");
            return;
        }
    
        setProfilePic(file); // Create blob URL for preview
    };
    
    

    const removeProfilePic = () => setProfilePic(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const formData = new FormData();
            formData.append("id", user.id);
            formData.append("email", user.email);
            formData.append("name", name);
            formData.append("pronouns", pronouns);
            formData.append("bio", bio);
            
            if (profilePic) {
                formData.append("profile_pic", profilePic); // Send as file
            }
    
            const response = await axios.put(`http://localhost:5000/api/users/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            const updatedUser = response.data.updatedUser;
            if (response.data.status) {
                login({
                    ...user,
                    name: updatedUser.name,
                    pronouns: updatedUser.pronouns,
                    bio: updatedUser.bio,
                    profile_pic: updatedUser.profile_pic, // Will be file path
                });
                onClose();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };
    
    

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h2>

                <div className="h-96 overflow-y-scroll">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center mb-4">
                            {profilePic ? (
                                <div className="relative">
                                    <img src={profilePic instanceof File ? URL.createObjectURL(profilePic) : profilePic}  alt="Profile" className="w-24 h-24 rounded-full border border-gray-300 shadow-md object-cover" />
                                    <button onClick={removeProfilePic} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-24 h-24 flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-semibold rounded-full shadow-md mb-2">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <label className="cursor-pointer text-blue-600 hover:underline">
                                        Upload new photo
                                        <input type="file" className="hidden" onChange={handleProfileChange} />
                                    </label>
                                </>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Your full name *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded-md" placeholder="Enter your name" />

                            <label className="block text-sm font-medium text-gray-700">Pronouns</label>
                            <input type="text" value={pronouns} onChange={(e) => setPronouns(e.target.value)} className="w-full border p-2 rounded-md" placeholder="e.g., He/Him" />

                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border p-2 rounded-md" placeholder="Write something about yourself..."></textarea>
                        </div>

                        {/* Save Button */}
                        <button type="submit" className="mt-5 w-full bg-black text-white py-2 rounded-md text-lg">
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default EditProfile;
