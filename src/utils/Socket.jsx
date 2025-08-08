// utils/Socket.jsx
import { io } from "socket.io-client";

const SOCKET_URL = "https://webexback-06cc.onrender.com"; // Change to your production URL

let socket;
let listenersAttached = false;
let reconnectListeners = [];
let isFirstConnect = true;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity, // Try forever
      reconnectionDelay: 3000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: false, // Connect manually
    });
  }
  return socket;
};

// Subscribe to reconnect events
export const subscribeToSocketReconnect = (callback) => {
  if (typeof callback === "function") {
    reconnectListeners.push(callback);
  }
};

// Connect and authenticate socket
export const connectSocket = (userId) => {
  const s = getSocket();

  if (!userId) return;

  if (!s.connected) {
    s.auth = { userId }; // Send user ID to server
    s.connect();
  }

  if (!listenersAttached) {
    s.on("connect", () => {
      console.log("✅ Socket connected");
      s.emit("user-connected", userId);

      // 🔁 Trigger reconnect subscribers
      if (!isFirstConnect) {
        // Only call reconnect callbacks on RECONNECT
        reconnectListeners.forEach((cb) => cb());
      } else {
        console.log("🌱 Initial connect - skipping sync");
        isFirstConnect = false;
      }
    });

    s.on("disconnect", () => {
      console.warn("⚠️ Socket disconnected");
    });

    s.on("reconnect", (attempt) => {
      console.log(`🔁 Reconnected after ${attempt} attempts`);
    });

    s.on("reconnect_error", (err) => {
      console.error("❌ Socket failed to reconnect:", err);
    });

    listenersAttached = true;
  }
};

// Manually disconnect the socket (e.g., on logout)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listenersAttached = false;
    reconnectListeners = [];
  }
};

// Optional: completely destroy the socket instance
export const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket.off(); // Remove all listeners
    socket = null;
    listenersAttached = false;
    reconnectListeners = [];
    isFirstConnect = true;
  }
};
