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
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

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
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate userData from sessionStorage only after mount to prevent SSR hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("abhyas_userData");
        if (cached) setUserData(JSON.parse(cached));
      } catch {}
    }
  }, []);

  // Helper to update userData and persist to sessionStorage
  const updateUserData = (data: any | null) => {
    setUserData(data);
    if (typeof window !== "undefined") {
      try {
        if (data) {
          // SECURITY (VULN-20): Omit sensitive payment IDs from client-side cache
          // but keep plan + status so usePremium() doesn't flash "Free" on reload
          const { usage, ...safeData } = data;
          if (safeData.subscription) {
            safeData.subscription = { plan: safeData.subscription.plan, status: safeData.subscription.status };
          }
          sessionStorage.setItem("abhyas_userData", JSON.stringify(safeData));
          // Set a minimal cookie for Next.js Middleware route protection
          document.cookie = "abhyas_session=1; path=/; max-age=86400; SameSite=Lax; Secure";
          // MED-03 FIX: Check admin status via server-side endpoint instead of
          // exposing admin email in NEXT_PUBLIC env var. Fire-and-forget.
          const currentUser = auth?.currentUser;
          if (currentUser) {
            currentUser.getIdToken().then((idToken) => {
              fetch("/api/admin/verify", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}` },
              })
                .then((r) => r.ok ? r.json() : null)
                .then((d) => {
                  if (d?.isAdmin) {
                    document.cookie = "abhyas_admin=1; path=/; max-age=86400; SameSite=Lax; Secure";
                  }
                })
                .catch(() => {});
            }).catch(() => {});
          }
          // Check if user is an institute owner
          if (currentUser) {
            currentUser.getIdToken().then((idToken) => {
              fetch("/api/institute/verify-owner", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}` },
              })
                .then((r) => r.ok ? r.json() : null)
                .then((d) => {
                  if (d?.isInstitute) {
                    document.cookie = "abhyas_institute=1; path=/; max-age=86400; SameSite=Lax; Secure";
                    // Store institute info in sessionStorage for quick access
                    try {
                      sessionStorage.setItem("abhyas_institute", JSON.stringify({
                        id: d.instituteId,
                        name: d.instituteName,
                      }));
                    } catch {}
                  }
                })
                .catch(() => {});
            }).catch(() => {});
          }
        } else {
          sessionStorage.removeItem("abhyas_userData");
          document.cookie = "abhyas_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure";
          document.cookie = "abhyas_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure";
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

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user && db) {
        unsubscribeSnapshot = onSnapshot(doc(db, "users", user.uid), async (userDoc) => {
          if (userDoc.exists()) {
            updateUserData(userDoc.data());
            setLoading(false);
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
              mocksCompleted: 0,
              subscription: { plan: "Free", status: "none" }
            };
            try {
              await setDoc(doc(db!, "users", user.uid), newData);
              updateUserData(newData);
            } catch (error) {
              console.error("Firestore Permission or Fetch Error:", error);
            }
            setLoading(false);
          }
        }, (error) => {
          console.error("Firestore Snapshot Error:", error);
          // Use cached data if available, otherwise provide defaults
          const cachedFallback = typeof window !== "undefined" 
            ? (() => { try { const c = sessionStorage.getItem("abhyas_userData"); return c ? JSON.parse(c) : null; } catch { return null; } })() 
            : null;
          
          if (!cachedFallback) {
            updateUserData({
              name: user?.displayName || "Aspirant",
              email: user?.email,
              targetExam: null,
              academicClass: null,
              streak: 0,
              questionsSolved: 0,
              mocksCompleted: 0
            });
          }
          setLoading(false);
        });
      } else {
        updateUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const logout = async () => {
    // Revoke refresh tokens server-side (invalidates all sessions)
    try {
      const token = auth ? await auth.currentUser?.getIdToken() : null;
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {}); // Don't block logout on network error
      }
    } catch {}
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
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
