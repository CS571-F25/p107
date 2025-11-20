// Post Management Component for Dashboard
import { useState, useEffect, useContext } from 'react';
import { Table, Button, Badge, Form, Alert, Modal, Dropdown, ButtonGroup } from 'react-bootstrap';
import { getPosts, publishPost, unpublishPost, deletePost } from '../../services/blogService';
import { useUserPermissions } from '../../hooks/usePermissions';
import ThemeContext from '../contexts/ThemeContext';

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const { theme } = useContext(ThemeContext);
  const { canManageAll, isOwner } = useUserPermissions();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getPosts(100, { status: 'all' });
      
      // Apply filter
      let filteredPosts = fetchedPosts;
      if (filter !== 'all') {
        filteredPosts = fetchedPosts.filter(post => post.status === filter);
      }
      
      setPosts(filteredPosts);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      if (newStatus === 'published') {
        await publishPost(postId);
      } else {
        await unpublishPost(postId);
      }
      fetchPosts(); // Refresh list
    } catch (err) {
      setError(`Failed to update post status: ${err.message}`);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await deletePost(postToDelete.id);
      setShowDeleteModal(false);
      setPostToDelete(null);
      fetchPosts(); // Refresh list
    } catch (err) {
      setError(`Failed to delete post: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      archived: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center p-4">Loading posts...</div>;
  }

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Filter Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="all">All Posts</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="archived">Archived</option>
        </Form.Select>
        
        <Button variant="primary" href="#/editor/new">
          New Article
        </Button>
      </div>

      {/* Posts Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Author</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                {filter === 'all' ? 'No articles found' : `No ${filter} articles`}
              </td>
            </tr>
          ) : (
            posts.map(post => (
              <tr key={post.id}>
                <td>
                  <a href={`#/blog/${post.slug}`} className="text-decoration-none">
                    {post.title}
                  </a>
                </td>
                <td>{getStatusBadge(post.status)}</td>
                <td>{post.author || 'Unknown'}</td>
                <td>{new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                <td>
                  <Dropdown as={ButtonGroup}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      href={`#/editor/${post.id}`}
                    >
                      Edit
                    </Button>
                    
                    <Dropdown.Toggle split variant="outline-primary" size="sm" />
                    
                    <Dropdown.Menu>
                      {post.status === 'draft' && (
                        <Dropdown.Item onClick={() => handleStatusChange(post.id, 'published')}>
                          Publish
                        </Dropdown.Item>
                      )}
                      {post.status === 'published' && (
                        <Dropdown.Item onClick={() => handleStatusChange(post.id, 'draft')}>
                          Unpublish
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
            ))
          )}
        </tbody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePost}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}