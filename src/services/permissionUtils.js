// Emergency permission refresh utility
import { getUserRoles, getUserLevel, canAccessAdmin, isOwner } from '../services/roleService';
import { auth } from '../firebase/config';

// Force refresh user permissions
export const refreshUserPermissions = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Not authenticated');
    }

    console.log('🔄 Refreshing permissions for user:', userId);
    
    // Clear any cached permissions (if using any caching)
    // Force fresh reads from Firestore
    const userRoles = await getUserRoles(userId);
    const level = await getUserLevel(userId);
    const adminAccess = await canAccessAdmin(userId);
    const ownerStatus = await isOwner(userId);

    console.log('📊 Fresh permission data:', {
      userRoles,
      level,
      adminAccess,
      ownerStatus
    });

    // Trigger a re-render of permission-dependent components
    window.dispatchEvent(new CustomEvent('permissionsRefreshed', {
      detail: { userId, level, adminAccess, ownerStatus }
    }));

    return { userRoles, level, adminAccess, ownerStatus };
  } catch (error) {
    console.error('❌ Error refreshing permissions:', error);
    throw error;
  }
};

// Debug function to check Firestore connection specifically
export const testFirestorePermissions = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Not authenticated');
    }

    console.log('🧪 Testing Firestore permissions...');
    
    // Test basic read access
    const userRoles = await getUserRoles(userId);
    console.log('✅ Successfully read user roles:', userRoles.length);
    
    return true;
  } catch (error) {
    console.error('❌ Firestore permission test failed:', error);
    throw error;
  }
};

export default { refreshUserPermissions, testFirestorePermissions };