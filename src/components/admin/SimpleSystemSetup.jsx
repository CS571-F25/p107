// Simplified System Setup - Owner Only, One-time Use
import { useState, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { initializeRoles, makeCurrentUserOwner, getUserLevel } from '../../services/roleService';
import { useUserPermissions } from '../../hooks/usePermissions';
import { auth } from '../../firebase/config';
import LoginStatusContext from '../contexts/LoginStatusContext';
import ThemeContext from '../contexts/ThemeContext';
import { isAuthorizedOwner } from '../../config/security';

export default function SimpleSystemSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);

  const { isLoggedIn, user } = useContext(LoginStatusContext);
  const { theme } = useContext(ThemeContext);
  const { level, isOwner } = useUserPermissions();
  const isDark = theme === 'dark';

  // Security check: Only authorized emails can setup the system
  const isAuthorized = isAuthorizedOwner(user?.email);

  if (!isLoggedIn) {
    return (
      <Container className="mt-4">
        <Alert variant="warning" className="text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to access system setup.</p>
        </Alert>
      </Container>
    );
  }

  if (!isAuthorized) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" className="text-center">
          <h4>🚫 Unauthorized Access</h4>
          <p>Only the system administrator can perform initial setup.</p>
          <small className="text-muted">
            Your email: {user?.email || 'unknown'}<br/>
            This email is not authorized for system setup.<br/>
            Contact the system administrator if you believe this is an error.
          </small>
        </Alert>
      </Container>
    );
  }

  if (isOwner) {
    return (
      <Container className="mt-4">
        <Alert variant="success" className="text-center">
          <h4>✅ System Already Setup</h4>
          <p>You are the system owner. Use the <a href="#/dashboard">Dashboard</a> to manage content and users.</p>
        </Alert>
      </Container>
    );
  }

  const handleCompleteSetup = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      // Step 1: Initialize role system
      setMessage('🔄 Initializing role system...');
      await initializeRoles();
      
      // Step 2: Make current user the owner
      setMessage('🔄 Assigning owner role...');
      await makeCurrentUserOwner();
      
      // Step 3: Verify the assignment worked
      setMessage('🔄 Verifying role assignment...');
      const userId = auth.currentUser?.uid;
      const newLevel = await getUserLevel(userId);
      
      if (newLevel !== 0) {
        throw new Error(`Role assignment failed. Expected level 0 (Owner), got level ${newLevel}`);
      }
      
      setSetupComplete(true);
      setMessage('🎉 System setup complete! You are now the owner.');
      
      // Redirect to dashboard after success
      setTimeout(() => {
        window.location.href = '#/dashboard';
      }, 2000);
      
    } catch (err) {
      setError(`Setup failed: ${err.message}`);
      console.error('Setup error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: isDark ? '#2d3748' : '#ffffff',
    borderColor: isDark ? '#4a5568' : '#e2e8f0'
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card style={cardStyle} className="text-center">
            <Card.Header>
              <h3 className="mb-0">🚀 System Setup</h3>
            </Card.Header>
            <Card.Body>
              {!setupComplete ? (
                <>
                  <h5>Welcome to Orient Way Blog!</h5>
                  <p className="text-muted mb-4">
                    This appears to be your first time setting up the system.
                    Click below to initialize the blog system and become the owner.
                  </p>
                  
                  <div className="mb-3">
                    <strong>What this will do:</strong>
                    <ul className="text-start mt-2">
                      <li>Create the role system (Owner, Admin, User, Guest)</li>
                      <li>Make you ({user?.email}) the system Owner</li>
                      <li>Give you full admin access to manage content and users</li>
                    </ul>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCompleteSetup}
                    disabled={loading}
                    className="w-100"
                  >
                    {loading ? 'Setting up...' : 'Complete System Setup'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <div className="display-1">🎉</div>
                    <h4>Setup Complete!</h4>
                    <p>Redirecting to dashboard...</p>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}

              {message && (
                <Alert variant="success" className="mt-3">
                  {message}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}