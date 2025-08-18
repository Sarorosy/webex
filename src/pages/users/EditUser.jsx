import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";
import { X } from "lucide-react";

const EditUser = ({ userId, onClose, after }) => {
  const { login, theme } = useAuth();
  const [fetching, setFetching] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    pronouns: "",
    bio: "",
    office_name: "",
    city_name: "",
    profilePic: null,
    user_panel: "AP",
    seniority: "junior",
    max_group_count: 5,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setFetching(true);
        const response = await fetch(
          `https://webexback-06cc.onrender.com/api/users/user/${userId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status) {
          console.log(data.user);
          setUserData({
            name: data.user.name,
            email: data.user.email,
            pronouns: data.user.pronouns,
            bio: data.user.bio,
            user_panel: data.user.user_panel || "AP",
            seniority: data.user.seniority || "junior",
            max_group_count: data.user.max_group_count || 5,
            office_name: data.user.office_name || "",
            city_name: data.user.city_name || "",
            profilePic: data.user.profile_pic
              ? data.user.profile_pic.startsWith("http")
                ? data.user.profile_pic
                : `https://rapidcollaborate.in/ccp${data.user.profile_pic}`
              : null,
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
      alert(
        "Invalid file type. Please upload a webp, jpg, jpeg, or png image."
      );
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
      formData.append("user_panel", userData.user_panel);
      formData.append("seniority", userData.seniority);
      formData.append("max_group_count", userData.max_group_count);
      formData.append("office_name", userData.office_name);
      formData.append("city_name", userData.city_name);

      if (userData.profilePic) {
        formData.append("profile_pic", userData.profilePic);
      }
      const response = await axios.put(
        `https://webexback-06cc.onrender.com/api/users/update`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.status) {
        toast.success("Updated!");
        onClose();
        after();
      }
    } catch (error) {
      console.error("Error updating user:", error);
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
      <div
        className={`${
          theme == "dark"
            ? "bg-gray-300 text-gray-700"
            : "bg-white text-gray-700"
        }  rounded-lg w-full max-w-lg`}
      >
        <div className="flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg">
          <h2 className="text-lg font-semibold text-white">Edit User</h2>
          <div>
            <button
              className="hover:bg-gray-100 text-white hover:text-black py-1 px-1 rounded"
              onClick={onClose} // Close modal without doing anything
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {fetching ? (
          <div className="flex justify-center">
            <div className="animate-spin border-4 border-gray-300 border-t-blue-500 rounded-full w-10 h-10 m-4 flex justify-center text-center"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="scrollbar-none p-4">
            <div className="flex justify-start gap-2 items-center mb-4">
              {userData.profilePic ? (
                <img
                  src={
                    userData.profilePic instanceof File
                      ? URL.createObjectURL(userData.profilePic)
                      : userData.profilePic
                  }
                  alt="Profile"
                  className="w-20 h-20 rounded-full border border-gray-300 shadow-md object-cover"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-semibold rounded-full shadow-md mb-2">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="cursor-pointer text-white rounded p-2 py-1 bg-orange-500 hover:bg-orange-600">
                Upload new photo
                <input
                  type="file"
                  className="hidden"
                  onChange={handleProfileChange}
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                className={`
                                ${
                                  theme == "dark"
                                    ? "bg-gray-800 border-gray-400 text-gray-300"
                                    : ""
                                }
                                w-full border p-2 py-1 rounded-md
                            `}
                placeholder="Enter your name"
              />
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className={`
                                ${
                                  theme == "dark"
                                    ? "bg-gray-800 border-gray-400 text-gray-300"
                                    : ""
                                }
                                w-full border p-2 py-1 rounded-md
                            `}
                placeholder="Enter your email"
              />

              <input
                type="text"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className={`
                                ${
                                  theme == "dark"
                                    ? "bg-gray-800 border-gray-400 text-gray-300"
                                    : ""
                                }
                                w-full border p-2 py-1 rounded-md
                            `}
                placeholder="Enter password"
              />
              {/* <input type="text" name="pronouns" value={userData.pronouns} onChange={handleChange} className="w-full border p-2 py-1 rounded-md" placeholder="Pronouns" /> */}

              <input
                type="text"
                name="office_name"
                value={userData.office_name}
                onChange={handleChange}
                className={`
                                ${
                                  theme == "dark"
                                    ? "bg-gray-800 border-gray-400 text-gray-300"
                                    : ""
                                }
                                w-full border p-2 py-1 rounded-md
                            `}
                placeholder="Office Name"
              />
              <input
                type="text"
                name="city_name"
                value={userData.city_name}
                onChange={handleChange}
                className={`
                                ${
                                  theme == "dark"
                                    ? "bg-gray-800 border-gray-400 text-gray-300"
                                    : ""
                                }
                                w-full border p-2 py-1 rounded-md
                            `}
                placeholder="City Name"
              />

              {/* <textarea name="bio" value={userData.bio} onChange={handleChange} className="col-span-1 md:col-span-2 border p-2 py-1 rounded-md" placeholder="Bio"></textarea> */}
              <div className="flex flex-col">
                <label className="f-13 mb-1">Panel:</label>
                <select
                  name="user_panel"
                  value={userData.user_panel}
                  onChange={handleChange}
                  className={`
                                        ${
                                          theme == "dark"
                                            ? "bg-gray-800 border-gray-400 text-gray-300"
                                            : ""
                                        }
                                        w-full border p-2 py-1 rounded-md
                                    `}
                >
                  <option value="AP">Attendance Panel</option>
                  <option value="SP">Service Panel</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="f-13 mb-1">Seniority:</label>
                <select
                  name="seniority"
                  value={userData.seniority}
                  onChange={handleChange}
                  className={`
                                        ${
                                          theme == "dark"
                                            ? "bg-gray-800 border-gray-400 text-gray-300"
                                            : ""
                                        }
                                        w-full border p-2 py-1 rounded-md
                                    `}
                >
                  <option value="junior">Associate</option>
                  <option value="senior">Sr. Associate</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium">Max Group Count:</label>
                <div className="flex gap-3 items-center ">
                  <button
                    type="button"
                    onClick={() =>
                      setUserData((prev) => ({
                        ...prev,
                        max_group_count: Math.max(1, prev.max_group_count - 1),
                      }))
                    }
                    className={`
                                            ${
                                              theme == "dark"
                                                ? "bg-gray-800 hover:bg-gray-700 text-gray-50"
                                                : "bg-gray-200 hover:bg-gray-300"
                                            }
                                            px-2 py-1 rounded 
                                        `}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">
                    {userData.max_group_count}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setUserData((prev) => ({
                        ...prev,
                        max_group_count: prev.max_group_count + 1,
                      }))
                    }
                    className={`
                                            ${
                                              theme == "dark"
                                                ? "bg-gray-800 hover:bg-gray-700 text-gray-50"
                                                : "bg-gray-200 hover:bg-gray-300"
                                            }
                                                px-2 py-1 bg-gray-200 rounded hover:bg-gray-300
                                            `}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="mt-5 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded f-13"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default EditUser;
