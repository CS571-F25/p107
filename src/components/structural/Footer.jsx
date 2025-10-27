import { useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import ThemeContext from '../contexts/ThemeContext.jsx';
import 'bootstrap-icons/font/bootstrap-icons.css';
import XhsIcon from '../../assets/icons/xhs.svg?react';

export default function Footer() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <footer
      className={`border-top mt-5 pt-5 pb-3 ${
        isDark ? 'bg-dark text-light' : 'bg-light text-dark'
      }`}
    >
        {/* Decorative Center Link */}
        <div className="text-center mb-4">
        <Link
            to="/"
            className="text-decoration-none"
            style={{
                fontSize: '1.3rem',
                color: isDark ? '#fff' : '#000',
                transition: 'transform 0.2s ease, color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(5deg)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
        >
            • ───── ✦ ───── •
        </Link>
      </div>

      <Container>
        <Row className="gy-4">
          {/* Internal Links */}
          <Col md={6}>
            <h6 className="fw-bold mb-3">Internal Links</h6>
            <ul className="list-unstyled">
              <li><a href="#/" className="fw-semibold text-decoration-none">Home</a></li>
              <li><a href="#/now" className="fw-semibold text-decoration-none">Now</a></li>
            </ul>
            <small className="text-secondary d-block mt-3">
              This site represents the author's opinion and is for informational purposes only. 
            </small>
          </Col>

          {/* External Links */}
          <Col md={6} className="text-md-end">
            <h6 className="fw-bold mb-3">External Links</h6>
            <div className="d-flex justify-content-md-end gap-3 mb-3">
                <a href="https://github.com/eliotziqi" target="_blank" rel="noopener noreferrer" className="text-reset fs-5">
                    <i className="bi bi-github"></i>
                </a>
                <a href="https://www.linkedin.com/in/zzhu-eliot/" target="_blank" rel="noopener noreferrer" className="text-reset fs-5">
                    <i className="bi bi-linkedin"></i>
                </a>
                <a href="https://x.com/EliotOrientWay" target="_blank" rel="noopener noreferrer" className="text-reset fs-5">
                    <i className="bi bi-twitter-x"></i>
                </a>
                {/* Xiaohongshu icon */}
                <a
                    href="https://www.xiaohongshu.com/user/profile/5d35d92d0000000010027a5a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-reset fs-5"
                    title="Xiaohongshu"
                    style={{ display: 'inline-block', transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ff2442')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                    >
                    <XhsIcon
                        style={{
                        width: '1.25em',
                        height: '1.25em',
                        verticalAlign: '-0.125em',
                        transition: 'transform 0.2s ease, color 0.3s ease',
                        }}
                    />
                </a>
                    <a href="mailto:zhu.ziqi@foxmail.com" className="text-reset fs-5">
                    <i className="bi bi-envelope"></i>
                </a>
            </div>

            <small className="text-secondary d-block">
              Built with <a href="https://react.dev" className="text-decoration-none">React</a> 
              , styled with <a href="https://getbootstrap.com/" className="text-decoration-none">Bootstrap</a>, 
              deployed on <a href="https://pages.github.com" className="text-decoration-none">GitHub Pages</a>.
            </small>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="mt-4">
          <Col>
            <p className="text-center text-secondary small mb-0">
              © {new Date().getFullYear()} Eliot · Orient Way
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
