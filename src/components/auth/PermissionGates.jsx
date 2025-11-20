// Permission-based component wrapper
import { usePermission, useUserPermissions, usePostPermissions } from '../../hooks/usePermissions';
import { Spinner, Alert } from 'react-bootstrap';

// Component that renders children only if user has required permission
export function PermissionGate({ permission, children, fallback = null, showLoading = true }) {
  const { hasAccess, loading } = usePermission(permission);

  if (loading && showLoading) {
    return <Spinner animation="border" size="sm" />;
  }

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

// Component that renders children only for admin users
export function AdminGate({ children, fallback = null, showLoading = true }) {
  const { canAccessAdmin, loading } = useUserPermissions();

  if (loading && showLoading) {
    return <Spinner animation="border" size="sm" />;
  }

  if (!canAccessAdmin) {
    return fallback;
  }

  return children;
}

// Component that renders children only for owner
export function OwnerGate({ children, fallback = null, showLoading = true }) {
  const { isOwner, loading } = useUserPermissions();

  if (loading && showLoading) {
    return <Spinner animation="border" size="sm" />;
  }

  if (!isOwner) {
    return fallback;
  }

  return children;
}

// Component that shows different content based on user role level
export function RoleBasedContent({ 
  ownerContent = null,
  adminContent = null,
  authorContent = null,
  userContent = null,
  guestContent = null,
  showLoading = true
}) {
  const { level, isOwner, isAdmin, isAuthor, loading } = useUserPermissions();

  if (loading && showLoading) {
    return <Spinner animation="border" size="sm" />;
  }

  if (isOwner && ownerContent) return ownerContent;
  if (isAdmin && adminContent) return adminContent;
  if (isAuthor && authorContent) return authorContent;
  if (userContent) return userContent;
  
  return guestContent;
}

// Component for post-specific permissions
export function PostPermissionGate({ 
  postAuthorId, 
  requiredPermission, // 'edit', 'delete', 'publish'
  children, 
  fallback = null,
  showLoading = true 
}) {
  const { permissions, loading } = usePostPermissions(postAuthorId);

  if (loading && showLoading) {
    return <Spinner animation="border" size="sm" />;
  }

  const hasPermission = permissions[`can${requiredPermission.charAt(0).toUpperCase() + requiredPermission.slice(1)}`];
  
  if (!hasPermission) {
    return fallback;
  }

  return children;
}

// Higher-order component for page-level permission checks
export function withPermission(WrappedComponent, permission) {
  return function PermissionProtectedComponent(props) {
    const { hasAccess, loading } = usePermission(permission);

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <Alert variant="danger" className="text-center">
          <h4>Access Denied</h4>
          <p>You don't have permission to access this page.</p>
        </Alert>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Higher-order component for admin-only pages
export function withAdminAccess(WrappedComponent) {
  return function AdminProtectedComponent(props) {
    const { canAccessAdmin, loading, level, isOwner } = useUserPermissions();

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }

    if (!canAccessAdmin) {
      return (
        <Alert variant="danger" className="text-center">
          <h4>Admin Access Required</h4>
          <p>You need administrator privileges to access this page.</p>
          <div className="mt-3">
            <small className="text-muted">
              Debug info: Level: {level}, Owner: {isOwner ? 'Yes' : 'No'}
            </small>
          </div>
          <div className="mt-3">
            <button 
              className="btn btn-warning" 
              onClick={() => window.location.reload()}
            >
              Refresh Permissions
            </button>
          </div>
        </Alert>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export default {
  PermissionGate,
  AdminGate,
  OwnerGate,
  RoleBasedContent,
  PostPermissionGate,
  withPermission,
  withAdminAccess
};