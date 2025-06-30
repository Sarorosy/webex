import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../../utils/idb";
import AddStatus from "./AddStatus";

const statuses = [
  {
    name: "PS.G.Dhanush.B.Sc.,",
    time: "Today at 1:15 pm",
    image: "/images/img1.jpg",
  },
  {
    name: "Sunil Catering ❤️",
    time: "Today at 9:35 am",
    image: "/images/img2.jpg",
  },
  {
    name: "Dhiyash Clg",
    time: "Today at 8:18 am",
    image: "/images/img3.jpg",
  },
  {
    name: "Dhanush❤️",
    time: "Today at 7:17 am",
    image: "/images/img4.jpg",
  },
  {
    name: "Priya Clg",
    time: "Today at 6:04 am",
    image: "/images/img5.jpg",
  },
  {
    name: "Psycho Anbu🤫❣️",
    time: "Yesterday at 6:53 pm",
    image: "/images/img6.jpg",
  },
];

const StatusItem = ({ image, name, time }) => (
  <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 rounded-md cursor-pointer">
    <div className="w-12 h-12 rounded-full border-2 border-green-500 p-[2px]">
      <img
        src={image}
        alt={name}
        className="w-full h-full rounded-full object-cover"
      />
    </div>
    <div>
      <p className="text-sm font-medium text-white">{name}</p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  </div>
);

const StatusPage = ({ onClose }) => {
  const { user } = useAuth();
const [addOpen, setAddOpen] = useState(false)

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 w-[350px] h-full bg-[#111b21] text-white shadow-lg z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <p className="text-lg font-semibold">Status</p>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white text-xl"
        >
          <X />
        </button>
      </div>

      {/* My Status */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={()=>{setAddOpen(true)}}>
          <div className="w-10 h-10 rounded-full relative" >
            {user?.profile_pic ? (
              <img
                src={"https://rapidcollaborate.in/ccp" + user?.profile_pic}
                alt="My Status"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full object-cover bg-orange-600 text-white">
                {user?.name.charAt(0)}
                </div>
            )}
            <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs font-bold">
              +
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">My status</p>
            <p className="text-xs text-gray-400">Click to add status update</p>
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="mt-3 px-4 text-xs text-gray-400 uppercase">Recent</div>
      <div className="mt-1 space-y-1 pb-4">
        {statuses.map((status, idx) => (
          <StatusItem key={idx} {...status} />
        ))}
      </div>

      <AnimatePresence>
        {addOpen && (
            <AddStatus onClose={()=>{setAddOpen(false)}}/>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StatusPage;
