import EmailVerificationAlert from "../auth/EmailVerificationAlert";

export default function Home() {
  return (
    <div style={{ maxWidth: 800, padding: '1rem' }}>
      <EmailVerificationAlert />
      
      <h1>Welcome!</h1>
      <p>This is the home page.</p>
    </div>
  );
}