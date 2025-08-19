import { createContext, useContext, useState } from "react";

// Create Context
const SelectedUserContext = createContext();

// Create a provider component
export const SelectedUserProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const [selectedGroupForStatus, setSelectedGroupForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [addTaskOpen, setAddTaskOpen] = useState(null);
  const [selectedMessageFortask, setSelectedMessageFortask] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [primaryUserData, setPrimaryUserData] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]);

  return (
    <SelectedUserContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        selectedMessage,
        setSelectedMessage,
        messageLoading,
        setMessageLoading,
        searchOpen,
        setSearchOpen,
        globalSearchOpen,
        setGlobalSearchOpen,
        addStatusOpen,
        setAddStatusOpen,
        selectedGroupForStatus,
        setSelectedGroupForStatus,
        selectedStatus,
        setSelectedStatus,
        addTaskOpen,
        setAddTaskOpen,
        selectedMessageFortask,
        setSelectedMessageFortask,
        allUsers,
        setAllUsers,
        primaryUserData,
        setPrimaryUserData,

        pendingMessages,
        setPendingMessages,
      }}
    >
      {children}
    </SelectedUserContext.Provider>
  );
};

// Custom hook to access the selected user context
export const useSelectedUser = () => {
  return useContext(SelectedUserContext);
};
