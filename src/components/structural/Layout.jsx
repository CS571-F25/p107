// Layout component: navbar + theme switcher + content outlet

import { useContext, useEffect, useState } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link, Outlet } from 'react-router';
import ThemeContext from '../contexts/ThemeContext.jsx';
import Footer from './Footer.jsx';

function ThemeSwitcher() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    const icon = isDark ? 'bi-sun-fill' : 'bi-moon-fill';

    return (
            <button
                type="button"
                className="btn btn-link p-0 border-0"
                onClick={toggleTheme}
                aria-label={label}
                aria-pressed={isDark}
                title={label}
                style={{ lineHeight: 1 }}
            >
            <i
                className={`bi ${icon} fs-5 theme-icon`}
                aria-hidden="true"
            />
        </button>
    );
}

export default function Layout() {
    const { theme } = useContext(ThemeContext);
    const [hidden, setHidden] = useState(false); // Smart navbar: hides on scroll down, shows on scroll up
    const [glass, setGlass] = useState(false); // Translucent frosted glass effect on navbar while scrolling up (not at top)
    const [atTop, setAtTop] = useState(true); // Whether the page is scrolled to the top

    useEffect(() => {
        let lastY = window.scrollY;

        const onScroll = () => {
            const y = window.scrollY;
            const delta = y - lastY;

            setAtTop(y === 0);

            if (Math.abs(delta) > 5) {
                setHidden(delta > 0 && y !== 0); // Hide if scrolling down
                setGlass(delta < 0 && y > 10); // Glass effect if scrolling up and past 10px
            };
            if (y === 0) {
                setGlass(false); // No glass effect at top
            };
            if (delta > 0) {
                setGlass(false); // No glass effect when scrolling down
            };

            lastY = y;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navbarClasses = [
        'navbar-smart',
        hidden ? 'navbar-hidden' : 'navbar-visible',
        atTop ? 'navbar-top' : (glass ? 'navbar-glass' : 'navbar-top'), // Apply glass effect only when scrolling up
        'bg-transparent',
        'border-0',
        'shadow-none',
        'py-2'
    ].join(' ');

    return (
    <div className="d-flex flex-column min-vh-100">
        {/* Navigation bar */}
        <Navbar expand="sm" className={navbarClasses}>
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-semibold text-body">
                    Orient Way
                </Navbar.Brand>

                <Nav className="me-auto align-items-center">
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/now">Now</Nav.Link>
                </Nav>
                <span className="ms-3"><ThemeSwitcher /></span>
            </Container>
        </Navbar>

        {/* Page body (excluding navbar) */}
        <Container className="flex-grow-1 py-4">
            <Outlet />
        </Container>

        {/* Footer */}
        <Footer />
    </div>
    );
}
