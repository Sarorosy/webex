import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const AddUser = ({ onClose, after }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_panel: "AP",
    max_group_count: 1000,
    office_name: "",
    city_name: "",
    seniority :'junior'
  });
  const [adding, setAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const incrementGroupCount = () => {
    setFormData((prev) => ({
      ...prev,
      max_group_count: prev.max_group_count + 1,
    }));
  };

  const decrementGroupCount = () => {
    setFormData((prev) => ({
      ...prev,
      max_group_count: Math.max(1, prev.max_group_count - 1),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;
    if (!name || !email || !password) {
      toast.error("Name, email, and password are required");
      return;
    }
    try {
      setAdding(true);
      const response = await fetch("https://webexback-06cc.onrender.com/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status) {
        toast.success("User added");
        onClose();
        after();
      } else {
        toast.error(data.message || "Failed to add user");
      }
    } catch (error) {
      toast.error("Error adding user");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-lg shadow-lg w-[600px]"
      >
        <div className="flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg">
          <h2 className="text-lg font-semibold text-white">Add User</h2>
          <div>
            <button
              className="hover:bg-gray-100 text-white hover:text-black py-1 px-2 rounded"
              onClick={onClose} // Close modal without doing anything
            >
              <X size={15} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="p-2 border rounded py-1"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="p-2 border rounded py-1"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="p-2 border rounded py-1 w-full"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <select
            name="user_panel"
            value={formData.user_panel}
            onChange={handleChange}
            className="p-2 border rounded py-1"
          >
            <option value="SP">Service Panel</option>
            <option value="AP">Attendance Panel</option>
          </select>
          <select
            name="seniority"
            value={formData.seniority}
            onChange={handleChange}
            className="p-2 border rounded py-1"
          >
            <option value="junior">Associate</option>
            <option value="senior">Sr. Associate</option>
          </select>

          <input
            type="text"
            name="office_name"
            placeholder="Office Name"
            className="p-2 border rounded py-1"
            value={formData.office_name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="city_name"
            placeholder="City Name"
            className="p-2 border rounded py-1"
            value={formData.city_name}
            onChange={handleChange}
          />

          {/* Max Group Count full width row */}
          <div className=" flex items-center justify-between border rounded p-2 py-1">
            <span className="text-gray-700">Max Group Count</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={decrementGroupCount}
                className="p-1  rounded border hover:bg-gray-100"
              >
                <Minus size={13} />
              </button>
              <span className="w-6 text-center">
                {formData.max_group_count}
              </span>
              <button
                type="button"
                onClick={incrementGroupCount}
                className="p-1  rounded border hover:bg-gray-100"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div className="flex justify-end items-end">
            <button
              type="submit"
              disabled={adding}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 f-11"
            >
              Add User
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddUser;
