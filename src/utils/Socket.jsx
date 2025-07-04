// utils/Socket.jsx
import { io } from "socket.io-client";

let socket;
let socketInitialized = false;

const SOCKET_URL = "https://webexback-06cc.onrender.com";

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 1,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: false, // Changed to false - we'll manually connect
    });
    socketInitialized = true;
  }
  return socket;
};

export const connectSocketold = (userId) => {
  const s = getSocket();
  if (userId && !s.connected) {
    s.auth = { userId }; // Add user authentication
    s.connect();
    
    // Add connection status handlers (optional)
    if (socketInitialized) {
      s.on('connect', () => {
        console.log('Socket connected');
      });
      
      s.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      socketInitialized = false; // Prevent adding listeners multiple times
    }
  }
};

export const connectSocket = (userId) => {
  const s = getSocket();

  if (userId && !s.connected) {
    s.connect();

    // Only attach once
    if (socketInitialized) {
      s.on("connect", () => {
        console.log("Socket connected");

        // 🔥 Emit user ID to server
        s.emit("user-connected", userId);
      });

      s.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socketInitialized = false;
    }
  }
};


export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

// Only call this when your app unmounts completely
export const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket.off(); // Remove all listeners
    socket = null;
    socketInitialized = false;
  }
};