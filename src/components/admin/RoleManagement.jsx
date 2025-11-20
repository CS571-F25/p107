// Role Management Component - Only for Owner
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Modal, Badge, Dropdown } from 'react-bootstrap';
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

  const cardStyle = {};

  return (
    <Container fluid style={{ maxWidth: '1400px', padding: '2rem 1rem' }}>
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Role Management</h2>
              <p className="text-muted mb-0">Manage user roles and related actions</p>
            </div>
            <Button 
              variant="primary"
              onClick={handleCleanupRoles}
              disabled={cleaning}
            >
              {cleaning ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Cleaning...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Cleanup Roles
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card style={cardStyle}>
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'all') {
                        fetchUsersWithRoles();
                      } else {
                        setUsers(prev => prev.filter(u => (u.roles || []).includes(val)));
                      }
                    }}
                    defaultValue="all"
                  >
                    <option value="all">All Roles</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="verified_user">Verified User</option>
                    <option value="unverified_user">Unverified User</option>
                    <option value="guest">Guest</option>
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Control
                    type="text"
                    placeholder="Search by email"
                    onChange={(e) => {
                      const q = e.target.value.trim().toLowerCase();
                      if (!q) {
                        fetchUsersWithRoles();
                        return;
                      }
                      setUsers(prev => prev.filter(u => (u.email || '').toLowerCase().includes(q)));
                    }}
                  />
                </Col>

                <Col md={6} />
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card style={cardStyle}>
            <Card.Body>
              <Table responsive hover className="mb-0">
        <thead>
          <tr>
                    <th>User</th>
                    <th>Current Roles</th>
                    <th style={{ width: '160px' }} className="text-end">Actions</th>
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

                          <td className="text-end">
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu align="end">
                                <Dropdown.Item
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setNewRole(user.roles[0] || 'unverified_user');
                                    setShowRoleModal(true);
                                  }}
                                  disabled={user.isCurrentUser}
                                >
                                  Change Role
                                </Dropdown.Item>
                                <Dropdown.Item disabled={true} className={user.isCurrentUser ? '' : 'd-none'}>
                                  Current User
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
              </tr>
            ))
          )}
        </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
    </Container>
  );
}