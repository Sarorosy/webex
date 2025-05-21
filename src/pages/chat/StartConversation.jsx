import React from 'react';
import messaging from '../../assets/Messaging.gif'; // Adjust the path as necessary

const StartConversation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <img
        src={messaging} // Replace with your actual image path
        alt="Start a conversation"
        className="w-48 h-48 mb-1 opacity-80"
      />
      <h2 className="text-xl font-semibold text-gray-700 f-11">
        Select a conversation or start a new one
      </h2>
    </div>
  );
};

export default StartConversation;
