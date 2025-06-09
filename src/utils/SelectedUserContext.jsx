import { createContext, useContext, useState } from 'react';

// Create Context
const SelectedUserContext = createContext();

// Create a provider component
export const SelectedUserProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [searchOpen,setSearchOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen]= useState(false);

  return (
    <SelectedUserContext.Provider value={{
      selectedUser,
      setSelectedUser,
      selectedMessage,
      setSelectedMessage,
      messageLoading,
      setMessageLoading,
      searchOpen,
      setSearchOpen,
      globalSearchOpen,
      setGlobalSearchOpen
    }}>
      {children}
    </SelectedUserContext.Provider>
  );
};

// Custom hook to access the selected user context
export const useSelectedUser = () => {
  return useContext(SelectedUserContext);
};
