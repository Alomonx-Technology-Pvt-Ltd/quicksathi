import { createContext, useContext, useState, useEffect } from "react";
 
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import api from "../config/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
     
    const token = localStorage.getItem("qs_token");
    const savedUser = localStorage.getItem("qs_user");
    if (token && savedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("qs_token");
        localStorage.removeItem("qs_user");
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (token, userData) => {
    localStorage.setItem("qs_token", token);
    localStorage.setItem("qs_user", JSON.stringify(userData));
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem("qs_token");
    localStorage.removeItem("qs_user");
    setUser(null);
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
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const { data } = await api.post("/auth/google", {
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      avatar: firebaseUser.photoURL,
      firebaseUid: firebaseUser.uid,
    });

    saveSession(data.token, data.user);
    return data.user;
  };

  // Logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Firebase sign out may fail if not signed in via Firebase
    }
    clearSession();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isProvider: user?.role === "provider",
    register,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
