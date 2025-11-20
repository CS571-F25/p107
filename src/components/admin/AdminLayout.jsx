import { Outlet, Link, useLocation } from 'react-router';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { useUserPermissions } from '../../hooks/usePermissions';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const AdminLayout = () => {
  const location = useLocation();
  const { isOwner, isAdmin } = useUserPermissions();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const navLinks = [
    { path: '/admin/posts', label: 'Post Management', requiredPermission: isAdmin },
    { path: '/admin/roles', label: 'Role Management', requiredPermission: isOwner },
    { path: '/admin/setup', label: 'System Setup', requiredPermission: isOwner },
  ];

  return (
    <Container fluid>
      <Row>
        <Col
          md={3}
          lg={2}
          className={`vh-100 p-3`}
          style={isDark ? { backgroundColor: '#1f2937', color: '#e9ecef' } : { backgroundColor: '#f8f9fa' }}
        >
          <h4 className="mb-4">Admin Panel</h4>
          <Nav variant="pills" className="flex-column">
            {navLinks.map(link => (
              link.requiredPermission && (
                <Nav.Item key={link.path}>
                  <Nav.Link as={Link} to={link.path} active={location.pathname === link.path}>
                    {link.label}
                  </Nav.Link>
                </Nav.Item>
              )
            ))}
          </Nav>
        </Col>
        <Col md={9} lg={10} className="p-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;