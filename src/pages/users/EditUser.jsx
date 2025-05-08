import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";

const EditUser = ({ userId, onClose, after }) => {
    const { login } = useAuth();
    const [fetching, setFetching] = useState(false)
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: "",
        pronouns: "",
        bio: "",
        profilePic: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setFetching(true);
                const response = await fetch(`http://localhost:5000/api/users/user/${userId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
        
                if(data.status){
                    console.log(data.user)
                    setUserData({
                        name: data.user.name,
                        email: data.user.email,
                        password: data.user.password, // Fixed access issue
                        pronouns: data.user.pronouns,
                        bio: data.user.bio,
                        profilePic: data.user.profile_pic ? `http://localhost:5000${data.user.profile_pic}` : null
                    });
        
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setFetching(false);
            }
        };
        
        fetchUserDetails();
    }, [userId]);

    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowedTypes = ["image/webp", "image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Please upload a webp, jpg, jpeg, or png image.");
            return;
        }
        setUserData((prev) => ({ ...prev, profilePic: file }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("id", userId);
            formData.append("email", userData.email);
            formData.append("name", userData.name);
            formData.append("password", userData.password);
            formData.append("pronouns", userData.pronouns);
            formData.append("bio", userData.bio);
            if (userData.profilePic) {
                formData.append("profile_pic", userData.profilePic);
            }
            const response = await axios.put(`http://localhost:5000/api/users/update`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (response.data.status) {
                toast.success("Updated!");
                onClose();
                after()
            }
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit User</h2>
                {fetching ? (
                    <div className="animate-spin border-4 border-gray-300 border-t-blue-500 rounded-full w-8 h-8"></div>
                        ) : (
                        <form onSubmit={handleSubmit} className="h-96 overflow-y-scroll scrollbar-none">
                            <div className="flex flex-col items-center mb-4">
                                {userData.profilePic ? (
                                    <img src={userData.profilePic instanceof File ? URL.createObjectURL(userData.profilePic) : userData.profilePic} alt="Profile" className="w-24 h-24 rounded-full border border-gray-300 shadow-md object-cover" />
                                ) : (
                                    <div className="w-24 h-24 flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-semibold rounded-full shadow-md mb-2">
                                        {userData.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <label className="cursor-pointer text-blue-600 hover:underline">
                                    Upload new photo
                                    <input type="file" className="hidden" onChange={handleProfileChange} />
                                </label>
                            </div>
                            <div className="space-y-3">
                                <input type="text" name="name" value={userData.name} onChange={handleChange} className="w-full border p-2 rounded-md" placeholder="Enter your name" />
                                <input type="email" name="email" value={userData.email} onChange={handleChange} className="w-full border p-2 rounded-md" placeholder="Enter your email" />
                                <input type="text" name="password" value={userData.password} onChange={handleChange} className="w-full border p-2 rounded-md" placeholder="Enter password" />
                                <input type="text" name="pronouns" value={userData.pronouns} onChange={handleChange} className="w-full border p-2 rounded-md" placeholder="Pronouns" />
                                <textarea name="bio" value={userData.bio} onChange={handleChange} className="w-full border p-2 rounded-md" placeholder="Bio"></textarea>
                            </div>
                            <button type="submit" className="mt-5 w-full bg-black text-white py-2 rounded-md text-lg">
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                )}

                    </div>
        </motion.div>
    );
};

export default EditUser;