import { useEffect, useMemo, useState } from "react";
import LoginStatusContext from "../contexts/LoginStatusContext";
import {
  getStoredAuth,
  login as doLogin,
  logout as doLogout,
  register as doRegister,
} from "../../services/authService";

/**
 * Provides a simple auth state and actions via context.
 * No legacy setLoginStatus compatibility.
 */
export default function AuthProvider({ children }) {
  const [{ token, user }, setAuth] = useState(() => getStoredAuth());
  const isLoggedIn = Boolean(token);

  // Actions
  const login = async (payload) => {
    const res = await doLogin(payload);
    setAuth({ token: res.token, user: res.user });
  };

  const register = async (payload) => {
    await doRegister(payload);
  };

  const logout = async () => {
    await doLogout();
    setAuth({ token: null, user: null });
  };

  // Restore session on first mount (if any)
  useEffect(() => {
    const { token: t, user: u } = getStoredAuth();
    if (t) setAuth({ token: t, user: u });
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      token: token || null,
      user: user || null,
      login,
      register,
      logout,
    }),
    [isLoggedIn, token, user]
  );

  return (
    <LoginStatusContext.Provider value={value}>
      {children}
    </LoginStatusContext.Provider>
  );
}
