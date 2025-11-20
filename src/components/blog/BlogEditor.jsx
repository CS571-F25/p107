// Enhanced blog post editor with draft saving, publishing controls, and cover image management
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Alert, 
  Card, 
  Badge, 
  Modal,
  Toast,
  ToastContainer,
  ButtonGroup 
} from 'react-bootstrap';
import { 
  createPost, 
  updatePost, 
  getPost, 
  publishPost, 
  unpublishPost,
  generateSlug,
  POST_STATUS 
} from '../../services/blogService';
import { usePostPermissions } from '../../hooks/usePermissions';
import { withPermission } from '../auth/PermissionGates';
import ThemeContext from '../contexts/ThemeContext';
import LoginStatusContext from '../contexts/LoginStatusContext';

function BlogEditor() {
  const { id } = useParams(); // If editing existing post
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    coverImage: '',
    slug: '',
    status: POST_STATUS.DRAFT
  });
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(LoginStatusContext);
  const isDark = theme === 'dark';
  
  const { permissions } = usePostPermissions(formData.authorId);

  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  // Auto-save every 30 seconds when editing
  useEffect(() => {
    if (isEditing && formData.title) {
      const interval = setInterval(() => {
        handleAutoSave();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [formData, isEditing]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const post = await getPost(id);
      setFormData({
        title: post.title || '',
        subtitle: post.subtitle || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        category: post.category || '',
        tags: post.tags ? post.tags.join(', ') : '',
        coverImage: post.coverImage || '',
        slug: post.slug || '',
        status: post.status || POST_STATUS.DRAFT,
        authorId: post.authorId
      });
    } catch (err) {
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!isEditing || !formData.title.trim()) return;

    try {
      setAutoSaveStatus('Saving...');
      await updatePost(id, {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        slug: formData.slug || generateSlug(formData.title)
      });
      setAutoSaveStatus('Saved');
      setLastSaved(new Date());
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (err) {
      setAutoSaveStatus('Save failed');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from title
    if (name === 'title' && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaveLoading(true);
      setMessage('');
      setError('');

      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }

      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        slug: formData.slug || generateSlug(formData.title),
        status: POST_STATUS.DRAFT,
        readTime: Math.ceil(formData.content.split(' ').length / 200)
      };

      if (isEditing) {
        await updatePost(id, postData);
        setMessage('Draft updated successfully!');
      } else {
        const newPostId = await createPost(postData);
        setMessage('Draft saved successfully!');
        navigate(`/editor/${newPostId}`, { replace: true });
      }
      
      setLastSaved(new Date());
    } catch (err) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishLoading(true);
      setError('');

      // Validation
      if (!formData.title.trim() || !formData.content.trim()) {
        setError('Title and content are required for publishing');
        return;
      }

      if (!formData.excerpt.trim()) {
        setError('Excerpt is required for publishing');
        return;
      }

      let postId = id;

      // Save as draft first if new post
      if (!isEditing) {
        const postData = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          slug: formData.slug || generateSlug(formData.title),
          status: POST_STATUS.DRAFT,
          readTime: Math.ceil(formData.content.split(' ').length / 200)
        };
        postId = await createPost(postData);
      } else {
        // Update existing post
        const postData = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          slug: formData.slug || generateSlug(formData.title),
          readTime: Math.ceil(formData.content.split(' ').length / 200)
        };
        await updatePost(id, postData);
      }

      // Now publish
      await publishPost(postId);
      
      setMessage('Post published successfully!');
      setShowPublishModal(false);
      
      // Navigate to published post
      setTimeout(() => {
        navigate(`/blog/${formData.slug || generateSlug(formData.title)}`);
      }, 1000);

    } catch (err) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setPublishLoading(true);
      await unpublishPost(id);
      setMessage('Post unpublished successfully!');
      setFormData(prev => ({ ...prev, status: POST_STATUS.DRAFT }));
    } catch (err) {
      setError(err.message || 'Failed to unpublish post');
    } finally {
      setPublishLoading(false);
    }
  };

  const renderPreview = () => {
    return (
      <div>
        <h1>{formData.title}</h1>
        {formData.subtitle && <h2 className="text-muted">{formData.subtitle}</h2>}
        {formData.coverImage && (
          <img 
            src={formData.coverImage} 
            alt="Cover" 
            className="img-fluid mb-3" 
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
        )}
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {formData.content}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading editor...</p>
        </div>
      </Container>
    );
  }

  const containerStyle = {
    backgroundColor: isDark ? '#1a1a1a' : '#fff',
    minHeight: '100vh'
  };

  const cardStyle = {
    backgroundColor: isDark ? '#2d3748' : '#fff',
    borderColor: isDark ? '#4a5568' : '#dee2e6'
  };

  return (
    <div style={containerStyle}>
      <Container fluid style={{ maxWidth: '1200px', padding: '2rem 1rem' }}>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  {isEditing ? 'Edit Post' : 'Create New Post'}
                </h2>
                <div className="d-flex align-items-center gap-3">
                  {formData.status && (
                    <Badge 
                      bg={formData.status === POST_STATUS.PUBLISHED ? 'success' : 'secondary'}
                    >
                      {formData.status}
                    </Badge>
                  )}
                  {autoSaveStatus && (
                    <small className="text-muted">
                      {autoSaveStatus}
                    </small>
                  )}
                  {lastSaved && (
                    <small className="text-muted">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </small>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline-info"
                  onClick={() => setShowPreview(true)}
                  disabled={!formData.title || !formData.content}
                >
                  Preview
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={saveLoading || !formData.title}
                >
                  {saveLoading ? 'Saving...' : 'Save Draft'}
                </Button>
                {formData.status === POST_STATUS.PUBLISHED ? (
                  <Button
                    variant="warning"
                    onClick={handleUnpublish}
                    disabled={publishLoading || !permissions.canPublish}
                  >
                    {publishLoading ? 'Unpublishing...' : 'Unpublish'}
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={() => setShowPublishModal(true)}
                    disabled={!formData.title || !formData.content || !permissions.canPublish}
                  >
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Messages */}
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
          <Col lg={8}>
            <Card style={cardStyle}>
              <Card.Body>
                <Form>
                  {/* Title */}
                  <Form.Group className="mb-3">
                    <Form.Label>Title *</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter post title"
                      required
                    />
                  </Form.Group>

                  {/* Subtitle */}
                  <Form.Group className="mb-3">
                    <Form.Label>Subtitle</Form.Label>
                    <Form.Control
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      placeholder="Enter subtitle (optional)"
                    />
                  </Form.Group>

                  {/* Slug */}
                  <Form.Group className="mb-3">
                    <Form.Label>URL Slug</Form.Label>
                    <Form.Control
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="url-friendly-slug"
                    />
                    <Form.Text className="text-muted">
                      Auto-generated from title if left empty
                    </Form.Text>
                  </Form.Group>

                  {/* Content */}
                  <Form.Group className="mb-3">
                    <Form.Label>Content *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={15}
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Write your post content here... (Markdown supported)"
                      required
                    />
                  </Form.Group>

                  {/* Excerpt */}
                  <Form.Group className="mb-3">
                    <Form.Label>Excerpt</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="Brief description for post preview"
                    />
                    <Form.Text className="text-muted">
                      Used in post cards and social sharing
                    </Form.Text>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card style={cardStyle}>
              <Card.Header>Post Settings</Card.Header>
              <Card.Body>
                <Form>
                  {/* Category */}
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      <option value="Travel">Travel</option>
                      <option value="Technology">Technology</option>
                      <option value="Life">Life</option>
                      <option value="Business">Business</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Tags */}
                  <Form.Group className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="tag1, tag2, tag3"
                    />
                    <Form.Text className="text-muted">
                      Separate tags with commas
                    </Form.Text>
                  </Form.Group>

                  {/* Cover Image */}
                  <Form.Group className="mb-3">
                    <Form.Label>Cover Image URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.coverImage && (
                      <div className="mt-2">
                        <img
                          src={formData.coverImage}
                          alt="Cover preview"
                          className="img-fluid rounded"
                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Preview Modal */}
        <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {renderPreview()}
          </Modal.Body>
        </Modal>

        {/* Publish Confirmation Modal */}
        <Modal show={showPublishModal} onHide={() => setShowPublishModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Publish Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you ready to publish this post?</p>
            <p><strong>Title:</strong> {formData.title}</p>
            <p><strong>Slug:</strong> {formData.slug || generateSlug(formData.title)}</p>
            {!formData.excerpt && (
              <Alert variant="warning">
                Consider adding an excerpt for better social sharing.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handlePublish}
              disabled={publishLoading}
            >
              {publishLoading ? 'Publishing...' : 'Publish Now'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast notifications */}
        <ToastContainer position="bottom-end" className="p-3">
          {/* Additional toast notifications can be added here */}
        </ToastContainer>
      </Container>
    </div>
  );
}

// Wrap with permission check - only authors and above can access
export default withPermission(BlogEditor, 'blog:write-own');