import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";

const AddUser = ({ onClose, after }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        user_panel: "AP",
        max_group_count: 5,
        office_name: "",
        city_name: ""
    });
    const [adding, setAdding] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const incrementGroupCount = () => {
        setFormData((prev) => ({ ...prev, max_group_count: prev.max_group_count + 1 }));
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
            setAdding(true)
            const response = await fetch("http://localhost:5000/api/users/add", {
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
        }finally{
            setAdding(false)
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white p-6 rounded-lg shadow-lg w-[600px]"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Add User</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        className="p-2 border rounded"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="p-2 border rounded"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="p-2 border rounded"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <select
                        name="user_panel"
                        value={formData.user_panel}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    >
                        <option value="SP">Service Panel</option>
                        <option value="AP">Attendance Panel</option>
                    </select>

                    <input
                        type="text"
                        name="office_name"
                        placeholder="Office Name"
                        className="p-2 border rounded"
                        value={formData.office_name}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="city_name"
                        placeholder="City Name"
                        className="p-2 border rounded"
                        value={formData.city_name}
                        onChange={handleChange}
                    />

                    {/* Max Group Count full width row */}
                    <div className="col-span-2 flex items-center justify-between border rounded p-2">
                        <span className="font-medium">Max Group Count</span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={decrementGroupCount}
                                className="p-1 rounded border hover:bg-gray-100"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-6 text-center">{formData.max_group_count}</span>
                            <button
                                type="button"
                                onClick={incrementGroupCount}
                                className="p-1 rounded border hover:bg-gray-100"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={adding}
                        className="col-span-2 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        Add User
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddUser;
