import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, X } from "lucide-react"; // Add X icon
import toast from "react-hot-toast";
import { useAuth } from "../utils/idb";
import { FadeLoader, ScaleLoader } from "react-spinners";

const Dashboard = () => {
  
  return (
    <div className="bg-gray-100 min-h-screen py-4 flex items-start justify-center space-x-2 px-1">
      <h2>This is dashboard</h2>
    </div>
  );
};

export default Dashboard;
