// System initialization and setup utilities
import { useState, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Accordion, Badge } from 'react-bootstrap';
import { 
  initializeRoles, 
  assignRole, 
  makeOwner,
  getUserRoles,
  assignDefaultRole,
  makeCurrentUserOwner,
  removeAllUserRoles
} from '../../services/roleService';
import { createPost } from '../../services/blogService';
import { useUserPermissions } from '../../hooks/usePermissions';
import { auth } from '../../firebase/config';
import LoginStatusContext from '../contexts/LoginStatusContext';
import ThemeContext from '../contexts/ThemeContext';
import PermissionDebug from './PermissionDebug';

export default function SystemSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [userRoles, setUserRoles] = useState(null);
  const { isLoggedIn, user } = useContext(LoginStatusContext);
  const { theme } = useContext(ThemeContext);
  const { level, isOwner, isAdmin, canAccessAdmin } = useUserPermissions();
  const isDark = theme === 'dark';

  const handleCheckUserRoles = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!isLoggedIn) {
        setError('You must be logged in to check roles');
        return;
      }

      const userId = auth.currentUser?.uid;
      const roles = await getUserRoles(userId);
      setUserRoles(roles);
      const roleCount = roles.length;
      setMessage(`Found ${roleCount} role${roleCount === 1 ? '' : 's'} for current user`);
    } catch (err) {
      setError(`Error checking roles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeRoles = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      await initializeRoles();
      setMessage('Default roles created successfully! (owner, admin, author, user, guest)');
    } catch (err) {
      setError(`Error initializing roles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOwnerRole = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      if (!isLoggedIn) {
        setError('You must be logged in to assign owner role');
        return;
      }

      // Use the new exclusive owner assignment function
      await makeCurrentUserOwner();
      setMessage(`Owner role assigned exclusively to ${user?.email || 'current user'}! All previous roles removed.`);
      
      // Force refresh permission display
      setTimeout(() => {
        handleCheckUserRoles();
        window.location.reload(); // Force page reload to refresh all hooks
      }, 1000);
    } catch (err) {
      setError(`Error assigning owner role: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetMyRoles = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      if (!isLoggedIn) {
        setError('You must be logged in to reset roles');
        return;
      }

      const userId = auth.currentUser?.uid;
      // Remove all roles first
      await removeAllUserRoles(userId);
      // Then assign default user role (minimum permission for logged in users)
      await assignRole(userId, 'user', 'system-reset');
      
      setMessage('Your roles have been reset to default User level.');
      
      // Force refresh permission display
      setTimeout(() => {
        handleCheckUserRoles();
        window.location.reload(); // Force page reload to refresh all hooks
      }, 1000);
    } catch (err) {
      setError(`Error resetting roles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDefaultRole = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      if (!isLoggedIn) {
        setError('You must be logged in');
        return;
      }

      const userId = auth.currentUser?.uid;
      await assignDefaultRole(userId);
      setMessage('Default user role assigned successfully!');
    } catch (err) {
      setError(`Error assigning default role: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSamplePosts = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      const samplePosts = [
        {
          title: "Welcome to Orient Way",
          subtitle: "A journey begins with a single step",
          content: `# Welcome to Orient Way

This is the beginning of a new adventure in digital storytelling. Orient Way is where I document my journeys, both physical and digital.

## What You'll Find Here

- **Travel Stories**: Adventures from around the world
- **Tech Insights**: Lessons learned in the startup world
- **Life Reflections**: Thoughts on growth and change
- **Cultural Observations**: Perspectives from different places

## The Journey Ahead

Stay tuned for stories about raising funding, walking across continents, living in South America, and building technology that matters.

*Every journey starts with a single step, and this is ours.*`,
          excerpt: "Welcome to Orient Way - where travel meets technology and stories come alive.",
          category: "Life",
          tags: ["welcome", "introduction", "travel", "technology"],
          slug: "welcome-to-orient-way",
          status: "published",
          author: "Eliot Zhu",
          coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"
        },
        {
          title: "Building in Public: The Startup Journey",
          subtitle: "Lessons from the entrepreneurial trenches",
          content: `# Building in Public: The Startup Journey

## The Beginning

Starting a company is like jumping off a cliff and building a plane on the way down. Here's what I learned along the way.

### Lesson 1: Validation is Everything

Before writing a single line of code, make sure people actually want what you're building.

### Lesson 2: Team is Everything

The right co-founder can make all the difference. Choose wisely.

### Lesson 3: Persistence Pays

Some days you'll want to quit. Those are the days that define you.

## The Road Ahead

Building something meaningful takes time, patience, and a lot of coffee.`,
          excerpt: "Reflections on the startup journey, from idea to execution and everything in between.",
          category: "Business",
          tags: ["startup", "entrepreneurship", "lessons", "building"],
          slug: "building-in-public-startup-journey",
          status: "draft",
          author: "Eliot Zhu"
        },
        {
          title: "The Art of Slow Travel",
          subtitle: "Why rushing misses the point",
          content: `# The Art of Slow Travel

## Moving Slowly

In a world obsessed with efficiency, slow travel is a radical act.

When you slow down, you notice things:
- The way morning light hits a plaza
- How locals interact with each other  
- The rhythm of a place

## Lessons from the Road

Every place has stories to tell, but only if you're willing to listen.

### South America Taught Me

- Time moves differently in different places
- Patience is a superpower
- The best conversations happen in unexpected places

*Some places shape you so fundamentally that you carry them with you wherever you go.*`,
          excerpt: "Reflections on the beauty and importance of taking your time while traveling.",
          category: "Travel",
          tags: ["travel", "philosophy", "slow-living", "south-america"],
          slug: "art-of-slow-travel",
          status: "published",
          author: "Eliot Zhu",
          coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
        }
      ];

      const results = [];
      for (const post of samplePosts) {
        const postId = await createPost({
          ...post,
          readTime: Math.ceil(post.content.split(' ').length / 200)
        });
        results.push(postId);
      }
      
      setMessage(`Successfully created ${results.length} sample blog posts!`);
    } catch (err) {
      setError(`Error creating sample posts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: isDark ? '#1f2937' : '#fff',
    borderColor: isDark ? '#374151' : '#dee2e6'
  };

  return (
    <Container fluid style={{ maxWidth: '1400px', padding: '2rem 1rem' }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">System Setup</h2>
              <p className="text-muted mb-0">Initialize your blog system and configure permissions</p>
            </div>
          </div>
        </Col>
      </Row>

      {message && (
        <Alert variant="success" onClose={() => setMessage('')} dismissible>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Row className="g-4">
        {/* Role System Setup - primary actions */}
        <Col md={6}>
          <Card style={cardStyle}>
            <Card.Header>
              <h5 className="mb-0">Role System Setup</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Initialize and manage core role settings.</p>

              <div className="d-grid gap-2">
                {isOwner && (
                  <Button
                    variant="primary"
                    onClick={handleInitializeRoles}
                    disabled={loading}
                  >
                    {loading ? 'Initializing...' : 'Initialize Roles'}
                  </Button>
                )}

                <Button
                  variant="outline-secondary"
                  onClick={handleAssignDefaultRole}
                  disabled={loading || !isLoggedIn}
                >
                  {loading ? 'Assigning...' : 'Assign Default Role'}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={handleCheckUserRoles}
                  disabled={loading || !isLoggedIn}
                >
                  {loading ? 'Checking...' : 'Check My Roles'}
                </Button>

                {isOwner && (
                  <Button
                    variant="outline-secondary"
                    onClick={handleResetMyRoles}
                    disabled={loading || !isLoggedIn}
                  >
                    {loading ? 'Resetting...' : 'Reset to User Role'}
                  </Button>
                )}

                <Button
                  variant="outline-secondary"
                  onClick={() => window.location.reload()}
                  disabled={loading}
                >
                  Refresh Page
                </Button>
              </div>

              {!isLoggedIn && (
                <Alert variant="info" className="mt-3 mb-0">
                  Please log in to assign roles to your account.
                </Alert>
              )}

              {/* Status panel */}
              {isLoggedIn && (
                <Card className="mt-3" style={cardStyle}>
                  <Card.Body className="py-2">
                    <div className="d-flex align-items-center">
                      <strong className="me-3">Current Status</strong>
                      <div className="text-muted small">
                        <Badge bg="secondary" className="me-2">Level: {level}</Badge>
                        <Badge bg={isOwner ? 'danger' : 'light'} text={isOwner ? undefined : 'dark'} className="me-2">Owner: {isOwner ? 'Yes' : 'No'}</Badge>
                        <Badge bg={isAdmin ? 'warning' : 'light'} text={isAdmin ? undefined : 'dark'} className="me-2">Admin: {isAdmin ? 'Yes' : 'No'}</Badge>
                        <Badge bg={canAccessAdmin ? 'success' : 'light'} text={canAccessAdmin ? undefined : 'dark'}>Admin Access: {canAccessAdmin ? 'Yes' : 'No'}</Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Role details */}
              {userRoles && (
                <Card className="mt-3" style={cardStyle}>
                  <Card.Body className="py-2 small text-muted">
                    <strong>Your Roles:</strong>
                    <div className="mt-1">
                      {userRoles.length === 0 ? (
                        'No roles assigned'
                      ) : (
                        userRoles.map((ur, index) => (
                          <div key={index}>- {ur.role?.name || ur.roleId} (Level: {ur.role?.level})</div>
                        ))
                      )}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sample Content */}
        <Col md={6}>
          <Card style={cardStyle}>
            <Card.Header>
              <h5 className="mb-0">Sample Content</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Create example posts to test site behavior.</p>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  onClick={handleCreateSamplePosts}
                  disabled={loading || !isLoggedIn}
                >
                  {loading ? 'Creating...' : 'Create Sample Posts'}
                </Button>
              </div>

              {!isLoggedIn && (
                <Alert variant="info" className="mt-3 mb-0">
                  Please log in to create sample content.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Advanced / Debug Tools - collapsed */}
        <Col md={12}>
          <Accordion defaultActiveKey={null}>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Advanced / Debug Tools</Accordion.Header>
              <Accordion.Body>
                <Card style={cardStyle} className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Manual Setup Instructions</h6>
                  </Card.Header>
                  <Card.Body>
                    <h6>Firestore Console Setup (Alternative Method)</h6>
                    <p className="text-muted">If you prefer to set up manually through the Firestore console:</p>
                    <ol className="text-muted">
                      <li>Go to your Firebase Console → Firestore Database</li>
                      <li>Create a new collection called <code>userRoles</code></li>
                      <li>Add a document with these fields:
                        <ul>
                          <li><code>userId</code>: Your Firebase Auth UID</li>
                          <li><code>roleId</code>: "owner"</li>
                          <li><code>assignedBy</code>: "manual"</li>
                          <li><code>assignedAt</code>: Current timestamp</li>
                        </ul>
                      </li>
                      <li>Click "Initialize Roles" above to create the role definitions</li>
                    </ol>

                    <Alert variant="warning">
                      <strong>Important:</strong> Only assign the owner role to trusted administrators. The owner role has full system access and cannot be restricted.
                    </Alert>
                  </Card.Body>
                </Card>

                <Card style={cardStyle} className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Permission Debug Tool</h6>
                  </Card.Header>
                  <Card.Body>
                    <PermissionDebug />
                  </Card.Body>
                </Card>

                <div className="text-end">
                  {isOwner && (
                    <Button
                      variant="outline-danger"
                      onClick={handleAssignOwnerRole}
                      disabled={loading || !isLoggedIn}
                    >
                      {loading ? 'Assigning...' : 'Make Me Owner (Exclusive)'}
                    </Button>
                  )}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
}