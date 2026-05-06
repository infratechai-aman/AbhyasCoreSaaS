"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
  signInWithGoogle: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // Hydrate userData from sessionStorage immediately to prevent flash-null on route transitions
  const [userData, setUserData] = useState<any | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("abhyas_userData");
        return cached ? JSON.parse(cached) : null;
      } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Helper to update userData and persist to sessionStorage
  const updateUserData = (data: any | null) => {
    setUserData(data);
    if (typeof window !== "undefined") {
      try {
        if (data) {
          sessionStorage.setItem("abhyas_userData", JSON.stringify(data));
        } else {
          sessionStorage.removeItem("abhyas_userData");
        }
      } catch {}
    }
  };

  useEffect(() => {
    // Guard: if Firebase auth isn't available (e.g. during prerendering), skip
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user && db) {
        try {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            updateUserData(userDoc.data());
          } else {
            // Initialize user doc if it doesn't exist
            const newData = {
              name: user.displayName || "Aspirant",
              email: user.email,
              createdAt: new Date().toISOString(),
              targetExam: null, // Will trigger the onboarding modal
              academicClass: null,
              streak: 0,
              questionsSolved: 0,
              mocksCompleted: 0
            };
            await setDoc(doc(db, "users", user.uid), newData);
            updateUserData(newData);
          }
        } catch (error) {
          console.error("Firestore Permission or Fetch Error:", error);
          // Use cached data if available, otherwise provide defaults
          const cachedFallback = typeof window !== "undefined" 
            ? (() => { try { const c = sessionStorage.getItem("abhyas_userData"); return c ? JSON.parse(c) : null; } catch { return null; } })() 
            : null;
          
          if (!cachedFallback) {
            updateUserData({
              name: user.displayName || "Aspirant",
              email: user.email,
              targetExam: null,
              academicClass: null,
              streak: 0,
              questionsSolved: 0,
              mocksCompleted: 0
            });
          }
          // If cached data exists, keep it (don't overwrite with defaults)
        }
      } else {
        updateUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (typeof window !== "undefined") {
      try { sessionStorage.removeItem("abhyas_userData"); } catch {}
    }
    if (auth) await signOut(auth);
  };

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
