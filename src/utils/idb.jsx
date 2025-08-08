import { createContext, useContext, useState, useEffect } from "react";
import { set, get, del } from "idb-keyval"; // Import IndexedDB helper

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await get("User");
      const storedTheme = localStorage.getItem("Theme");
      if (storedUser) {
        setUser(storedUser);
      }
      if (storedTheme) setTheme(storedTheme);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (userData) => {
    const loginDate = new Date().toISOString();
    const updatedUserData = {
      ...userData,
      login_date: loginDate,
    };

    setUser(updatedUserData);
    await set("User", updatedUserData);
  };

  const logout = async () => {
    setUser(null);
    await del("User");
  };

  const setFavourites = async (favourites) => {
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        favMenus: favourites,
      };
      set("User", updatedUser);
      return updatedUser;
    });
  };

  const updateNotifications = async (notification) => {
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        notifications: notification,
      };
      set("User", updatedUser);
      return updatedUser;
    });
  };

  const updateAvailability = async (status) => {
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        availability: status,
      };
      set("User", updatedUser);
      return updatedUser;
    });
  };

  const updateTheme = (theme) => {
    setTheme(theme);
    localStorage.setItem("Theme", theme);
  };

  const trackMessagedUser = async (newUserId) => {
    setUser((prev) => {
      const prevMessagedUserIds = prev.messagedUserIds || [];
      const alreadyMessaged = prevMessagedUserIds.includes(newUserId);

      let updatedMessagedUserIds = [...prevMessagedUserIds];
      let updatedMessageCount = prev.message_count || 0;

      if (!alreadyMessaged) {
        updatedMessagedUserIds.push(newUserId);
        updatedMessageCount += 1;
      }

      if (updatedMessageCount > 5) {
        updatedMessagedUserIds = [];
        updatedMessageCount = 0;
      }

      const updatedUser = {
        ...prev,
        messagedUserIds: updatedMessagedUserIds,
        message_count: updatedMessageCount,
      };

      set("User", updatedUser);
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        setFavourites,
        theme,
        updateTheme,
        updateNotifications,
        updateAvailability,
        trackMessagedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
