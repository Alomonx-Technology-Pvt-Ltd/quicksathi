import { createContext, useContext, useState } from "react";

import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import api from "../config/api";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("qs_token");
    const savedUser = localStorage.getItem("qs_user");
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem("qs_token");
        localStorage.removeItem("qs_user");
        localStorage.removeItem("qs_provider");
      }
    }
    return null;
  });

  const [providerProfile, setProviderProfile] = useState(() => {
    const token = localStorage.getItem("qs_token");
    const savedProvider = localStorage.getItem("qs_provider");
    if (token && savedProvider) {
      try {
        return JSON.parse(savedProvider);
      } catch {
        localStorage.removeItem("qs_provider");
      }
    }
    return null;
  });

  const loading = false;

  const saveSession = (token, userData, providerData = null) => {
    localStorage.setItem("qs_token", token);
    localStorage.setItem("qs_user", JSON.stringify(userData));
    setUser(userData);
    if (providerData) {
      localStorage.setItem("qs_provider", JSON.stringify(providerData));
      setProviderProfile(providerData);
    } else {
      localStorage.removeItem("qs_provider");
      setProviderProfile(null);
    }
  };

  const clearSession = () => {
    localStorage.removeItem("qs_token");
    localStorage.removeItem("qs_user");
    localStorage.removeItem("qs_provider");
    setUser(null);
    setProviderProfile(null);
  };

  // Email/Password Registration
  const register = async (name, email, password, phone) => {
    const { data } = await api.post("/auth/register", { name, email, password, phone });
    saveSession(data.token, data.user);
    return data.user;
  };

  // Email/Password Login
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    saveSession(data.token, data.user);
    return data.user;
  };

  // Google Sign-In via Firebase
  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase is not configured. Please add your Firebase credentials.");
    }
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Get Firebase ID token for server-side verification
    const idToken = await firebaseUser.getIdToken();

    const { data } = await api.post("/auth/google", {
      idToken,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      avatar: firebaseUser.photoURL,
      firebaseUid: firebaseUser.uid,
    });

    saveSession(data.token, data.user);
    return data.user;
  };

  // Provider Login (email/password)
  const providerLogin = async (email, password) => {
    const { data } = await api.post("/auth/provider-login", { email, password });
    saveSession(data.token, data.user, data.provider);
    return data;
  };

  // Provider Login with Google
  const providerLoginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase is not configured. Please add your Firebase credentials.");
    }
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken();

    const { data } = await api.post("/auth/provider-google", {
      idToken,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      avatar: firebaseUser.photoURL,
      firebaseUid: firebaseUser.uid,
    });

    saveSession(data.token, data.user, data.provider);
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      if (auth) await firebaseSignOut(auth);
    } catch {
      // Firebase sign out may fail if not signed in via Firebase
    }
    clearSession();
  };

  const value = {
    user,
    providerProfile,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isProvider: user?.role === "provider",
    register,
    login,
    loginWithGoogle,
    providerLogin,
    providerLoginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
