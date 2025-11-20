import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/config.js";
import { doc, setDoc } from "firebase/firestore";
import LoginStatusContext from "../contexts/LoginStatusContext";
import { assignDefaultRole, updateRoleByVerificationStatus } from "../../services/roleService";
import {
  login as doLogin,
  logout as doLogout,
  register as doRegister,
} from "../../services/authService";

/**
 * Provides Firebase auth state and actions via context
 */
export default function AuthProvider({ children }) {
  // Auth state: token and user
  const [{ token, user }, setAuth] = useState({ token: null, user: null });
  // Loading state
  const [loading, setLoading] = useState(true);
  
  const isLoggedIn = Boolean(token);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get token
        try {
          const idToken = await firebaseUser.getIdToken();
          setAuth({
            token: idToken,
            user: {
              email: firebaseUser.email,
              nickname: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              emailVerified: firebaseUser.emailVerified
            }
          });

          // Auto-assign default role for new users and update verification status
          // NOTE: Skip auto role assignment to avoid permission errors
          // Roles should be managed through the admin setup process only
          try {
            // Only save user info, don't assign roles automatically
            await setDoc(doc(db, 'userInfo', firebaseUser.uid), {
              email: firebaseUser.email,
              nickname: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              lastLogin: new Date(),
              emailVerified: firebaseUser.emailVerified
            }, { merge: true });
          } catch (userInfoError) {
            console.warn('Could not save user info (this is okay during setup):', userInfoError);
            // Don't block login for user info saving failure
          }
        } catch (error) {
          console.error('Error getting token:', error);
          setAuth({ token: null, user: null });
        }
      } else {
        // User is signed out
        setAuth({ token: null, user: null });
      }
      setLoading(false);
    });

    // Cleanup listener
    return () => unsubscribe();
  }, []);

  // Login action
  const login = async (payload) => {
    const res = await doLogin(payload);
    setAuth({ token: res.token, user: res.user });
  };

  // Register action
  const register = async (payload) => {
    await doRegister(payload);
  };

  // Logout action
  const logout = async () => {
    await doLogout();
    setAuth({ token: null, user: null });
  };

  // Context value
  const value = useMemo(
    () => ({
      isLoggedIn,
      token: token || null,
      user: user || null,
      login,
      register,
      logout,
      loading,
    }),
    [isLoggedIn, token, user, loading]
  );

  // Show placeholder while loading
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <LoginStatusContext.Provider value={value}>
      {children}
    </LoginStatusContext.Provider>
  );
}
