import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import LoginStatusContext from "../contexts/LoginStatusContext";

export default function Logout() {
  const auth = useContext(LoginStatusContext);
  const [done, setDone] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    auth.logout().then(() => setDone(true));
  }, []);

  return (
    <div style={{ maxWidth: 420 }}>
      <h3>Sign out</h3>
      <div style={{ marginTop: 8 }}>
        {done ? (
          <>
            <div style={{ color: "green" }}>You have been signed out.</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => nav("/")}>Go to Home</button>
              <span style={{ marginLeft: 8 }}>
                <Link to="/login">Sign in again</Link>
              </span>
            </div>
          </>
        ) : (
          "Signing out…"
        )}
      </div>
    </div>
  );
}
