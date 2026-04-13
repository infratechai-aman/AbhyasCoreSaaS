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
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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
            setUserData(userDoc.data());
          } else {
            // Initialize user doc if it doesn't exist
            const newData = {
              name: user.displayName || "Aspirant",
              email: user.email,
              createdAt: new Date().toISOString(),
              targetExam: null, // Will trigger the onboarding modal
              streak: 0,
              questionsSolved: 0,
              mocksCompleted: 0
            };
            await setDoc(doc(db, "users", user.uid), newData);
            setUserData(newData);
          }
        } catch (error) {
          console.error("Firestore Permission or Fetch Error:", error);
          // Provide default data so the app doesn't freeze in case of missing permissions
          setUserData({
            name: user.displayName || "Aspirant",
            email: user.email,
            targetExam: null, // Will trigger onboarding if permissions fail, which might fail again to save, but prevents white screen
            streak: 0,
            questionsSolved: 0,
            mocksCompleted: 0
          });
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
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
