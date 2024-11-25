import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetcher } from "@/utils/fetcher";
import { User } from "@/types/User.types";
import { useAccount } from "@/utils/hooks/useAccount";
import { router } from "expo-router";
import { Alert } from "react-native";
import { ApiError } from "@/types/ApiError.types";

type AuthContextType = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  refreshUser: () => Promise<void>;
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

  const loadTokenFromLocalStorage = async () => {
    setLoading(true);
    const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    // console.log(`stored token: ${storedToken}`);
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      setLoading(true);
      const res = await get(token);
      setUser({
        email: res.email,
        id: res._id,
        fullName: res.full_name,
        groupIds: res.group_ids,
        phoneNumber: res.phone_number,
        username: res.username,
      });
      setLoading(false);
    } catch (error) {
      // message like retrieving user failed, pelase try again. alert if error, and if you press ok you get logged out. i can create a component that does this, or an util function
      const err = error as ApiError;
      Alert.prompt("Failed!", "Could not log in. Please try again", logout);
      throw Error("Could not refresh user.");
    }
  };

  useEffect(() => {
    if (!token) {
      router.replace("/(intro)");
    }
    console.log("refreshing user");
    refreshUser();
  }, [token]);

  useEffect(() => {
    loadTokenFromLocalStorage();
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/(account)");
    }
  }, [user]);

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
