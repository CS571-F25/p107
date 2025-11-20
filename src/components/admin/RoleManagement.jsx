// Role Management Component - Only for Owner
import { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal, Badge } from 'react-bootstrap';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { assignRoleExclusive, getUserRoles, cleanupDuplicateRoles } from '../../services/roleService';

export default function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('unverified_user');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);
      
      // Get all user roles
      const userRolesSnapshot = await getDocs(collection(db, 'userRoles'));
      const userRoleMap = {};
      
      userRolesSnapshot.forEach(doc => {
        const data = doc.data();
        if (!userRoleMap[data.userId]) {
          userRoleMap[data.userId] = [];
        }
        userRoleMap[data.userId].push(data.roleId);
      });

      // Try to get user info from userInfo collection, with error handling
      let userInfoMap = {};
      try {
        const userInfoSnapshot = await getDocs(collection(db, 'userInfo'));
        userInfoSnapshot.forEach(doc => {
          const data = doc.data();
          userInfoMap[doc.id] = data;
        });
      } catch (userInfoError) {
        console.warn('Could not load userInfo collection:', userInfoError);
        // Continue without user info
      }

      const usersWithRoles = Object.entries(userRoleMap).map(([userId, roles]) => {
        const userInfo = userInfoMap[userId];
        return {
          id: userId,
          email: userInfo?.email || (userId === auth.currentUser?.uid ? auth.currentUser?.email : userId),
          nickname: userInfo?.nickname || userInfo?.email?.split('@')[0] || userId.slice(0, 8),
          roles: roles,
          isCurrentUser: userId === auth.currentUser?.uid
        };
      });

      setUsers(usersWithRoles);
    } catch (err) {
      setError(`Failed to load users: ${err.message}`);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    
    try {
      setError('');
      setSuccess('');
      
      if (selectedUser.isCurrentUser && newRole !== 'owner') {
        setError('You cannot change your own role from Owner');
        return;
      }

      await assignRoleExclusive(selectedUser.id, newRole, auth.currentUser?.uid);
      setSuccess(`Successfully changed ${selectedUser.email}'s role to ${newRole}`);
      setShowRoleModal(false);
      setSelectedUser(null);
      
      // Refresh the list
      setTimeout(fetchUsersWithRoles, 1000);
    } catch (err) {
      setError(`Failed to change role: ${err.message}`);
    }
  };

  const handleCleanupRoles = async () => {
    try {
      setCleaning(true);
      setError('');
      setSuccess('');
      
      const cleanedCount = await cleanupDuplicateRoles();
      setSuccess(`Successfully cleaned up ${cleanedCount} duplicate roles`);
      
      // Refresh the list immediately
      await fetchUsersWithRoles();
    } catch (err) {
      setError(`Failed to cleanup roles: ${err.message}`);
    } finally {
      setCleaning(false);
    }
  };

  const getRoleBadge = (role, index) => {
    const variants = {
      owner: 'danger',
      admin: 'warning', 
      verified_user: 'success',
      unverified_user: 'info',
      guest: 'light'
    };
    const labels = {
      owner: 'Owner',
      admin: 'Admin',
      verified_user: 'Verified User',
      unverified_user: 'Unverified User', 
      guest: 'Guest'
    };
    return <Badge key={index} bg={variants[role] || 'secondary'} className="me-1">{labels[role] || role}</Badge>;
  };

  if (loading) {
    return <div className="text-center p-4">Loading users...</div>;
  }

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>User Role Management</h5>
        <div>
          <Button 
            variant="outline-warning" 
            size="sm" 
            onClick={handleCleanupRoles}
            disabled={cleaning}
            className="me-2"
          >
            {cleaning ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Cleaning...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Cleanup Roles
              </>
            )}
          </Button>
          <small className="text-muted">
            Only Owner can change user roles • Every user must have exactly one role
          </small>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>User</th>
            <th>Current Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                No users with roles found
              </td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.id}>
                <td>
                  <div>
                    <strong>{user.email}</strong>
                    {user.nickname && user.nickname !== user.email?.split('@')[0] && (
                      <div><small className="text-muted">({user.nickname})</small></div>
                    )}
                    <div><small className="text-muted font-monospace">ID: {user.id}</small></div>
                  </div>
                  {user.isCurrentUser && <Badge bg="primary" className="ms-2">You</Badge>}
                </td>
                <td>
                  {user.roles.map((role, index) => getRoleBadge(role, index))}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.roles[0] || 'unverified_user');
                      setShowRoleModal(true);
                    }}
                    disabled={user.isCurrentUser}
                  >
                    {user.isCurrentUser ? 'Current User' : 'Change Role'}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Role Change Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Change role for: <strong>{selectedUser?.email}</strong></p>
          <p className="text-muted small">
            Users must have exactly one role. Changing the role will replace the current role.
          </p>
          
          <Form.Group>
            <Form.Label>New Role</Form.Label>
            <Form.Select 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="verified_user">Verified User (Level 2) - Can comment and like</option>
              <option value="unverified_user">Unverified User (Level 3) - Can only read and like</option>
              <option value="admin">Admin (Level 1) - Can manage articles</option>
              {selectedUser?.isCurrentUser && (
                <option value="owner">Owner (Level 0) - Full system access</option>
              )}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangeRole}>
            Update Role
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}