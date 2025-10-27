import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import LoginStatusContext from "../contexts/LoginStatusContext";

export default function Login() {
  const auth = useContext(LoginStatusContext);
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth?.isLoggedIn) {
    return (
      <div style={{ maxWidth: 420 }}>
        <h3>Already signed in</h3>
        <p>
          Go to <Link to="/">Home</Link> or <Link to="/logout">Sign out</Link>.
        </p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await auth.login({ email, password });
      nav(from, { replace: true });
    } catch (e) {
      setErr(e.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 420 }}>
      <h3>Sign in</h3>
      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
      <div style={{ marginBottom: 8 }}>
        <label>Email</label>
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Password</label>
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <div style={{ marginTop: 8 }}>
        New user? <Link to="/register">Create an account</Link>
      </div>
    </form>
  );
}
