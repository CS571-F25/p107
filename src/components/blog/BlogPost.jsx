import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Row, Col, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { getPost } from '../../services/blogService';
import AuthorCard from './AuthorCard';
import ThemeContext from '../contexts/ThemeContext';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const fetchedPost = await getPost(id);
        setPost(fetchedPost);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Post not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

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
              <Button variant="outline-primary" size="sm">
                <i className="bi bi-heart me-1"></i>
                Like {post.likes > 0 && `(${post.likes})`}
              </Button>
              <Button variant="outline-secondary" size="sm">
                <i className="bi bi-share me-1"></i>
                Share
              </Button>
            </div>
          </article>
        </Col>
      </Row>
    </Container>
  );
}