// Firestore connection and permissions test component
import { useState, useContext } from 'react';
import { Container, Card, Button, Alert, Badge } from 'react-bootstrap';
import { collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import LoginStatusContext from '../contexts/LoginStatusContext';
import ThemeContext from '../contexts/ThemeContext';

export default function FirestoreTest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, user } = useContext(LoginStatusContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runFirestoreTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Authentication status
      addResult(
        'Authentication',
        !!auth.currentUser,
        auth.currentUser ? `Logged in as: ${auth.currentUser.email}` : 'Not logged in'
      );

      if (!auth.currentUser) {
        addResult('Error', false, 'Please log in to continue tests');
        setLoading(false);
        return;
      }

      // Test 2: Basic Firestore connection
      try {
        const testDocRef = doc(db, 'test', 'connection');
        await getDoc(testDocRef);
        addResult('Firestore Connection', true, 'Successfully connected to Firestore');
      } catch (error) {
        addResult('Firestore Connection', false, `Connection failed: ${error.message}`);
        setLoading(false);
        return;
      }

      // Test 3: Write permissions test
      try {
        const testDocRef = doc(db, 'test', `write-test-${Date.now()}`);
        await setDoc(testDocRef, {
          message: 'Test write operation',
          userId: auth.currentUser.uid,
          timestamp: new Date()
        });
        addResult('Write Permissions', true, 'Successfully wrote test document');

        // Clean up test document
        await deleteDoc(testDocRef);
        addResult('Cleanup', true, 'Successfully deleted test document');
      } catch (error) {
        addResult('Write Permissions', false, `Write failed: ${error.message}`);
      }

      // Test 4: Roles collection access
      try {
        const rolesRef = collection(db, 'roles');
        const testRoleRef = doc(rolesRef, 'test-role');
        await setDoc(testRoleRef, {
          name: 'Test Role',
          level: 999,
          description: 'Test role for permissions check',
          permissions: ['test'],
          createdAt: new Date()
        });
        addResult('Roles Collection Write', true, 'Successfully wrote to roles collection');

        // Clean up
        await deleteDoc(testRoleRef);
        addResult('Roles Cleanup', true, 'Successfully cleaned up test role');
      } catch (error) {
        addResult('Roles Collection Write', false, `Roles write failed: ${error.message}`);
      }

      // Test 5: UserRoles collection access
      try {
        const userRolesRef = collection(db, 'userRoles');
        const testUserRoleRef = doc(userRolesRef, `test-${auth.currentUser.uid}`);
        await setDoc(testUserRoleRef, {
          userId: auth.currentUser.uid,
          roleId: 'test-role',
          assignedBy: 'test',
          assignedAt: new Date()
        });
        addResult('UserRoles Collection Write', true, 'Successfully wrote to userRoles collection');

        // Clean up
        await deleteDoc(testUserRoleRef);
        addResult('UserRoles Cleanup', true, 'Successfully cleaned up test user role');
      } catch (error) {
        addResult('UserRoles Collection Write', false, `UserRoles write failed: ${error.message}`);
      }

    } catch (error) {
      addResult('General Error', false, `Unexpected error: ${error.message}`);
    }

    setLoading(false);
  };

  const cardStyle = {
    backgroundColor: isDark ? '#2d3748' : '#fff',
    borderColor: isDark ? '#4a5568' : '#dee2e6'
  };

  return (
    <Container fluid style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
      <Card style={cardStyle}>
        <Card.Header>
          <h4 className="mb-0">Firestore Permissions Test</h4>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <p className="text-muted">
              This tool tests your Firestore connection and permissions. 
              Run this test if you're experiencing permission errors.
            </p>
            
            {!isLoggedIn && (
              <Alert variant="warning">
                <strong>Please log in first</strong> to test Firestore permissions.
              </Alert>
            )}
          </div>

          <div className="d-grid gap-2 mb-4">
            <Button 
              variant="primary" 
              onClick={runFirestoreTests}
              disabled={loading || !isLoggedIn}
            >
              {loading ? 'Running Tests...' : 'Run Firestore Tests'}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div>
              <h5>Test Results:</h5>
              <div className="list-group">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      isDark ? 'bg-dark text-light' : ''
                    }`}
                  >
                    <div>
                      <strong>{result.test}</strong>
                      <br />
                      <small className="text-muted">{result.message}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={result.success ? 'success' : 'danger'}>
                        {result.success ? 'PASS' : 'FAIL'}
                      </Badge>
                      <small className="text-muted">{result.timestamp}</small>
                    </div>
                  </div>
                ))}
              </div>

              {testResults.some(r => !r.success) && (
                <Alert variant="danger" className="mt-3">
                  <strong>Some tests failed!</strong>
                  <br />
                  This usually indicates Firestore security rules need to be updated.
                  <br />
                  Please check the <code>FIRESTORE_PERMISSIONS_GUIDE.md</code> file for instructions.
                </Alert>
              )}

              {testResults.every(r => r.success) && (
                <Alert variant="success" className="mt-3">
                  <strong>All tests passed!</strong>
                  <br />
                  Your Firestore permissions are configured correctly.
                </Alert>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}