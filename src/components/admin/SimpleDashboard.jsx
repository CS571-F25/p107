// Simplified Admin Dashboard with Role Management
import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Alert } from 'react-bootstrap';
import { useUserPermissions } from '../../hooks/usePermissions';
import ThemeContext from '../contexts/ThemeContext';
import LoginStatusContext from '../contexts/LoginStatusContext';
import Dashboard from './Dashboard';
import RoleManagement from './RoleManagement';
import PermissionDebugger from './PermissionDebugger';

export default function SimpleDashboard() {
  const [activeTab, setActiveTab] = useState('posts');
  const { isLoggedIn } = useContext(LoginStatusContext);
  const { theme } = useContext(ThemeContext);
  const { level, isOwner, isAdmin, canAccessAdmin, loading } = useUserPermissions();
  const isDark = theme === 'dark';

  if (!isLoggedIn) {
    return (
      <Container className="mt-4">
        <Alert variant="warning" className="text-center">
          <h4>Login Required</h4>
          <p>Please log in to access the dashboard.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!canAccessAdmin) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" className="text-center">
          <h4>Admin Access Required</h4>
          <p>You need administrator privileges to access this dashboard.</p>
          <small className="text-muted">
            Current level: {level} | Required: Admin (≤1) or Owner (0)
          </small>
        </Alert>
      </Container>
    );
  }

  const cardStyle = {
    backgroundColor: isDark ? '#2d3748' : '#ffffff',
    borderColor: isDark ? '#4a5568' : '#e2e8f0'
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card style={cardStyle}>
            <Card.Header>
              <h3 className="mb-0">Admin Dashboard</h3>
              <small className="text-muted">
                Welcome {isOwner ? 'Owner' : 'Admin'} - Level {level}
              </small>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="posts" title="Article Management">
                  <Dashboard />
                </Tab>
                
                {(isOwner || isAdmin) && (
                  <Tab eventKey="roles" title="Role Management">
                    <RoleManagement />
                  </Tab>
                )}

                {isOwner && (
                  <Tab eventKey="debug" title="Debug">
                    <PermissionDebugger />
                  </Tab>
                )}
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}