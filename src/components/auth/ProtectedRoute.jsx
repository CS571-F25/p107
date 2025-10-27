import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import LoginStatusContext from "../contexts/LoginStatusContext";

/**
 * Wrap protected pages:
 * <ProtectedRoute><Secret /></ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const auth = useContext(LoginStatusContext);
  const location = useLocation();

  if (!auth?.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
