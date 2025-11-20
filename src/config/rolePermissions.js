/**
 * Centralized role -> permissions mapping and helpers
 *
 * Roles: owner, admin, verified_user, unverified_user, guest
 * Capabilities:
 *  - canManagePosts
 *  - canManageUsers
 *  - canManageRoles
 *  - canAccessSystemSetup
 *  - canUseDebugTools
 *
 * This file uses JSDoc typedefs to provide lightweight type hints in JS.
 */

/**
 * @typedef {'owner'|'admin'|'verified_user'|'unverified_user'|'guest'} Role
 */

/**
 * @typedef {Object} RolePermissions
 * @property {boolean} canManagePosts
 * @property {boolean} canManageUsers
 * @property {boolean} canManageRoles
 * @property {boolean} canAccessSystemSetup
 * @property {boolean} canUseDebugTools
 */

/**
 * Permission map for each role.
 * Owner has full access to everything. Admin has broad management capabilities
 * but deliberately does not have owner-only capabilities like full system setup
 * or permission to assign owner role.
 *
 * @type {Record<Role, RolePermissions>}
 */
export const ROLE_PERMISSIONS = {
  owner: {
    canManagePosts: true,
    canManageUsers: true,
    canManageRoles: true,
    canAccessSystemSetup: true,
    canUseDebugTools: true,
  },
  admin: {
    canManagePosts: true,
    canManageUsers: true,
    // Admins may manage roles except they should NOT be able to assign owner-level roles
    canManageRoles: true,
    canAccessSystemSetup: false,
    canUseDebugTools: false,
  },
  verified_user: {
    canManagePosts: false, // creating posts may be controlled separately
    canManageUsers: false,
    canManageRoles: false,
    canAccessSystemSetup: false,
    canUseDebugTools: false,
  },
  unverified_user: {
    canManagePosts: false,
    canManageUsers: false,
    canManageRoles: false,
    canAccessSystemSetup: false,
    canUseDebugTools: false,
  },
  guest: {
    canManagePosts: false,
    canManageUsers: false,
    canManageRoles: false,
    canAccessSystemSetup: false,
    canUseDebugTools: false,
  }
};

/**
 * Safe getter for role permissions. Unknown roles fall back to `guest`.
 * @param {string} role
 * @returns {RolePermissions}
 */
export function getPermissionsForRole(role) {
  const r = role && typeof role === 'string' ? role : 'guest';
  return ROLE_PERMISSIONS[r] || ROLE_PERMISSIONS.guest;
}

/**
 * Convenience helpers for common checks. Accepts either a role string or
 * an object with a `role` property.
 *
 * @param {string|{role?: string}} roleOrObj
 * @returns {boolean}
 */
export function canManagePosts(roleOrObj) {
  const role = typeof roleOrObj === 'string' ? roleOrObj : (roleOrObj?.role || 'guest');
  return getPermissionsForRole(role).canManagePosts;
}

export function canManageUsers(roleOrObj) {
  const role = typeof roleOrObj === 'string' ? roleOrObj : (roleOrObj?.role || 'guest');
  return getPermissionsForRole(role).canManageUsers;
}

export function canManageRoles(roleOrObj) {
  const role = typeof roleOrObj === 'string' ? roleOrObj : (roleOrObj?.role || 'guest');
  return getPermissionsForRole(role).canManageRoles;
}

export function canAccessSystemSetup(roleOrObj) {
  const role = typeof roleOrObj === 'string' ? roleOrObj : (roleOrObj?.role || 'guest');
  return getPermissionsForRole(role).canAccessSystemSetup;
}

export function canUseDebugTools(roleOrObj) {
  const role = typeof roleOrObj === 'string' ? roleOrObj : (roleOrObj?.role || 'guest');
  return getPermissionsForRole(role).canUseDebugTools;
}

/**
 * Helper to check owner-specific role name
 * @param {string} role
 * @returns {boolean}
 */
export function isOwnerRole(role) {
  return role === 'owner';
}

/**
 * Generic capability check when you have the user's permissions object
 * @param {{role?: string}} userLike
 * @param {keyof RolePermissions} capability
 * @returns {boolean}
 */
export function hasCapability(userLike, capability) {
  const role = userLike?.role || 'guest';
  const perms = getPermissionsForRole(role);
  return Boolean(perms && perms[capability]);
}

/**
 * Convert numeric level (ROLE_LEVELS) to role id string.
 * @param {number} level
 * @returns {Role}
 */
export function levelToRole(level) {
  switch (level) {
    case 0:
      return 'owner';
    case 1:
      return 'admin';
    case 2:
      return 'verified_user';
    case 3:
      return 'unverified_user';
    default:
      return 'guest';
  }
}


// Example usage (JSX) - comment block only. Do not import automatically.
/*
import React from 'react';
import { getPermissionsForRole, canAccessSystemSetup, canManageRoles } from '../config/rolePermissions';

function ExampleComponent({ currentUserRole }) {
  const perms = getPermissionsForRole(currentUserRole);

  return (
    <div>
      {canAccessSystemSetup(currentUserRole) && (
        <section>
          <h3>System Setup</h3>
          <p>Owner-only initialization tools go here.</p>
        </section>
      )}

      {canManageRoles(currentUserRole) ? (
        <button>Open Role Editor</button>
      ) : (
        <div className="text-muted">You do not have permission to manage roles.</div>
      )}
    </div>
  );
}
*/
