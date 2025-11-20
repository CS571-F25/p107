// Role-based access control (RBAC) service for Firestore
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query, 
  where,
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// Collection names
const ROLES_COLLECTION = 'roles';
const USER_ROLES_COLLECTION = 'userRoles';
const AUDIT_LOG_COLLECTION = 'auditLogs';

// Role levels (lower number = higher permission)
export const ROLE_LEVELS = {
  OWNER: 0,              // System owner
  ADMIN: 1,              // Administrator 
  VERIFIED_USER: 2,      // Email verified user
  UNVERIFIED_USER: 3,    // Unverified user
  GUEST: 4               // Unauthenticated visitor
};

// Initialize default roles in Firestore
export const initializeRoles = async () => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('You must be logged in to initialize roles');
    }

    const defaultRoles = [
      {
        id: 'owner',
        name: 'Owner',
        level: ROLE_LEVELS.OWNER,
        description: 'System owner with full permissions',
        permissions: ['*'] // All permissions
      },
      {
        id: 'admin',
        name: 'Admin',
        level: ROLE_LEVELS.ADMIN,
        description: 'Site administrator',
        permissions: [
          'blog:read-all',
          'blog:write-all',
          'blog:publish-all',
          'blog:delete-all',
          'user:manage',
          'view:all-posts'
        ]
      },
      {
        id: 'verified_user',
        name: 'Verified User',
        level: ROLE_LEVELS.VERIFIED_USER,
        description: 'Email verified user with full user privileges',
        permissions: [
          'blog:read-published',
          'blog:like',
          'blog:comment'
        ]
      },
      {
        id: 'unverified_user',
        name: 'Unverified User',
        level: ROLE_LEVELS.UNVERIFIED_USER,
        description: 'Unverified user with limited privileges',
        permissions: [
          'blog:read-published',
          'blog:like'
        ]
      },
      {
        id: 'guest',
        name: 'Guest',
        level: ROLE_LEVELS.GUEST,
        description: 'Anonymous user',
        permissions: [
          'blog:read-published'
        ]
      }
    ];

    console.log('Starting role initialization...');
    const results = [];

    for (const role of defaultRoles) {
      try {
        console.log(`Creating role: ${role.id}`);
        const roleRef = doc(db, ROLES_COLLECTION, role.id);
        
        // Check if role already exists
        const existingRole = await getDoc(roleRef);
        if (existingRole.exists()) {
          console.log(`Role ${role.id} already exists, updating...`);
        }
        
        await setDoc(roleRef, {
          ...role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true }); // Use merge to update existing roles
        
        results.push(role.id);
        console.log(`✓ Role ${role.id} created/updated successfully`);
      } catch (roleError) {
        console.error(`Failed to create role ${role.id}:`, roleError);
        throw new Error(`Failed to create role ${role.id}: ${roleError.message}`);
      }
    }

    console.log('All roles initialized successfully:', results);
    return results;
  } catch (error) {
    console.error('Error initializing roles:', error);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules. You may need to update them to allow role creation. See FIRESTORE_PERMISSIONS_GUIDE.md for help.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firestore is currently unavailable. Please check your internet connection and try again.');
    } else if (error.message.includes('auth')) {
      throw new Error('Authentication error. Please make sure you are logged in.');
    }
    
    throw error;
  }
};

// Get user roles
export const getUserRoles = async (userId) => {
  try {
    const q = query(
      collection(db, USER_ROLES_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const userRoles = [];
    querySnapshot.forEach((doc) => {
      userRoles.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get role details
    const rolesWithDetails = await Promise.all(
      userRoles.map(async (userRole) => {
        const roleDoc = await getDoc(doc(db, ROLES_COLLECTION, userRole.roleId));
        return {
          ...userRole,
          role: roleDoc.exists() ? roleDoc.data() : null
        };
      })
    );

    return rolesWithDetails.filter(ur => ur.role !== null);
  } catch (error) {
    console.error('Error getting user roles:', error);
    throw error;
  }
};

// Assign role to user (basic version - doesn't remove existing roles)
export const assignRole = async (userId, roleId, assignedBy) => {
  try {
    // Just assign the new role without removing existing ones
    const userRoleRef = doc(collection(db, USER_ROLES_COLLECTION));
    await setDoc(userRoleRef, {
      userId,
      roleId,
      assignedBy,
      assignedAt: serverTimestamp()
    });

    // Log the action
    await logAction({
      actorId: assignedBy,
      action: 'role:assign',
      entityType: 'user',
      entityId: userId,
      meta: { roleId }
    });

    console.log(`✅ Assigned role ${roleId} to user ${userId}`);
    return userRoleRef.id;
  } catch (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
};

// Assign role exclusively (removes all other roles first)
export const assignRoleExclusive = async (userId, roleId, assignedBy) => {
  try {
    // First, remove any existing roles for this user
    await removeAllUserRoles(userId);
    
    // Then assign the new role
    return await assignRole(userId, roleId, assignedBy);
  } catch (error) {
    console.error('Error assigning exclusive role:', error);
    throw error;
  }
};

// Remove all roles from a user
export const removeAllUserRoles = async (userId) => {
  try {
    const q = query(
      collection(db, USER_ROLES_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    console.log(`🗑️ Removed ${deletePromises.length} existing roles for user ${userId}`);
  } catch (error) {
    console.error('Error removing user roles:', error);
    throw error;
  }
};

// Check if user has permission
export const hasPermission = async (userId, permission) => {
  try {
    console.log('🔍 hasPermission called:', { userId, permission });
    
    if (!userId) {
      // Guest user - only read published content
      const allowed = permission === 'blog:read-published';
      console.log('🔍 Guest user permission check:', { permission, allowed });
      return allowed;
    }

    console.log('🔍 Getting user roles for authenticated user...');
    const userRoles = await getUserRoles(userId);
    
    // Check if any role has the required permission
    for (const userRole of userRoles) {
      const role = userRole.role;
      if (!role) continue;

      // Owner has all permissions
      if (role.permissions.includes('*')) {
        console.log('✅ User has owner permissions');
        return true;
      }

      // Check specific permission
      if (role.permissions.includes(permission)) {
        console.log('✅ User has specific permission:', permission);
        return true;
      }
    }

    console.log('❌ User does not have permission:', permission);
    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Get user's highest role level
export const getUserLevel = async (userId) => {
  try {
    if (!userId) {
      return ROLE_LEVELS.GUEST;
    }

    const userRoles = await getUserRoles(userId);
    
    if (userRoles.length === 0) {
      console.log('🚨 No roles found for user, but NOT auto-assigning during getUserLevel to avoid conflicts');
      return ROLE_LEVELS.UNVERIFIED_USER; // Return default, but don't auto-assign
    }

    // Return the highest permission level (lowest number)
    // Filter out null roles and get minimum level
    const validLevels = userRoles
      .filter(ur => ur.role && typeof ur.role.level === 'number')
      .map(ur => ur.role.level);
    
    if (validLevels.length === 0) {
      return ROLE_LEVELS.UNVERIFIED_USER;
    }

    console.log('🔍 getUserLevel Debug:', {
      userId,
      userRoles: userRoles.map(ur => ({ roleId: ur.roleId, level: ur.role?.level, name: ur.role?.name })),
      validLevels,
      minLevel: Math.min(...validLevels)
    });

    return Math.min(...validLevels);
  } catch (error) {
    console.error('Error getting user level:', error);
    return ROLE_LEVELS.UNVERIFIED_USER;
  }
};

// Check if user can access admin features
// Check if user can access admin interface
export const canAccessAdmin = async (userId) => {
  try {
    const level = await getUserLevel(userId);
    const hasAdmin = level <= ROLE_LEVELS.ADMIN;
    console.log('🔍 canAccessAdmin Debug:', { userId, level, hasAdmin, threshold: ROLE_LEVELS.ADMIN });
    return hasAdmin;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

// Check if user can manage all content
export const canManageAllContent = async (userId) => {
  try {
    const level = await getUserLevel(userId);
    return level <= ROLE_LEVELS.ADMIN;
  } catch (error) {
    console.error('Error checking content management:', error);
    return false;
  }
};

// Check if user is owner
export const isOwner = async (userId) => {
  try {
    const userRoles = await getUserRoles(userId);
    const hasOwnerRole = userRoles.some(ur => 
      ur.role && (ur.role.level === ROLE_LEVELS.OWNER || ur.roleId === 'owner')
    );
    console.log('🔍 isOwner Debug:', { userId, hasOwnerRole, userRoles: userRoles.map(ur => ur.roleId) });
    return hasOwnerRole;
  } catch (error) {
    console.error('Error checking owner status:', error);
    return false;
  }
};

// Log action for audit trail
export const logAction = async ({ actorId, action, entityType, entityId, meta = {} }) => {
  try {
    await setDoc(doc(collection(db, AUDIT_LOG_COLLECTION)), {
      actorId,
      action,
      entityType,
      entityId,
      meta,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging action:', error);
    // Don't throw - audit logging should not break main functionality
  }
};

// Auto-assign default role to new users
// Assign default role to user (only if no roles exist)
export const assignDefaultRole = async (userId) => {
  try {
    // Check if user already has roles
    const existingRoles = await getUserRoles(userId);
    if (existingRoles.length > 0) {
      return;
    }

    // Get current user's email verification status
    const currentUser = auth.currentUser;
    const isEmailVerified = currentUser?.emailVerified || false;
    
    // Assign role based on email verification status
    const roleId = isEmailVerified ? 'verified_user' : 'unverified_user';
    
    console.log(`🔄 Auto-assigning role: ${roleId} (emailVerified: ${isEmailVerified})`);
    await assignRole(userId, roleId, 'system');
  } catch (error) {
    console.error('Error assigning default role:', error);
    // Don't throw - user can still function without explicit role
  }
};

// Check and update user role based on email verification status
export const updateRoleByVerificationStatus = async (userId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      return;
    }

    const isEmailVerified = currentUser.emailVerified;
    const userRoles = await getUserRoles(userId);
    
    // If user has no roles, assign default
    if (userRoles.length === 0) {
      return await assignDefaultRole(userId);
    }

    // Check if current role matches verification status
    const currentRole = userRoles[0];
    const shouldBeVerified = isEmailVerified;
    const isCurrentlyVerified = currentRole.roleId === 'verified_user';
    
    // Update role if verification status changed
    if (shouldBeVerified && !isCurrentlyVerified) {
      console.log('📧 User email verified, upgrading to verified_user');
      await assignRoleExclusive(userId, 'verified_user', 'system-verification');
    } else if (!shouldBeVerified && isCurrentlyVerified) {
      console.log('⚠️ User email unverified, downgrading to unverified_user');
      await assignRoleExclusive(userId, 'unverified_user', 'system-verification');
    }
  } catch (error) {
    console.error('Error updating role by verification status:', error);
  }
};

// Make current authenticated user the owner (exclusive) - FORCE RESET
export const makeCurrentUserOwner = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('No authenticated user');
    }

    console.log('🔄 Starting exclusive owner assignment for user:', userId);
    
    // First check current roles
    const currentRoles = await getUserRoles(userId);
    console.log('📋 Current roles before assignment:', currentRoles.map(r => r.roleId));

    // Use exclusive assignment which removes all existing roles first
    await assignRoleExclusive(userId, 'owner', userId);
    
    // Verify the assignment worked
    const newRoles = await getUserRoles(userId);
    console.log('📋 New roles after assignment:', newRoles.map(r => r.roleId));
    
    const newLevel = await getUserLevel(userId);
    console.log('🔢 New user level:', newLevel);
    
    console.log('✅ Successfully made current user the exclusive owner');
    return true;
  } catch (error) {
    console.error('❌ Error making current user owner:', error);
    throw error;
  }
};

// Make user the owner (should only be called once during setup)
export const makeOwner = async (userEmail) => {
  try {
    // This would require additional logic to find user by email
    // For now, this is a placeholder for manual setup
    console.log(`To make ${userEmail} an owner, manually add role assignment in Firestore console`);
    
    // In a real implementation, you might:
    // 1. Find user by email
    // 2. Assign owner role
    // 3. Remove other roles if needed
    
    return true;
  } catch (error) {
    console.error('Error making user owner:', error);
    throw error;
  }
};

// Clean up duplicate roles for all users
export const cleanupDuplicateRoles = async () => {
  try {
    console.log('🧹 Starting comprehensive role cleanup...');
    const userRolesSnapshot = await getDocs(collection(db, USER_ROLES_COLLECTION));
    const userRoleMap = {};
    
    // Group roles by user
    userRolesSnapshot.forEach(doc => {
      const data = doc.data();
      if (!userRoleMap[data.userId]) {
        userRoleMap[data.userId] = [];
      }
      userRoleMap[data.userId].push({ id: doc.id, ...data });
    });

    let totalCleaned = 0;

    // Clean up users with multiple roles or duplicate roles
    for (const [userId, roles] of Object.entries(userRoleMap)) {
      if (roles.length > 1) {
        console.log(`🧹 User ${userId} has ${roles.length} roles:`, roles.map(r => r.roleId));
        
        // Group by roleId to handle exact duplicates
        const roleGroups = {};
        roles.forEach(role => {
          if (!roleGroups[role.roleId]) {
            roleGroups[role.roleId] = [];
          }
          roleGroups[role.roleId].push(role);
        });

        // For each role type, keep only the most recent one
        const rolesToKeep = [];
        const rolesToDelete = [];

        Object.entries(roleGroups).forEach(([roleId, roleInstances]) => {
          if (roleInstances.length > 1) {
            // Sort by timestamp, keep newest
            const sorted = roleInstances.sort((a, b) => {
              const timeA = a.assignedAt?.seconds || 0;
              const timeB = b.assignedAt?.seconds || 0;
              return timeB - timeA;
            });
            rolesToKeep.push(sorted[0]);
            rolesToDelete.push(...sorted.slice(1));
            console.log(`  - Keeping latest ${roleId}, removing ${sorted.length - 1} duplicates`);
          } else {
            rolesToKeep.push(roleInstances[0]);
          }
        });

        // If user has multiple different roles, keep only the highest permission one
        if (rolesToKeep.length > 1) {
          const roleHierarchy = { owner: 0, admin: 1, verified_user: 2, unverified_user: 3, guest: 4 };
          const highestRole = rolesToKeep.reduce((best, current) => {
            const bestPriority = roleHierarchy[best.roleId] || 999;
            const currentPriority = roleHierarchy[current.roleId] || 999;
            return currentPriority < bestPriority ? current : best;
          });
          
          rolesToDelete.push(...rolesToKeep.filter(r => r.id !== highestRole.id));
          console.log(`  - Keeping highest priority role: ${highestRole.roleId}`);
        }

        // Delete excess roles
        for (const role of rolesToDelete) {
          await deleteDoc(doc(db, USER_ROLES_COLLECTION, role.id));
          totalCleaned++;
          console.log(`🗑️ Removed duplicate/excess role ${role.roleId} for user ${userId}`);
        }
      }
    }
    
    console.log(`🎉 Cleanup completed - removed ${totalCleaned} duplicate roles`);
    return totalCleaned;
  } catch (error) {
    console.error('Error cleaning up roles:', error);
    throw error;
  }
};

export default {
  ROLE_LEVELS,
  initializeRoles,
  getUserRoles,
  assignRole,
  assignRoleExclusive,
  removeAllUserRoles,
  hasPermission,
  getUserLevel,
  canAccessAdmin,
  canManageAllContent,
  isOwner,
  logAction,
  assignDefaultRole,
  updateRoleByVerificationStatus,
  cleanupDuplicateRoles,
  makeCurrentUserOwner,
  makeOwner
};