import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import EmailVerificationAlert from "../auth/EmailVerificationAlert";
import AuthorCard from "../blog/AuthorCard";
import BlogCard from "../blog/BlogCard";
import { getPosts } from "../../services/blogService";
import '../../styles/blog-theme-links.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching posts...');
        const fetchedPosts = await getPosts(6); // Get recent 6 posts
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
  }, []);

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
            
            {/* Current status notice */}
            <div className="alert alert-info border-0" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)' }}>
              <i className="bi bi-info-circle me-2"></i>
              <strong>Blog is launching soon!</strong> Currently setting up the platform and preparing the first posts.
            </div>
            
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
          {renderContent()}
        </Col>
      </Row>
    </Container>
  );
}