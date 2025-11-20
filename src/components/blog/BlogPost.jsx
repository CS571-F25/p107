import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Row, Col, Spinner, Alert, Badge, Button, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { getPostBySlug } from '../../services/blogService';
import { toggleLike } from '../../services/likeService';
import { usePostPermissions } from '../../hooks/usePermissions';
import { PermissionGate } from '../auth/PermissionGates';
import { auth } from '../../firebase/config';
import AuthorCard from './AuthorCard';
import ThemeContext from '../contexts/ThemeContext';
import LoginStatusContext from '../contexts/LoginStatusContext';

export default function BlogPost() {
  const { slug } = useParams(); // Using slug instead of id
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(LoginStatusContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const fetchedPost = await getPostBySlug(slug);
        setPost(fetchedPost);
        
        // Update page title and meta tags
        updatePageMeta(fetchedPost);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Post not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const updatePageMeta = (postData) => {
    // Update page title
    document.title = `${postData.title} - Orient Way`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', postData.excerpt || postData.title);
    }

    // Update Open Graph tags
    updateOGTags(postData);
  };

  const updateOGTags = (postData) => {
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/blog/${postData.slug}`;
    
    // Helper function to update or create meta tag
    const updateMetaTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update OG tags
    updateMetaTag('og:title', postData.title);
    updateMetaTag('og:description', postData.excerpt || postData.title);
    updateMetaTag('og:url', postUrl);
    updateMetaTag('og:type', 'article');
    
    if (postData.coverImage) {
      updateMetaTag('og:image', postData.coverImage);
    }
    
    // Article-specific tags
    updateMetaTag('article:published_time', postData.publishedAt?.toISOString());
    updateMetaTag('article:author', postData.author || 'Orient Way');
    
    if (postData.tags && postData.tags.length > 0) {
      postData.tags.forEach(tag => {
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.setAttribute('content', tag);
        document.head.appendChild(tagMeta);
      });
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', postData.title);
    updateMetaTag('twitter:description', postData.excerpt || postData.title);
    if (postData.coverImage) {
      updateMetaTag('twitter:image', postData.coverImage);
    }
  };

  const handleLike = async () => {
    console.log('🔍 handleLike called, isLoggedIn:', isLoggedIn);
    if (!isLoggedIn) {
      console.log('🚫 User not logged in, showing toast');
      setToastMessage('😊 请先注册并登录才能点赞文章！只有注册用户才能表达对文章的喜爱。');
      setShowToast(true);
      return;
    }

    try {
      setLikeLoading(true);
      const result = await toggleLike(post.id, auth.currentUser?.uid); // Pass current user's ID
      
      // Update local state
      setPost(prev => ({
        ...prev,
        userHasLiked: result.liked,
        likeCount: result.total
      }));

      setToastMessage(result.message);
      setShowToast(true);
    } catch (error) {
      console.error('Error toggling like:', error);
      setToastMessage('点赞操作失败，请稍后再试');
      setShowToast(true);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = (platform) => {
    const postUrl = window.location.href;
    const title = post.title;
    const text = post.excerpt || title;

    let shareUrl = '';
    
    switch (platform) {
      case 'x':
        shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
        setShowShareModal(false);
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareModal(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading post...</p>
        </div>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Post Not Found</h4>
          <p>{error || 'The post you are looking for does not exist.'}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simple markdown-like text processing for better readability
  const processContent = (content) => {
    if (!content) return '';
    
    // Split content into lines and process each line
    const lines = content.split('\n');
    const processedLines = lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <h2 key={index} style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            marginTop: index > 0 ? '2rem' : '0',
            marginBottom: '1rem',
            color: isDark ? '#f8f9fa' : '#212529'
          }}>
            {line.substring(2)}
          </h2>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
            color: isDark ? '#f8f9fa' : '#212529'
          }}>
            {line.substring(3)}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginTop: '1.25rem',
            marginBottom: '0.5rem',
            color: isDark ? '#f8f9fa' : '#212529'
          }}>
            {line.substring(4)}
          </h4>
        );
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} style={{ marginBottom: '1rem' }}>
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }
      
      // Italic text  
      if (line.includes('*') && !line.includes('**')) {
        const parts = line.split('*');
        return (
          <p key={index} style={{ marginBottom: '1rem' }}>
            {parts.map((part, i) => 
              i % 2 === 1 ? <em key={i}>{part}</em> : part
            )}
          </p>
        );
      }
      
      // List items
      if (line.startsWith('- ')) {
        return (
          <li key={index} style={{ 
            marginBottom: '0.5rem',
            listStyle: 'disc',
            marginLeft: '1.5rem'
          }}>
            {line.substring(2)}
          </li>
        );
      }
      
      // Empty lines for spacing
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Regular paragraphs
      return (
        <p key={index} style={{ marginBottom: '1rem' }}>
          {line}
        </p>
      );
    });
    
    return processedLines;
  };
  const articleContentStyle = {
    fontSize: '1.1rem',
    lineHeight: '1.7',
    color: isDark ? '#e9ecef' : '#333'
  };

  const titleStyle = {
    fontWeight: '700',
    lineHeight: '1.2',
    color: isDark ? '#f8f9fa' : 'inherit'
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    fontWeight: '400',
    lineHeight: '1.4',
    color: isDark ? '#adb5bd' : '#6c757d'
  };

  const tagStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(108, 117, 125, 0.1)',
    color: isDark ? '#adb5bd' : '#6c757d',
    border: 'none',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem'
  };

  const metaTextStyle = {
    color: isDark ? '#adb5bd' : '#6c757d'
  };

  const borderStyle = {
    borderColor: isDark ? '#495057' : '#dee2e6'
  };

  return (
    <Container fluid style={{ maxWidth: '1200px', padding: '1rem' }}>
      <Row className="g-4">
        {/* Left sidebar: Author info card */}
        <Col lg={4} xl={3}>
          <AuthorCard />
        </Col>

        {/* Right side: Article content */}
        <Col lg={8} xl={9}>
          {/* Back button */}
          <div className="mb-3">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => navigate('/')}
              className="d-flex align-items-center gap-2"
            >
              <i className="bi bi-arrow-left"></i>
              Back to Home
            </Button>
          </div>

          {/* Article header */}
          <article>
            {/* Category and meta info */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
              {post.category && (
                <Badge bg="primary" className="text-uppercase">
                  {post.category}
                </Badge>
              )}
              <small style={metaTextStyle}>
                {formatDate(post.publishedAt)}
              </small>
              {post.readTime && (
                <small style={metaTextStyle}>
                  {post.readTime} min read
                </small>
              )}
              {post.views && (
                <small style={metaTextStyle}>
                  {post.views} views
                </small>
              )}
            </div>

            {/* Title and subtitle */}
            <h1 className="mb-2" style={titleStyle}>
              {post.title}
            </h1>
            
            {post.subtitle && (
              <h2 className="mb-4" style={subtitleStyle}>
                {post.subtitle}
              </h2>
            )}

            {/* Cover image */}
            {post.coverImage && (
              <div className="mb-4">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="img-fluid rounded"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            )}

            {/* Article content */}
            <div className="mb-4" style={articleContentStyle}>
              {/* Processed markdown-like content */}
              <div>
                {processContent(post.content)}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-4">
                <h6 style={metaTextStyle} className="mb-2">Tags:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      style={tagStyle}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction buttons */}
            <div className="d-flex gap-3 py-3 border-top" style={borderStyle}>
              <Button 
                variant={post.userHasLiked ? "primary" : "outline-primary"} 
                size="sm"
                onClick={handleLike}
                disabled={likeLoading}
                title={!isLoggedIn ? "请先登录才能点赞" : "点赞这篇文章"}
                style={!isLoggedIn ? { opacity: 0.7 } : {}}
              >
                <i className={`bi ${post.userHasLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
                {likeLoading ? 'Loading...' : `Like${post.likeCount > 0 ? ` (${post.likeCount})` : ''}`}
              </Button>
              
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setShowShareModal(true)}
              >
                <i className="bi bi-share me-1"></i>
                Share
              </Button>

              {/* Post management buttons for authorized users */}
              <PermissionGate permission="blog:write-own">
                {post.authorId === auth.currentUser?.uid && (
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => navigate(`/editor/${post.id}`)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </Button>
                )}
              </PermissionGate>

              <PermissionGate permission="blog:publish-all">
                <Button 
                  variant={post.status === 'published' ? "outline-warning" : "outline-success"} 
                  size="sm"
                  onClick={() => {
                    if (post.status === 'published') {
                      // Unpublish
                      console.log('Unpublish post');
                    } else {
                      // Publish
                      console.log('Publish post');
                    }
                  }}
                >
                  <i className={`bi ${post.status === 'published' ? 'bi-eye-slash' : 'bi-eye'} me-1`}></i>
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
              </PermissionGate>
            </div>
          </article>
        </Col>
      </Row>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton style={{ 
          backgroundColor: isDark ? '#2d3748' : '#fff',
          borderColor: isDark ? '#4a5568' : '#dee2e6'
        }}>
          <Modal.Title style={{ color: isDark ? '#f7fafc' : '#1a202c' }}>
            Share this post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ 
          backgroundColor: isDark ? '#2d3748' : '#fff',
          color: isDark ? '#f7fafc' : '#1a202c'
        }}>
          <div className="d-grid gap-2">
            <Button 
              variant="outline-primary" 
              onClick={() => handleShare('x')}
              className="d-flex align-items-center justify-content-start"
            >
              <i className="bi bi-twitter-x me-2"></i>
              Share on X
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => handleShare('linkedin')}
              className="d-flex align-items-center justify-content-start"
            >
              <i className="bi bi-linkedin me-2"></i>
              Share on LinkedIn
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => handleShare('copy')}
              className="d-flex align-items-center justify-content-start"
            >
              <i className="bi bi-clipboard me-2"></i>
              Copy link
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Toast notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={isDark ? 'dark' : 'light'}
        >
          <Toast.Body style={{ color: isDark ? '#f7fafc' : '#1a202c' }}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}