import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { auth } from '../../firebase/config';
import { getUserRoles, getUserLevel, canAccessAdmin, isOwner } from '../../services/roleService';

const PermissionDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        setDebugInfo({ error: 'Not logged in' });
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
        userRoles,
        level,
        adminAccess,
        ownerStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDebug();
  }, []);

  return (
    <Card>
      <Card.Header>
        <h5>Permission Debug Tool</h5>
      </Card.Header>
      <Card.Body>
        <Button onClick={runDebug} disabled={loading} className="mb-3">
          {loading ? 'Checking...' : 'Refresh Debug Info'}
        </Button>

        {debugInfo && (
          <div>
            {debugInfo.error ? (
              <Alert variant="danger">
                Error: {debugInfo.error}
              </Alert>
            ) : (
              <div>
                <Alert variant="info">
                  <strong>Debug Info (Last checked: {new Date(debugInfo.timestamp).toLocaleTimeString()})</strong>
                </Alert>
                
                <div className="mb-3">
                  <strong>User ID:</strong> {debugInfo.userId}
                </div>
                
                <div className="mb-3">
                  <strong>Level:</strong> {debugInfo.level}
                </div>
                
                <div className="mb-3">
                  <strong>Can Access Admin:</strong> {debugInfo.adminAccess ? 'YES' : 'NO'}
                </div>
                
                <div className="mb-3">
                  <strong>Is Owner:</strong> {debugInfo.ownerStatus ? 'YES' : 'NO'}
                </div>
                
                <div className="mb-3">
                  <strong>User Roles ({debugInfo.userRoles.length}):</strong>
                  <ul>
                    {debugInfo.userRoles.map((ur, index) => (
                      <li key={index}>
                        {ur.roleId} - Level: {ur.role?.level} - Name: {ur.role?.name}
                        <br />
                        Permissions: {ur.role?.permissions?.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PermissionDebug;