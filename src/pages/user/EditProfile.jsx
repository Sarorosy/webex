import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios"; // Import axios for API calls
import { useAuth } from "../../utils/idb";

const EditProfile = ({ onClose }) => {
  const { user, login, theme } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [pronouns, setPronouns] = useState(user?.pronouns || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePic, setProfilePic] = useState(
  user && user.profile_pic
    ? user.profile_pic.startsWith("http")
      ? user.profile_pic
      : `https://rapidcollaborate.in/ccp${user.profile_pic}`
    : null
);

  const [loading, setLoading] = useState(false);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (allow only webp, jpg, jpeg, png)
    const allowedTypes = ["image/webp", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Invalid file type. Please upload a webp, jpg, jpeg, or png image."
      );
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
      formData.append("password", password);
      formData.append("bio", bio);

      if (profilePic) {
        formData.append("profile_pic", profilePic); // Send as file
      } else {
        formData.append("delete_profile_pic", "yes"); // Send as file
      }

      const response = await axios.put(
        `https://webexback-06cc.onrender.com/api/users/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = response.data.updatedUser;
      if (response.data.status) {
        login({
          ...user,
          name: updatedUser.name,
          password: updatedUser.password,
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
    <div className={` rounded-lg p-3 w-full relative ${theme == "dark" ? "bg-gray-300" : "bg-gray-100"} `}>
      <div className="">
        <form onSubmit={handleSubmit}>
          <label className={`block text-sm font-medium ${theme == "dark" ? "text-black" : "text-gray-700"}  mb-4`}>
            Profile Picture
          </label>
          <div className="flex flex-col items-start mb-4">
            <div className="flex gap-3">
              <div className="relative w-24 h-24">
                {profilePic ? (
                  <img
                    src={
                      profilePic instanceof File
                        ? URL.createObjectURL(profilePic)
                        : profilePic
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full border border-gray-300 shadow-md object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-semibold rounded-full shadow-md">
                    {name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 justify-center f-11">
                {profilePic && (
                  <button
                    onClick={removeProfilePic}
                    className="bg-red-500 text-white rounded px-2 py-1 flex items-center justify-center"
                  >
                    Delete Picture
                  </button>
                )}
                <label className="bg-gray-500 text-white rounded px-2 py-1 flex items-center justify-center cursor-pointer">
                  Upload new
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleProfileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className=" flex items-center gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`
                    ${
                        theme == "dark" ? "bg-gray-800 border-gray-400 text-gray-300" : ""
                    }
                    w-full border py-1 px-2 rounded-md
                `}
                placeholder="Enter your name"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`
                    ${
                        theme == "dark" ? "bg-gray-800 border-gray-400 text-gray-300" : ""
                    }
                    w-full border py-1 px-2 rounded-md
                `}
                placeholder="Enter password"
              />
            </div>

            {/* <div className="flex gap-3"> */}

            {/* <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pronouns
                  </label>
                  <input
                    type="text"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="w-full border p-2 rounded-md"
                    placeholder="e.g., He/Him"
                  />
                </div> */}
            {/* </div> */}

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border p-2 rounded-md"
                placeholder="Write something about yourself..."
              ></textarea>
            </div> */}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {/* Save Button */}
            <button
              onClick={handleSubmit}
              className="bg-green-700 text-white px-2 py-1 rounded-md f-13 hover:bg-green-800"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
