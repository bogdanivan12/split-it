import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetcher } from "@/utils/fetcher";
import { User } from "@/types/User.types";
import { useAccount } from "@/utils/hooks/useAccount";

type AuthContextType = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  refreshUser: () => void;
  logout: () => void;
  loading: boolean;
};

const TOKEN_STORAGE_KEY = "authenticated_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { get } = useAccount();

  useEffect(() => {
    if (token && token.length > 0) {
      refreshUser(); 
    }
  }, [token]);

  const loadTokenFromLocalStorage = async () => {
    setLoading(true);
    const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    console.log(`stored token: ${storedToken}`);
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await get(token);
      setLoading(false);
      console.log(res);
    } catch (error) {
      // display some error here. for now, user is logging out
      logout();
    }
  };

  useEffect(() => {
    loadTokenFromLocalStorage();
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setToken,
        logout,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
