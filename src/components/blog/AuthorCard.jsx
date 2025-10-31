import { Card } from 'react-bootstrap';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import '../../styles/blog-theme-links.css';

export default function AuthorCard() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const journeyItems = [
    { text: 'raised', description: ' by West Lake in Hangzhou', linkClass: 'theme-link link-blue', id: 'raised' },
    { text: 'learned to orienteer', description: ' in high school', linkClass: 'theme-link link-teal', id: 'orienteer' },
    { text: 'solo cycled', description: ' around Taiwan and topped the highest road in SE Asia', linkClass: 'theme-link link-red', id: 'taiwan-ride' },
    { text: 'bikepacked', description: ' from the Midwest to the Pacific', linkClass: 'theme-link link-brown', id: 'backpacking' },
    { text: 'now', description: ' studying in Madison', linkClass: 'theme-link link-blue', id: 'madison' }
  ];

  const socialLinks = {
    github: 'https://github.com/eliotziqi',
    linkedin: 'https://www.linkedin.com/in/zzhu-eliot/',
    twitter: 'https://x.com/EliotOrientWay',
    strava: 'https://www.strava.com/athletes/151920511',
    email: 'mailto:zhu.ziqi@foxmail.com'
  };

  return (
    <div className="sticky-top" style={{ top: '2rem' }}>
      {/* Title section */}
      <div 
        className="mb-4 pb-4 title-hover-group" 
        style={{ position: 'relative' }}
        onMouseEnter={(e) => {
          const tooltip = e.currentTarget.querySelector('.title-tooltip');
          if (tooltip) tooltip.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          const tooltip = e.currentTarget.querySelector('.title-tooltip');
          if (tooltip) tooltip.style.opacity = '0';
        }}
      >
        <div style={{ cursor: 'default' }}>
          <h1 className="mb-1 lh-1" style={{ 
            fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', 
            fontWeight: '800', 
            letterSpacing: '-0.03em',
            whiteSpace: 'nowrap'
          }}>
            Orient&nbsp;Way
          </h1>
          <h2 className="mb-0 text-muted" style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.1rem)', 
            fontWeight: '400', 
            letterSpacing: '-0.015em',
            marginTop: '0.15rem'
          }}>
            a blog by Eliot Zhu
          </h2>
          <small 
            className="text-muted title-tooltip"
            style={{ 
              fontSize: '0.7rem',
              lineHeight: '1.2',
              position: 'absolute',
              top: '-1.2rem',
              left: '0',
              opacity: '0',
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            to orient: find your bearings · a way: a path you make
          </small>
        </div>
      </div>

      {/* Personal journey list */}
      <div className="mb-4">
        <ul className="list-unstyled mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          {journeyItems.map((item, index) => (
            <li key={index} className="mb-1">
              <span className="text-muted">• </span>
              <a
                href={`#${item.id}`}
                className={item.linkClass}
                onClick={(e) => {
                  e.preventDefault();
                  console.log(`Would navigate to: ${item.id}`);
                  alert(`This would be a link to a blog post about: ${item.text}`);
                }}
              >
                {item.text}
              </a>
              <span className="text-muted">{item.description}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Social media icons */}
      <div className="d-flex gap-3 mb-4">
        <a 
          href={socialLinks.github} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-reset"
          style={{ fontSize: '1.3rem', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.target.style.color = '#333')}
          onMouseLeave={(e) => (e.target.style.color = 'inherit')}
          title="GitHub"
        >
          <i className="bi bi-github"></i>
        </a>
        <a 
          href={socialLinks.linkedin} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-reset"
          style={{ fontSize: '1.3rem', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.target.style.color = '#0077b5')}
          onMouseLeave={(e) => (e.target.style.color = 'inherit')}
          title="LinkedIn"
        >
          <i className="bi bi-linkedin"></i>
        </a>
        <a 
          href={socialLinks.twitter} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-reset"
          style={{ fontSize: '1.3rem', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.target.style.color = '#1da1f2')}
          onMouseLeave={(e) => (e.target.style.color = 'inherit')}
          title="Twitter/X"
        >
          <i className="bi bi-twitter-x"></i>
        </a>
        {/* <a 
          href={socialLinks.strava}
          target="_blank"
          rel="noopener noreferrer"
          className="text-reset"
          style={{ fontSize: '1.3rem', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.target.style.color = '#fc4c02')}
          onMouseLeave={(e) => (e.target.style.color = 'inherit')}
          title="Strava"
        >
          <i className="bi bi-strava"></i>
        </a> */}
        <a 
          href={socialLinks.email}
          className="text-reset"
          style={{ fontSize: '1.3rem', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.target.style.color = '#6c757d')}
          onMouseLeave={(e) => (e.target.style.color = 'inherit')}
          title="Email"
        >
          <i className="bi bi-envelope"></i>
        </a>
      </div>
    </div>
  );
}