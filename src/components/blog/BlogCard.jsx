import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import '../../styles/blog-theme-links.css';

export default function BlogCard({ post, theme = 'blue' }) {
  const { theme: currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';
  
  const {
    id,
    title,
    subtitle,
    excerpt,
    coverImage,
    category,
    tags = [],
    publishedAt,
    readTime,
    author
  } = post;

  // Format date display
  const formatDate = (date) => {
    if (!date) return '';
    
    // If current year, only show month and day
    const now = new Date();
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Theme mapping to category
  const getThemeFromCategory = (category) => {
    const themeMap = {
      travel: 'red',
      tech: 'blue',
      life: 'teal',
      review: 'brown',
      startup: 'brown',
      personal: 'blue'
    };
    return themeMap[category] || 'blue';
  };

  const cardTheme = getThemeFromCategory(category) || theme;

  // Dynamic tag styles for light/dark mode
  const tagStyle = {
    fontSize: '0.7rem',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(108, 117, 125, 0.8)',
    color: '#ffffff',  // 在所有模式下都使用白色文字
    border: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(108, 117, 125, 0.9)',
    fontWeight: '500',
    backdropFilter: isDark ? 'blur(8px)' : 'none'
  };

  return (
    <Card className={`h-100 shadow-sm border-0 mb-4 card card-${cardTheme}`}>
      {/* Cover image */}
      {coverImage && (
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <Card.Img
            variant="top"
            src={coverImage}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          />
        </div>
      )}

      <Card.Body className="d-flex flex-column">
        {/* Date badge */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className={`card-date`}>
            {formatDate(publishedAt)}
          </div>
          {readTime && (
            <small className="text-muted">{readTime} min read</small>
          )}
        </div>

        {/* Title and subtitle */}
        <Link 
          to={`/blog/${id}`} 
          className="text-decoration-none text-reset"
        >
          <Card.Title 
            className="mb-1 card-title"
            style={{ 
              fontSize: '1.2rem',
              lineHeight: '1.3'
            }}
          >
            {title}
          </Card.Title>
        </Link>
        
        {subtitle && (
          <div 
            className="text-muted mb-2"
            style={{ 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Excerpt */}
        <Card.Text 
          className="text-muted flex-grow-1"
          style={{ 
            fontSize: '0.85rem',
            lineHeight: '1.5'
          }}
        >
          {excerpt}
        </Card.Text>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-auto pt-2">
            <div className="d-flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline-secondary"
                  className="border-0"
                  style={tagStyle}
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge 
                  variant="outline-secondary"
                  className="border-0"
                  style={tagStyle}
                >
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}