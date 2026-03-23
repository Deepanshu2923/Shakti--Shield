import React, { useEffect, useState, useCallback } from "react";
import { AuthContext, AuthProvider } from "./AuthContext";
import api from "../../URL/CustomApi";
import { Config } from "../../URL/Config";

/**
 * AuthContextProvider
 * Wraps the app and provides authentication state & actions.
 */
const AuthContextProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);      // is user authenticated?
  const [user, setUser] = useState(null);       // user profile data
  const [loading, setLoading] = useState(true); // auth checking in progress

  const fetchUserInfo = useCallback(async () => {
    try {
      const { data } = await api.get(Config.GETDATAUrl);
      if (data) {
        localStorage.setItem("UserInfo", JSON.stringify(data));
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  }, []);

  // Check authentication status via backend
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(Config.CHECKAuthUrl);
      if (data.authenticated) {
        await fetchUserInfo();
        setAuth(true);
      } else {
        logout(); // not authenticated → clear state
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setAuth(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserInfo]);

  // Logout action
  const logout = useCallback(async () => {
    try {
      await api.post(Config.LogoutUrl);
      localStorage.clear();
      setAuth(false);
      setUser(null);
      console.log("Logged out successfully.");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthProvider value={{ auth, user, loading, logout, checkAuth, setAuth, setUser }}>
      {children}
    </AuthProvider>
  );
};

export default AuthContextProvider;
