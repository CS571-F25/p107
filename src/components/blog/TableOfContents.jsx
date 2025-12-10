import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import ThemeContext from '../contexts/ThemeContext';

export default function TableOfContents({ content }) {
  const [items, setItems] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Extract headers from content
  useEffect(() => {
    if (!content) return;

    const lines = content.split('\n');
    const headings = [];

    lines.forEach((line) => {
      let level = 0;
      let text = '';
      
      if (line.startsWith('# ')) {
        level = 1;
        text = line.substring(2);
      } else if (line.startsWith('## ')) {
        level = 2;
        text = line.substring(3);
      } else if (line.startsWith('### ')) {
        level = 3;
        text = line.substring(4);
      }

      if (level > 0 && text.trim()) {
        // Generate ID from heading text
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        
        headings.push({ level, text, id });
      }
    });

    setItems(headings);
  }, [content]);

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div
      className="sticky-top"
      style={{
        top: '2rem',
        padding: '1rem',
        backgroundColor: isDark ? '#2d3748' : '#f8f9fa',
        border: `1px solid ${isDark ? '#4a5568' : '#dee2e6'}`,
        borderRadius: '0.375rem',
        maxHeight: 'calc(100vh - 4rem)',
        overflowY: 'auto',
      }}
    >
      {/* Toggle button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>
          Contents
        </h6>
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            padding: 0,
            backgroundColor: 'transparent',
            border: 'none',
            color: isDark ? '#adb5bd' : '#6c757d',
            cursor: 'pointer',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.color = isDark ? '#cbd5e0' : '#495057';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = isDark ? '#adb5bd' : '#6c757d';
          }}
        >
          {isVisible ? 'HIDE' : 'SHOW'}
        </button>
      </div>

      {/* Table of contents */}
      {isVisible && (
        <>
          {/* Back to Top */}
          <button
            onClick={handleBackToTop}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              backgroundColor: 'transparent',
              border: `1px solid ${isDark ? '#4a5568' : '#dee2e6'}`,
              borderRadius: '0.25rem',
              color: isDark ? '#a0aec0' : '#495057',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDark ? '#4a5568' : '#e9ecef';
              e.target.style.color = isDark ? '#cbd5e0' : '#212529';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDark ? '#a0aec0' : '#495057';
            }}
          >
            ↑ Back to Top
          </button>

          {/* Content list */}
          {items.length > 0 ? (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 1rem 0',
              }}
            >
              {items.map((item, index) => (
                <li
                  key={index}
                  style={{
                    marginLeft: `${(item.level - 1) * 0.75}rem`,
                    marginBottom: '0.5rem',
                  }}
                >
                  <button
                    onClick={() => handleScroll(item.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: isDark ? '#a0aec0' : '#495057',
                      fontSize: `${0.95 - (item.level - 1) * 0.05}rem`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.2s ease',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = isDark ? '#cbd5e0' : '#212529';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = isDark ? '#a0aec0' : '#495057';
                    }}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p
              style={{
                fontSize: '0.85rem',
                color: isDark ? '#718096' : '#adb5bd',
                margin: '0 0 1rem 0',
              }}
            >
              No headings found
            </p>
          )}

          {/* Back to Home */}
          <button
            onClick={handleBackToHome}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: `1px solid ${isDark ? '#4a5568' : '#dee2e6'}`,
              borderRadius: '0.25rem',
              color: isDark ? '#a0aec0' : '#495057',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDark ? '#4a5568' : '#e9ecef';
              e.target.style.color = isDark ? '#cbd5e0' : '#212529';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDark ? '#a0aec0' : '#495057';
            }}
          >
            ← Back to Home
          </button>
        </>
      )}
    </div>
  );
}
