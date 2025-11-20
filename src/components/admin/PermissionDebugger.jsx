// Permission Debugger Component - Temporary debugging tool
import { useState, useEffect } from 'react';
import { Card, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { auth } from '../../firebase/config';
import { getUserLevel, getUserRoles, canAccessAdmin, isOwner } from '../../services/roleService';
import { useUserPermissions } from '../../hooks/usePermissions';

export default function PermissionDebugger() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const hookPermissions = useUserPermissions();

  const checkPermissions = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        setDebugInfo({ error: 'No authenticated user' });
        return;
      }

      const [userRoles, level, adminAccess, ownerStatus] = await Promise.all([
        getUserRoles(userId),
        getUserLevel(userId),
        canAccessAdmin(userId),
        isOwner(userId)
      ]);

      setDebugInfo({
        userId,
        userEmail: auth.currentUser?.email,
        userRoles: userRoles.map(r => ({ roleId: r.roleId, level: r.role?.level, name: r.role?.name })),
        level,
        adminAccess,
        ownerStatus,
        hookData: {
          level: hookPermissions.level,
          canAccessAdmin: hookPermissions.canAccessAdmin,
          isOwner: hookPermissions.isOwner,
          loading: hookPermissions.loading
        }
      });
    } catch (error) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      checkPermissions();
    }
  }, []);

  const forceHookRefresh = () => {
    // Force hook refresh
    if (hookPermissions.forceRefresh) {
      console.log('🔄 Forcing hook refresh...');
      hookPermissions.forceRefresh();
    } else {
      // Fallback to page reload
      window.location.reload();
    }
  };

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">🔍 Permission Debugger</h6>
        <div>
          <Button variant="outline-secondary" size="sm" onClick={checkPermissions} disabled={loading} className="me-2">
            {loading ? 'Checking...' : 'Refresh Data'}
          </Button>
          <Button variant="outline-primary" size="sm" onClick={forceHookRefresh} className="me-2">
            Force Hook Refresh
          </Button>
          <Button variant="outline-warning" size="sm" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {debugInfo?.error ? (
          <Alert variant="danger">{debugInfo.error}</Alert>
        ) : debugInfo ? (
          <div>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <strong>User:</strong><br/>
                  <small>{debugInfo.userEmail}<br/>ID: {debugInfo.userId?.slice(0, 12)}...</small>
                </div>
                
                <div className="mb-3">
                  <strong>Direct Service Calls:</strong>
                  <ul className="mb-1">
                    <li>Level: <Badge bg="info">{debugInfo.level}</Badge></li>
                    <li>Admin Access: <Badge bg={debugInfo.adminAccess ? 'success' : 'danger'}>{debugInfo.adminAccess ? 'Yes' : 'No'}</Badge></li>
                    <li>Is Owner: <Badge bg={debugInfo.ownerStatus ? 'success' : 'secondary'}>{debugInfo.ownerStatus ? 'Yes' : 'No'}</Badge></li>
                  </ul>
                </div>

                <div className="mb-3">
                  <strong>User Roles:</strong><br/>
                  {debugInfo.userRoles.length === 0 ? (
                    <Badge bg="warning">No roles found</Badge>
                  ) : (
                    debugInfo.userRoles.map((role, index) => (
                      <Badge key={index} bg="secondary" className="me-1">
                        {role.roleId} (Level: {role.level})
                      </Badge>
                    ))
                  )}
                </div>
              </Col>

              <Col md={6}>
                <div className="mb-3">
                  <strong>Hook Results:</strong>
                  <ul className="mb-1">
                    <li>Level: <Badge bg="info">{debugInfo.hookData.level}</Badge></li>
                    <li>Admin Access: <Badge bg={debugInfo.hookData.canAccessAdmin ? 'success' : 'danger'}>{debugInfo.hookData.canAccessAdmin ? 'Yes' : 'No'}</Badge></li>
                    <li>Is Owner: <Badge bg={debugInfo.hookData.isOwner ? 'success' : 'secondary'}>{debugInfo.hookData.isOwner ? 'Yes' : 'No'}</Badge></li>
                    <li>Loading: <Badge bg={debugInfo.hookData.loading ? 'warning' : 'success'}>{debugInfo.hookData.loading ? 'Yes' : 'No'}</Badge></li>
                  </ul>
                </div>

                {(debugInfo.level !== debugInfo.hookData.level || 
                  debugInfo.adminAccess !== debugInfo.hookData.canAccessAdmin) && (
                  <Alert variant="warning" className="mt-2">
                    ⚠️ Mismatch detected between direct service calls and hooks!<br/>
                    <small>
                      This usually means the permission hooks are not updating properly.
                      Try "Force Page Reload" to fix this.
                    </small>
                  </Alert>
                )}

                {debugInfo.hookData.loading && (
                  <Alert variant="info" className="mt-2">
                    🔄 Hooks are still loading. This should resolve automatically.
                  </Alert>
                )}
              </Col>
            </Row>
          </div>
        ) : (
          <div className="text-muted">Click refresh to check permissions</div>
        )}
      </Card.Body>
    </Card>
  );
}