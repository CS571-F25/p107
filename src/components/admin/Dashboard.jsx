// Admin dashboard for blog management
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Modal,
  Alert,
  Dropdown,
  ButtonGroup,
  Pagination
} from 'react-bootstrap';
import { 
  getPosts, 
  publishPost, 
  unpublishPost, 
  deletePost,
  POST_STATUS 
} from '../../services/blogService';
import { withAdminAccess } from '../auth/PermissionGates';
import { useUserPermissions } from '../../hooks/usePermissions';
import { refreshUserPermissions } from '../../services/permissionUtils';
import ThemeContext from '../contexts/ThemeContext';

function Dashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft, archived
  const [authorFilter, setAuthorFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [refreshingPermissions, setRefreshingPermissions] = useState(false);
  
  const { theme } = useContext(ThemeContext);
  const { canManageAll, isOwner } = useUserPermissions();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchPosts();
  }, [filter, authorFilter, currentPage]);

  const handleRefreshPermissions = async () => {
    try {
      setRefreshingPermissions(true);
      await refreshUserPermissions();
      // Reload the page to refresh all permission-dependent components
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      setError('Failed to refresh permissions. Please try again.');
    } finally {
      setRefreshingPermissions(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const filterOptions = {
        status: filter === 'all' ? 'all' : 
               filter === 'published' ? 'published-only' : 
               filter === 'draft' ? 'drafts-only' : 
               'all'
      };

      const fetchedPosts = await getPosts(100, filterOptions); // Get more posts for admin
      
      // Filter by author if specified
      let filteredPosts = fetchedPosts;
      if (authorFilter !== 'all') {
        filteredPosts = fetchedPosts.filter(post => 
          (post.authorId === authorFilter) || 
          (post.author && post.author.toLowerCase().includes(authorFilter.toLowerCase()))
        );
      }

      // Apply additional status filter
      if (filter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.status === filter);
      }

      setPosts(filteredPosts);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      if (newStatus === POST_STATUS.PUBLISHED) {
        await publishPost(postId);
      } else if (newStatus === POST_STATUS.DRAFT) {
        await unpublishPost(postId);
      }
      
      // Refresh posts
      await fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to update post status');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      setShowDeleteModal(false);
      setPostToDelete(null);
      await fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to delete post');
    }
  };

  const handleBatchAction = async (action) => {
    if (selectedPosts.length === 0) return;

    try {
      setBatchLoading(true);
      
      switch (action) {
        case 'publish':
          await Promise.all(selectedPosts.map(id => publishPost(id)));
          break;
        case 'unpublish':
          await Promise.all(selectedPosts.map(id => unpublishPost(id)));
          break;
        case 'delete':
          if (window.confirm(`Delete ${selectedPosts.length} posts?`)) {
            await Promise.all(selectedPosts.map(id => deletePost(id)));
          }
          break;
      }
      
      setSelectedPosts([]);
      await fetchPosts();
    } catch (err) {
      setError(err.message || 'Batch operation failed');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    const currentPagePosts = getCurrentPagePosts();
    const allSelected = currentPagePosts.every(post => selectedPosts.includes(post.id));
    
    if (allSelected) {
      setSelectedPosts(prev => prev.filter(id => !currentPagePosts.map(p => p.id).includes(id)));
    } else {
      setSelectedPosts(prev => [...new Set([...prev, ...currentPagePosts.map(p => p.id)])]);
    }
  };

  const getCurrentPagePosts = () => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return posts.slice(startIndex, startIndex + postsPerPage);
  };

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentPagePosts = getCurrentPagePosts();

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      [POST_STATUS.PUBLISHED]: 'success',
      [POST_STATUS.DRAFT]: 'secondary', 
      [POST_STATUS.ARCHIVED]: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const cardStyle = {
    backgroundColor: isDark ? '#2d3748' : '#fff',
    borderColor: isDark ? '#4a5568' : '#dee2e6'
  };

  return (
    <Container fluid style={{ maxWidth: '1400px', padding: '2rem 1rem' }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Blog Dashboard</h2>
              <p className="text-muted mb-0">Manage your blog posts and content</p>
            </div>
            <Button 
              variant="primary"
              onClick={() => navigate('/editor/new')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              New Post
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Card style={cardStyle}>
            <Card.Body>
              <Row className="g-3">
                {/* Filters */}
                <Col md={3}>
                  <Form.Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Posts</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Control
                    type="text"
                    placeholder="Filter by author"
                    value={authorFilter === 'all' ? '' : authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value || 'all')}
                  />
                </Col>

                {/* Batch Actions */}
                {selectedPosts.length > 0 && (
                  <Col md={6}>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="text-muted">
                        {selectedPosts.length} selected
                      </span>
                      <ButtonGroup>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleBatchAction('publish')}
                          disabled={batchLoading}
                        >
                          Publish
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleBatchAction('unpublish')}
                          disabled={batchLoading}
                        >
                          Unpublish
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleBatchAction('delete')}
                          disabled={batchLoading}
                        >
                          Delete
                        </Button>
                      </ButtonGroup>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card style={cardStyle}>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No posts found</h5>
                  <p className="text-muted">Create your first post to get started!</p>
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/editor/new')}
                  >
                    Create Post
                  </Button>
                </div>
              ) : (
                <>
                  <Table responsive hover className="mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>
                          <Form.Check
                            type="checkbox"
                            checked={currentPagePosts.length > 0 && currentPagePosts.every(post => selectedPosts.includes(post.id))}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Author</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPagePosts.map((post) => (
                        <tr key={post.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedPosts.includes(post.id)}
                              onChange={() => handleSelectPost(post.id)}
                            />
                          </td>
                          <td>
                            <div>
                              <strong>{post.title}</strong>
                              {post.subtitle && (
                                <div className="text-muted small">{post.subtitle}</div>
                              )}
                            </div>
                          </td>
                          <td>{getStatusBadge(post.status)}</td>
                          <td>{post.author || 'Unknown'}</td>
                          <td>{formatDate(post.createdAt)}</td>
                          <td>{formatDate(post.updatedAt)}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => navigate(`/blog/${post.slug || post.id}`)}
                                >
                                  View
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => navigate(`/editor/${post.id}`)}
                                >
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                {post.status === POST_STATUS.PUBLISHED ? (
                                  <Dropdown.Item
                                    onClick={() => handleStatusChange(post.id, POST_STATUS.DRAFT)}
                                  >
                                    Unpublish
                                  </Dropdown.Item>
                                ) : (
                                  <Dropdown.Item
                                    onClick={() => handleStatusChange(post.id, POST_STATUS.PUBLISHED)}
                                  >
                                    Publish
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() => {
                                    setPostToDelete(post);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.Prev 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        />
                        {[...Array(totalPages)].map((_, i) => (
                          <Pagination.Item
                            key={i + 1}
                            active={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {postToDelete && (
            <div>
              <p>Are you sure you want to delete this post?</p>
              <p><strong>"{postToDelete.title}"</strong></p>
              <Alert variant="warning">
                This action cannot be undone.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleDelete(postToDelete?.id)}
          >
            Delete Post
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default withAdminAccess(Dashboard);