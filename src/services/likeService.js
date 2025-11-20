// Like system service for blog posts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { logAction } from './roleService';

const LIKES_COLLECTION = 'likes';

// Like a post (idempotent - won't create duplicates)
export const likePost = async (postId, userId) => {
  try {
    if (!userId) {
      throw new Error('User must be logged in to like posts');
    }

    // Check if user already liked this post
    const existingLike = await getLike(postId, userId);
    if (existingLike) {
      // Already liked - return current state
      const likeCount = await getLikeCount(postId);
      return {
        liked: true,
        total: likeCount,
        message: 'Post already liked'
      };
    }

    // Create new like record
    const likeId = `${postId}_${userId}`;
    await setDoc(doc(db, LIKES_COLLECTION, likeId), {
      postId,
      userId,
      createdAt: serverTimestamp()
    });

    // Log the action
    await logAction({
      actorId: userId,
      action: 'blog:like',
      entityType: 'post',
      entityId: postId,
      meta: { likeId }
    });

    const likeCount = await getLikeCount(postId);
    return {
      liked: true,
      total: likeCount,
      message: 'Post liked successfully'
    };
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (postId, userId) => {
  try {
    if (!userId) {
      throw new Error('User must be logged in to unlike posts');
    }

    const likeId = `${postId}_${userId}`;
    const likeRef = doc(db, LIKES_COLLECTION, likeId);
    
    // Check if like exists
    const likeDoc = await getDoc(likeRef);
    if (!likeDoc.exists()) {
      const likeCount = await getLikeCount(postId);
      return {
        liked: false,
        total: likeCount,
        message: 'Post not previously liked'
      };
    }

    // Remove like
    await deleteDoc(likeRef);

    // Log the action
    await logAction({
      actorId: userId,
      action: 'blog:unlike',
      entityType: 'post',
      entityId: postId,
      meta: { likeId }
    });

    const likeCount = await getLikeCount(postId);
    return {
      liked: false,
      total: likeCount,
      message: 'Post unliked successfully'
    };
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Get like status for a user and post
export const getLike = async (postId, userId) => {
  try {
    if (!userId) return null;

    const likeId = `${postId}_${userId}`;
    const likeDoc = await getDoc(doc(db, LIKES_COLLECTION, likeId));
    
    if (likeDoc.exists()) {
      return {
        id: likeDoc.id,
        ...likeDoc.data(),
        createdAt: likeDoc.data().createdAt?.toDate()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting like:', error);
    return null;
  }
};

// Check if user has liked a post
export const hasLiked = async (postId, userId) => {
  const like = await getLike(postId, userId);
  return !!like;
};

// Get total like count for a post
export const getLikeCount = async (postId) => {
  try {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('postId', '==', postId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
};

// Get all likes for a post (admin only)
export const getPostLikes = async (postId) => {
  try {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('postId', '==', postId)
    );
    const querySnapshot = await getDocs(q);
    
    const likes = [];
    querySnapshot.forEach((doc) => {
      likes.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    return likes;
  } catch (error) {
    console.error('Error getting post likes:', error);
    throw error;
  }
};

// Get user's liked posts
export const getUserLikedPosts = async (userId) => {
  try {
    if (!userId) return [];

    const q = query(
      collection(db, LIKES_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const likes = [];
    querySnapshot.forEach((doc) => {
      likes.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    return likes;
  } catch (error) {
    console.error('Error getting user liked posts:', error);
    throw error;
  }
};

// Toggle like status (like if not liked, unlike if liked)
export const toggleLike = async (postId, userId) => {
  try {
    const isLiked = await hasLiked(postId, userId);
    
    if (isLiked) {
      return await unlikePost(postId, userId);
    } else {
      return await likePost(postId, userId);
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export default {
  likePost,
  unlikePost,
  getLike,
  hasLiked,
  getLikeCount,
  getPostLikes,
  getUserLikedPosts,
  toggleLike
};