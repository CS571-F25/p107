import { useState, useEffect, useContext } from "react";
import { sendVerificationEmail, reloadUser, isEmailVerified } from "../../services/authService";
import LoginStatusContext from "../contexts/LoginStatusContext";

/**
 * Email Verification Alert Component
 * Shows when user is logged in but email not verified
 */
export default function EmailVerificationAlert() {
  const auth = useContext(LoginStatusContext);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check if email is verified
  useEffect(() => {
    setVerified(isEmailVerified());
  }, [auth.user]);

  // Don't show if verified or not logged in
  if (!auth.isLoggedIn || verified) {
    return null;
  }

  const handleSendVerification = async () => {
    setSending(true);
    setError("");
    setSent(false);

    try {
      await sendVerificationEmail();
      setSent(true);
      // Allow resend after 60 seconds
      setTimeout(() => setSent(false), 60000);
    } catch (err) {
      setError(err.message || "Failed to send verification email.");
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    setError("");

    try {
      // Reload user data
      await reloadUser();
      // Check verification status
      const isVerified = isEmailVerified();
      setVerified(isVerified);
      
      if (!isVerified) {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err) {
      setError(err.message || "Failed to check verification status.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff3cd',
      border: '1.5px solid #ffc107',
      borderRadius: 4,
      padding: 12,
      marginBottom: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 24 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#666',fontSize: 18 }}>
            Email Not Verified
          </h4>
          <p style={{ margin: '0 0 12px 0', color: '#666' }}>
            Please verify your email address to access all features. 
            Check your inbox for the verification link.
          </p>

          {sent && (
            <div style={{ 
              color: "green", 
              marginBottom: 12,
              padding: 8,
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: 4,
              fontSize: 14
            }}>
              ✓ Verification email sent! Check your inbox (and spam folder).
            </div>
          )}

          {error && (
            <div style={{ 
              color: "crimson", 
              marginBottom: 12,
              padding: 8,
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: 4,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ 
                margin: '0 0 0 0', 
                fontSize: 13, 
                color: '#666',
                fontStyle: 'italic'
            }}>
                💡 Tip: Check your spam folder if you don't see the email.
            </p>

            <button
              onClick={handleSendVerification}
              disabled={sending || sent}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: sent ? '#28a745' : (sending ? '#ccc' : '#007bff'),
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: (sending || sent) ? 'not-allowed' : 'pointer'
              }}
            >
              {sending ? "Sending..." : (sent ? "✓ Sent" : "Resend Verification Email")}
            </button>

            <button
              onClick={handleCheckVerification}
              disabled={checking}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: checking ? '#ccc' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: checking ? 'not-allowed' : 'pointer'
              }}
            >
              {checking ? "Checking..." : "I've Verified"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
