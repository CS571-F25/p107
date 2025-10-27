import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import LoginStatusContext from "../contexts/LoginStatusContext";
import { sendVerificationEmail } from "../../services/authService";

export default function Register() {
  const auth = useContext(LoginStatusContext);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);
    setLoading(true);
    try {
      await auth.register({ email, password, nickname });
      
      try {
        await sendVerificationEmail();
      } catch (emailError) {
        console.warn("Failed to send verification email:", emailError);
      }
      
      setOk(true);
      setTimeout(() => nav("/login"), 600);
    } catch (e) {
      setErr(e.message || "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 800, padding: '1rem' }}>
      <h1>Create account</h1>
      {ok && (
        <div style={{ color: "green", marginBottom: 8 }}>
          Registration successful. Redirecting to sign-in…
        </div>
      )}
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
        <label>Nickname (optional)</label>
        <br />
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
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
        {loading ? "Submitting..." : "Sign up"}
      </button>

      <div style={{ marginTop: 8 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </form>
  );
}
