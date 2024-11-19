import { User } from "@/types/User.types";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
  refreshUserInfo: () => void;
  refreshUserGroups: () => void;
};

const USER_STORAGE_KEY = "authenticated_user";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUserFromLocalStorage = async () => {
    setLoading(true);
    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserFromLocalStorage();
  }, []);

  const refreshUserInfo = () => {};

  const refreshUserGroups = () => {};

  const logout = () => setUser(null);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        refreshUserGroups,
        refreshUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
