import { createContext, useContext, useState } from "react";

import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import api from "../config/api";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// ── Retry wrapper for backend calls (handles Render cold-start timeouts) ────
// Retries up to `maxRetries` times with `delayMs` between attempts.
// This prevents "network error" on first login attempt when backend is waking up.
async function withRetry(fn, maxRetries = 3, delayMs = 2000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isNetworkError =
        !err.response || // no response at all (timeout/connection refused)
        err.code === "ECONNABORTED" ||
        err.message?.toLowerCase().includes("network");

      // Only retry on network errors, not on 4xx business logic errors
      if (!isNetworkError || attempt === maxRetries) throw err;

      // Wait before retrying — gives Render time to wake up
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

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
    const { data } = await withRetry(() =>
      api.post("/auth/register", { name, email, password, phone })
    );
    saveSession(data.token, data.user);
    return data.user;
  };

  // Email/Password Login
  const login = async (email, password) => {
    const { data } = await withRetry(() =>
      api.post("/auth/login", { email, password })
    );
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

    // Retry backend call — Render may be cold on first attempt
    const { data } = await withRetry(() =>
      api.post("/auth/google", {
        idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        firebaseUid: firebaseUser.uid,
      })
    );

    saveSession(data.token, data.user);
    return data.user;
  };

  // ── Phone OTP Auth via Firebase ──────────────────────────────────────────────

  // Step 1: Send OTP to phone number
  const sendOtp = async (phoneNumber) => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please add your Firebase credentials.");
    }

    // Clean up any existing reCAPTCHA
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch { /* ignore */ }
      window.recaptchaVerifier = null;
    }

    // Create invisible reCAPTCHA
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => { /* reCAPTCHA solved — allow signInWithPhoneNumber */ },
    });

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    // Store confirmationResult for step 2
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  };

  // Step 2: Verify OTP and authenticate
  const verifyOtp = async (otp) => {
    if (!window.confirmationResult) {
      throw new Error("Please request OTP first.");
    }

    const result = await window.confirmationResult.confirm(otp);
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken();

    // Send to our backend for login/registration
    const { data } = await withRetry(() =>
      api.post("/auth/phone", {
        idToken,
        phone: firebaseUser.phoneNumber,
      })
    );

    saveSession(data.token, data.user);

    // Cleanup
    window.confirmationResult = null;
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch { /* ignore */ }
      window.recaptchaVerifier = null;
    }

    return data.user;
  };

  // ── Profile Update ──────────────────────────────────────────────────────────

  const updateProfile = async (profileData) => {
    const { data } = await api.put("/auth/profile", profileData);
    // Update local user state and localStorage
    const updatedUser = data.user;
    localStorage.setItem("qs_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  // Provider Login (email/password)
  const providerLogin = async (email, password) => {
    const { data } = await withRetry(() =>
      api.post("/auth/provider-login", { email, password })
    );
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

    // Retry backend call — Render may be cold on first attempt
    const { data } = await withRetry(() =>
      api.post("/auth/provider-google", {
        idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        firebaseUid: firebaseUser.uid,
      })
    );

    saveSession(data.token, data.user, data.provider);
    return data;
  };

  // Admin Login (Email/Password)
  const adminLogin = async (email, password) => {
    try {
      const { data } = await withRetry(() =>
        api.post("/auth/admin-login", { email, password })
      );
      saveSession(data.token, data.user);
      return data.user;
    } catch (err) {
      // Fallback in case remote backend has not deployed /admin-login yet
      if (err.response?.status === 404) {
        const { data } = await withRetry(() =>
          api.post("/auth/login", { email, password })
        );
        if (data.user?.role !== "admin") {
          clearSession();
          throw new Error("Access denied. This account does not have administrator privileges.");
        }
        saveSession(data.token, data.user);
        return data.user;
      }
      throw err;
    }
  };

  // Admin Login with Google
  const adminLoginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase is not configured. Please add your Firebase credentials.");
    }
    // Always prompt account selection so admins can select their admin email
    googleProvider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken();

    try {
      const { data } = await withRetry(() =>
        api.post("/auth/admin-google", {
          idToken,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
          firebaseUid: firebaseUser.uid,
        })
      );
      saveSession(data.token, data.user);
      return data.user;
    } catch (err) {
      // Fallback in case remote backend has not deployed /admin-google yet
      if (err.response?.status === 404) {
        const { data } = await withRetry(() =>
          api.post("/auth/google", {
            idToken,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
            firebaseUid: firebaseUser.uid,
          })
        );
        if (data.user?.role !== "admin") {
          clearSession();
          throw new Error(`Access denied. The Google account (${firebaseUser.email}) is not authorized as an administrator.`);
        }
        saveSession(data.token, data.user);
        return data.user;
      }
      throw err;
    }
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
    sendOtp,
    verifyOtp,
    updateProfile,
    providerLogin,
    providerLoginWithGoogle,
    adminLogin,
    adminLoginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
