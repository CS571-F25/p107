// Custom hooks for role-based access control
import { useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import LoginStatusContext from '../components/contexts/LoginStatusContext';
import { 
  getUserLevel, 
  hasPermission, 
  canAccessAdmin, 
  canManageAllContent, 
  isOwner,
  ROLE_LEVELS 
} from '../services/roleService';

// Get current user ID helper
const getCurrentUserId = () => {
  return auth.currentUser?.uid || null;
};

// Hook to get user's role level
export const useUserLevel = () => {
  const [level, setLevel] = useState(ROLE_LEVELS.GUEST);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(LoginStatusContext);

  useEffect(() => {
    const fetchLevel = async (userId) => {
      try {
        setLoading(true);
        if (userId) {
          const userLevel = await getUserLevel(userId);
          setLevel(userLevel);
        } else {
          setLevel(ROLE_LEVELS.GUEST);
        }
      } catch (error) {
        console.error('Error fetching user level:', error);
        setLevel(ROLE_LEVELS.UNVERIFIED_USER);
      } finally {
        setLoading(false);
      }
    };

    // Listen to Firebase auth changes directly
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        fetchLevel(firebaseUser.uid);
      } else {
        setLevel(ROLE_LEVELS.GUEST);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { level, loading };
};

// Hook to check specific permission
export const usePermission = (permission) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(LoginStatusContext);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const access = await hasPermission(userId, permission);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [permission, isLoggedIn]);

  return { hasAccess, loading };
};

// Hook to check admin access
export const useAdminAccess = () => {
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async (userId) => {
      try {
        setLoading(true);
        if (userId) {
          const access = await canAccessAdmin(userId);
          setCanAccess(access);
        } else {
          setCanAccess(false);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setCanAccess(false);
      } finally {
        setLoading(false);
      }
    };

    // Listen to Firebase auth changes directly
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        checkAccess(firebaseUser.uid);
      } else {
        setCanAccess(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { canAccess, loading };
};

// Hook to check if user is owner
export const useOwnerStatus = () => {
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(LoginStatusContext);

  useEffect(() => {
    const checkOwner = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const ownerStatus = await isOwner(userId);
        setIsUserOwner(ownerStatus);
      } catch (error) {
        console.error('Error checking owner status:', error);
        setIsUserOwner(false);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      checkOwner();
    } else {
      setIsUserOwner(false);
      setLoading(false);
    }
  }, [isLoggedIn]);

  return { isUserOwner, loading };
};

// Hook to check content management permissions
export const useContentManagement = () => {
  const [canManageAll, setCanManageAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(LoginStatusContext);

  useEffect(() => {
    const checkManagement = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const canManage = await canManageAllContent(userId);
        setCanManageAll(canManage);
      } catch (error) {
        console.error('Error checking content management:', error);
        setCanManageAll(false);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      checkManagement();
    } else {
      setCanManageAll(false);
      setLoading(false);
    }
  }, [isLoggedIn]);

  return { canManageAll, loading };
};

// Hook for post-specific permissions
export const usePostPermissions = (postAuthorId) => {
  const [permissions, setPermissions] = useState({
    canRead: true, // default: can read published
    canEdit: false,
    canDelete: false,
    canPublish: false
  });
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(LoginStatusContext);

  useEffect(() => {
    const checkPostPermissions = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        
        if (!userId) {
          // Guest user
          setPermissions({
            canRead: true, // can read published only
            canEdit: false,
            canDelete: false,
            canPublish: false
          });
          return;
        }

        const [
          canEditAll,
          canPublishAll,
          canDeleteAll
        ] = await Promise.all([
          hasPermission(userId, 'blog:write-all'),
          hasPermission(userId, 'blog:publish-all'),
          hasPermission(userId, 'blog:delete-all')
        ]);

        const isAuthor = userId === postAuthorId;
        const canEditOwn = await hasPermission(userId, 'blog:write-own');
        const canPublishOwn = await hasPermission(userId, 'blog:publish-own');
        const canDeleteOwn = await hasPermission(userId, 'blog:delete-own');

        setPermissions({
          canRead: true,
          canEdit: canEditAll || (isAuthor && canEditOwn),
          canDelete: canDeleteAll || (isAuthor && canDeleteOwn),
          canPublish: canPublishAll || (isAuthor && canPublishOwn)
        });
      } catch (error) {
        console.error('Error checking post permissions:', error);
        setPermissions({
          canRead: true,
          canEdit: false,
          canDelete: false,
          canPublish: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkPostPermissions();
  }, [postAuthorId, isLoggedIn]);

  return { permissions, loading };
};

// Utility hook to get all user permission info
export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState({
    level: ROLE_LEVELS.GUEST,
    canAccessAdmin: false,
    canManageAll: false,
    isOwner: false,
    loading: true
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounted
    
    const checkAllPermissions = async (userId) => {
      try {
        console.log('🔄 useUserPermissions: Checking permissions for user:', userId, 'refreshKey:', refreshKey);
        
        if (!isMounted) return; // Exit if component unmounted
        
        if (!userId) {
          console.log('🔄 useUserPermissions: No user ID, setting guest permissions');
          if (isMounted) {
            setPermissions({
              level: ROLE_LEVELS.GUEST,
              canAccessAdmin: false,
              canManageAll: false,
              isOwner: false,
              loading: false
            });
          }
          return;
        }

        // Set loading state
        if (isMounted) {
          setPermissions(prev => ({ ...prev, loading: true }));
        }

        // Get all permission info in parallel
        console.log('🔄 useUserPermissions: Fetching all permissions...');
        const [level, adminAccess, contentAccess, ownerStatus] = await Promise.all([
          getUserLevel(userId),
          canAccessAdmin(userId),
          canManageAllContent(userId),
          isOwner(userId)
        ]);

        console.log('🔄 useUserPermissions: Got results:', { level, adminAccess, contentAccess, ownerStatus });

        const newPermissions = {
          level,
          canAccessAdmin: adminAccess,
          canManageAll: contentAccess,
          isOwner: ownerStatus,
          loading: false
        };

        console.log('🔄 useUserPermissions: Setting new permissions:', newPermissions);
        if (isMounted) {
          setPermissions(newPermissions);
        }
      } catch (error) {
        console.error('❌ useUserPermissions: Error checking permissions:', error);
        if (isMounted) {
          setPermissions({
            level: ROLE_LEVELS.UNVERIFIED_USER,
            canAccessAdmin: false,
            canManageAll: false,
            isOwner: false,
            loading: false
          });
        }
      }
    };

    // Listen to Firebase auth changes directly
    console.log('🔄 useUserPermissions: Setting up Firebase auth listener, refreshKey:', refreshKey);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔄 useUserPermissions: Auth state changed:', firebaseUser ? `logged in as ${firebaseUser.uid}` : 'logged out');
      if (firebaseUser) {
        checkAllPermissions(firebaseUser.uid);
      } else {
        if (isMounted) {
          setPermissions({
            level: ROLE_LEVELS.GUEST,
            canAccessAdmin: false,
            canManageAll: false,
            isOwner: false,
            loading: false
          });
        }
      }
    });

    return () => {
      console.log('🔄 useUserPermissions: Cleaning up auth listener');
      isMounted = false; // Mark as unmounted
      unsubscribe();
    };
  }, [refreshKey]);

  // Get isLoggedIn from current Firebase auth state, not context
  const isLoggedIn = Boolean(auth.currentUser);

  // Force refresh function
  const forceRefresh = () => {
    console.log('🔄 useUserPermissions: Force refresh triggered');
    setRefreshKey(prev => prev + 1);
  };

  return {
    ...permissions,
    isLoggedIn,
    forceRefresh,
    // Helper methods
    isGuest: permissions.level === ROLE_LEVELS.GUEST,
    isUnverifiedUser: permissions.level === ROLE_LEVELS.UNVERIFIED_USER,
    isVerifiedUser: permissions.level === ROLE_LEVELS.VERIFIED_USER,
    isAdmin: permissions.level <= ROLE_LEVELS.ADMIN
  };
};

export default {
  useUserLevel,
  usePermission,
  useAdminAccess,
  useOwnerStatus,
  useContentManagement,
  usePostPermissions,
  useUserPermissions
};