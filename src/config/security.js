// Security configuration for blog system
export const SECURITY_CONFIG = {
  // Authorized owner emails - only these emails can initialize the system
  AUTHORIZED_OWNERS: [
    'zhu.ziqi@foxmail.com',  // Change this to your email
    // Add more authorized emails if needed
  ],
  
  // Maximum number of owners allowed (recommended: 1)
  MAX_OWNERS: 1,
  
  // Enable debug mode for development
  DEBUG_MODE: process.env.NODE_ENV === 'development'
};

// Helper function to check if email is authorized
export const isAuthorizedOwner = (email) => {
  if (!email) return false;
  return SECURITY_CONFIG.AUTHORIZED_OWNERS.includes(email.toLowerCase());
};

// Helper function to check if more owners can be added
export const canAddMoreOwners = (currentOwnerCount) => {
  return currentOwnerCount < SECURITY_CONFIG.MAX_OWNERS;
};

export default SECURITY_CONFIG;