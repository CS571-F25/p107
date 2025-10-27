// Firebase Authentication  Firebase Authentication service
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { auth } from '../firebase/config.js';

/**
 * ¨å?/ Register new user
 * @param {Object} payload - { email, password, nickname }
 * @returns {Promise<Object>} - { ok: true }
 */
export async function register({ email, password, nickname }) {
  try {
    //  Firebase ¨æ Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // ¨æ If nickname provided, update profile
    if (nickname) {
      await updateProfile(userCredential.user, {
        displayName: nickname
      });
    }
    
    return { ok: true };
  } catch (error) {
    //  Firebase ¯¯?/ Handle Firebase error codes
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
    };
    throw new Error(errorMessages[error.code] || error.message);
  }
}

/**
 * ¨æ User login
 * @param {Object} payload - { email, password }
 * @returns {Promise<Object>} - { token, user: { email, nickname } }
 */
export async function login({ email, password }) {
  try {
    // Firebase  Firebase sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    //  ID Token¯é/ Get ID token (for backend verification)
    const token = await user.getIdToken();
    
    return {
      token,
      user: {
        email: user.email,
        nickname: user.displayName || user.email.split('@')[0]
      }
    };
  } catch (error) {
    //  Firebase ¯¯?/ Handle Firebase error codes
    const errorMessages = {
      'auth/user-not-found': 'Invalid email or password.',
      'auth/wrong-password': 'Invalid email or password.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/invalid-credential': 'Invalid email or password.',
    };
    throw new Error(errorMessages[error.code] || error.message);
  }
}

/**
 * ¨æ User logout
 * @returns {Promise<Object>} - { ok: true }
 */
export async function logout() {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * ®¤?/ Get current stored auth info
 * Firebase  onAuthStateChanged ªå¡ç­¤®¹?
 * Firebase manages this via onAuthStateChanged, keep for compatibility
 * @returns {Object} - { token: null, user: null }
 */
export function getStoredAuth() {
  // Firebase  onAuthStateChanged ¨ç®¡?
  // Firebase uses onAuthStateChanged listener to manage state
  // ¤å£ç AuthProvider ¡ç
  // This function is for legacy compatibility, actual state managed by AuthProvider
  return { token: null, user: null };
}

/**
 * €?/ Send email verification
 * @param {Object} user - Firebase user object (optional, defaults to current user)
 * @returns {Promise<Object>} - { ok: true }
 */
export async function sendVerificationEmail(user = null) {
  try {
    const targetUser = user || auth.currentUser;
    if (!targetUser) {
      throw new Error('No user is currently signed in.');
    }
    
    await sendEmailVerification(targetUser);
    return { ok: true };
  } catch (error) {
    const errorMessages = {
      'auth/too-many-requests': 'Too many requests. Please try again later.',
      'auth/user-not-found': 'User not found.',
    };
    throw new Error(errorMessages[error.code] || error.message);
  }
}

/**
 * €®é?/ Send password reset email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - { ok: true }
 */
export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { ok: true };
  } catch (error) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/too-many-requests': 'Too many requests. Please try again later.',
    };
    throw new Error(errorMessages[error.code] || error.message);
  }
}

/**
 * ®ç®±?/ Verify email verification code
 * @param {string} actionCode - Action code from email link
 * @returns {Promise<Object>} - { ok: true }
 */
export async function verifyEmail(actionCode) {
  try {
    await applyActionCode(auth, actionCode);
    return { ok: true };
  } catch (error) {
    const errorMessages = {
      'auth/expired-action-code': 'The verification link has expired.',
      'auth/invalid-action-code': 'The verification link is invalid.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'User not found.',
    };
    throw new Error(errorMessages[error.code] || error.message);
  }
}

/**
 * ?/ Verify password reset code
 * @param {string} actionCode - Action code from reset email
 * @returns {Promise<string>} - User's email address
 */
export async function verifyPasswordResetToken(actionCode) {
  try {
    const email = await verifyPasswordResetCode(auth, actionCode);
    return email;
  } catch (error) {
    const errorMessages = {
      'auth/expired-action-code': 'The reset link has expired.',
      'auth/invalid-action-code': 'The reset link is invalid.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'User not found.',
    };
    throw new Error(errorMessages[error.code] || error.message);
  }
}

/**
 * ®è®¤ Confirm password reset
 * @param {string} actionCode - Action code from reset email
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - { ok: true }
 */
export async function resetPassword(actionCode, newPassword) {
  try {
    await confirmPasswordReset(auth, actionCode, newPassword);
    return { ok: true };
  } catch (error) {
    const errorMessages = {
      'auth/expired-action-code': 'The reset link has expired.',
      'auth/invalid-action-code': 'The reset link is invalid.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'User not found.',
    };
    throw new Error(errorMessages[error.code] || error.message);
  }
}

/**
 * €¥å¦å®ç®± Check if current user has verified email
 * @returns {boolean} - true if email is verified
 */
export function isEmailVerified() {
  return auth.currentUser?.emailVerified || false;
}

/**
 * ¨æ Reload current user data
 * ¨ä emailVerified €?/ Used to refresh emailVerified status
 * @returns {Promise<void>}
 */
export async function reloadUser() {
  if (auth.currentUser) {
    await auth.currentUser.reload();
  }
}
