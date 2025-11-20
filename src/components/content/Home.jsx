import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { useSearchParams } from 'react-router';
import EmailVerificationAlert from "../auth/EmailVerificationAlert";
import AuthorCard from "../blog/AuthorCard";
import BlogCard from "../blog/BlogCard";
import { AdminGate } from "../auth/PermissionGates";
import { getPosts } from "../../services/blogService";
import { useUserPermissions } from "../../hooks/usePermissions";
import '../../styles/blog-theme-links.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'published');
  const { canAccessAdmin } = useUserPermissions();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching posts with view mode:', viewMode);
        
        const filterOptions = {
          status: viewMode === 'all' ? 'all' : 'published-only'
        };
        
        const fetchedPosts = await getPosts(12, filterOptions); // Get recent 12 posts
        console.log('Posts fetched successfully:', fetchedPosts);
        setPosts(fetchedPosts);
        setError(''); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching posts:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        
        // Check if it's a connection/technical error vs empty collection
        if (err.code === 'unavailable' || err.message.includes('network') || err.message.includes('connection')) {
          setError('Unable to connect to the blog service. Please check your internet connection and try again.');
        } else if (err.code === 'permission-denied') {
          setError('Access denied. Please check your permissions.');
        } else {
          // For other errors, treat as temporary technical issue with more detail
          setError(`Experiencing technical difficulties loading posts: ${err.message || err.code || 'Unknown error'}. Please try refreshing the page.`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [viewMode]);

  // Update URL when view mode changes
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    if (newViewMode === 'published') {
      searchParams.delete('view');
    } else {
      searchParams.set('view', newViewMode);
    }
    setSearchParams(searchParams);
  };

  // If no posts, show welcome message (development stage)
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading posts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      );
    }

    if (posts.length === 0) {
      const emptyMessage = viewMode === 'all' && canAccessAdmin 
        ? 'No posts found (including drafts). Create your first post to get started!'
        : viewMode === 'published'
        ? 'No published posts yet. Stay tuned for upcoming content!'
        : 'No posts available at the moment.';

      return (
        <div className="py-5">
          <div className="text-center mb-4">
            <h2 className="mb-3" style={{ fontWeight: '600' }}>
              Welcome to Orient Way
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              This is where I document my journeys, both physical and digital.
              <br />
              Stories from the road, lessons from code, and everything in between.
            </p>
            
            {/* Dynamic status notice based on view mode */}
            <div className={`alert border-0 ${canAccessAdmin ? 'alert-warning' : 'alert-info'}`} 
                 style={{ backgroundColor: canAccessAdmin ? 'rgba(255, 193, 7, 0.1)' : 'rgba(13, 202, 240, 0.1)' }}>
              <i className={`bi ${canAccessAdmin ? 'bi-exclamation-triangle' : 'bi-info-circle'} me-2`}></i>
              <strong>{emptyMessage}</strong>
              {canAccessAdmin && (
                <div className="mt-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => window.location.href = '#/admin/create-post'}
                  >
                    Create First Post
                  </Button>
                </div>
              )}
            </div>

            {/* Show link preview only for non-admin empty state */}
            {!canAccessAdmin && (
              <>
                {/* Link system demo */}
                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <h6 className="text-muted mb-3">✨ Link Style Preview:</h6>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p className="mb-2">
                      Sample story: I <a href="#" className="theme-link link-blue">raised funding</a> for my startup, 
                      then <a href="#" className="theme-link link-teal">walked</a> across the continent, 
                      <a href="#" className="theme-link link-red">lived in South America</a> for months, 
                      and <a href="#" className="theme-link link-brown">became employee #1</a> at a YC company.
                    </p>
                    <small className="text-muted">
                      Hover over the colored links to see the "marker highlight" effect! 🖍️
                    </small>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Preview cards */}
          <div className="row g-4">
            <div className="col-md-6">
              <div 
                className="border rounded p-4 h-100 d-flex flex-column justify-content-center text-center"
                style={{ 
                  backgroundColor: 'rgba(13, 110, 253, 0.05)',
                  borderColor: 'rgba(13, 110, 253, 0.2)',
                  minHeight: '200px'
                }}
              >
                <i className="bi bi-map text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                <h5 className="text-primary mb-2">Travel Stories</h5>
                <p className="text-muted small mb-0">
                  Tales from 1,700 miles of walking and months in South America
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div 
                className="border rounded p-4 h-100 d-flex flex-column justify-content-center text-center"
                style={{ 
                  backgroundColor: 'rgba(255, 107, 53, 0.05)',
                  borderColor: 'rgba(255, 107, 53, 0.2)',
                  minHeight: '200px'
                }}
              >
                <i className="bi bi-code-slash mb-3" style={{ fontSize: '2.5rem', color: '#ff6b35' }}></i>
                <h5 className="mb-2" style={{ color: '#ff6b35' }}>Tech Insights</h5>
                <p className="text-muted small mb-0">
                  Lessons from building at a YC startup and beyond
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <small className="text-muted">
              Check back soon for the first adventure stories! 🚀
            </small>
          </div>
        </div>
      );
    }

    return (
      <Row className="g-4">
        {posts.map((post) => (
          <Col key={post.id} md={6} lg={6}>
            <BlogCard post={post} />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container fluid style={{ maxWidth: '1200px', padding: '1rem' }}>
      <EmailVerificationAlert />
      
      <Row className="g-4">
        {/* Left sidebar: Author info card */}
        <Col lg={4} xl={3}>
          <AuthorCard />
        </Col>

        {/* Right side: Blog content */}
        <Col lg={8} xl={9}>
          {/* Admin view toggle */}
          <AdminGate>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Blog Posts</h4>
              <ButtonGroup size="sm">
                <Button
                  variant={viewMode === 'published' ? 'primary' : 'outline-primary'}
                  onClick={() => handleViewModeChange('published')}
                >
                  Published
                </Button>
                <Button
                  variant={viewMode === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => handleViewModeChange('all')}
                >
                  All
                </Button>
              </ButtonGroup>
            </div>
          </AdminGate>
          
          {renderContent()}
        </Col>
      </Row>
    </Container>
  );
}