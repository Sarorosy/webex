import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const IncomingCall = ({ callData, onAccept, onDecline }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    onAccept(callData);
  };

  if (!callData) return null;

  const profileImage = callData.callerProfile
    ? `https://rapidcollaborate.in/ccp${callData.callerProfile}`
    : null;

  return (
    <>
      {!accepted ? (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-50"
        >
          <div className="flex items-center gap-4">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Caller"
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl">
                {callData.callerName.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold">{callData.callerName}</p>
              <p className="text-sm text-gray-500">Incoming Call...</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="bg-green-500 text-white px-4 py-1 rounded"
              onClick={handleAccept}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white px-4 py-1 rounded"
              onClick={onDecline}
            >
              Decline
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-white text-2xl">Connecting to {callData.callerName}...</div>
        </div>
      )}
    </>
  );
};

export default IncomingCall;
