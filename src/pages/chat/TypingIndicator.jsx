import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 p-2 rounded-lg bg-gray-100 w-10 ml-2 mb-2">
      <div className="w-1 h-1 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
      <div className="w-1 h-1 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
      <div className="w-1 h-1 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
    </div>
  );
};

export default TypingIndicator;