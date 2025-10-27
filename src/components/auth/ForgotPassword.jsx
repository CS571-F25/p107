import { useState } from "react";
import { Link } from "react-router";
import { sendPasswordReset } from "../../services/authService";

/**
 * Forgot Password Component
 * Allows users to request password reset email
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccess(true);
      setEmail(""); // Clear input
    } catch (error) {
      setErr(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, padding: '1rem' }}>
      <h3>Reset Password</h3>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {success && (
        <div style={{ 
          color: "green", 
          marginBottom: 16, 
          padding: 12, 
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: 4
        }}>
          <strong>✓ Email sent!</strong>
          <p style={{ margin: '8px 0 0 0' }}>
            Check your inbox for password reset instructions. 
            The link will expire in 1 hour.
          </p>
        </div>
      )}

      {err && (
        <div style={{ 
          color: "crimson", 
          marginBottom: 16,
          padding: 12,
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: 4
        }}>
          {err}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 4 }}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            style={{ 
              width: '100%', 
              padding: 8, 
              fontSize: 16,
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Link to="/login">← Back to Sign In</Link>
      </div>

      <div style={{ 
        marginTop: 24, 
        padding: 12, 
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: 4,
        fontSize: 14
      }}>
        <strong>💡 Note:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>Check your spam folder if you don't see the email</li>
          <li>The reset link expires in 1 hour</li>
          <li>You can request a new link if needed</li>
        </ul>
      </div>
    </div>
  );
}
