import { Outlet, Link, useLocation } from 'react-router';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { useUserPermissions } from '../../hooks/usePermissions';
import { canManageRoles, canAccessSystemSetup, levelToRole, canManagePosts } from '../../config/rolePermissions';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const AdminLayout = () => {
  const location = useLocation();
  const { level } = useUserPermissions();
  const currentRole = levelToRole(level);

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const navLinks = [
    { path: '/admin/posts', label: 'Post Management', requiredPermission: canManagePosts(currentRole) },
    { path: '/admin/roles', label: 'Role Management', requiredPermission: canManageRoles(currentRole) },
    { path: '/admin/passport', label: 'Passport Management', requiredPermission: canManageRoles(currentRole) }, // 添加这行
    { path: '/admin/setup', label: 'System Setup', requiredPermission: canAccessSystemSetup(currentRole) },
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