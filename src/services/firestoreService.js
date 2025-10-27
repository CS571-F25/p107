// Firestore database service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

/**
 * User Profile Service
 */
export const userProfileService = {
  // Create or update user profile
  async setProfile(userId, data) {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // Get user profile
  async getProfile(userId) {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  }
};

// Posts Service Example
export const postsService = {
  // Create new post
  async createPost(authorId, { title, content }) {
    const docRef = await addDoc(collection(db, 'posts'), {
      title,
      content,
      authorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Get all posts
  async getAllPosts() {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get user's posts
  async getUserPosts(authorId) {
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Update post
   */
  async updatePost(postId, updates) {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Delete post
   */
  async deletePost(postId) {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
  },

  /**
   * Listen to posts in real-time
   * @param {Function} callback - Callback receives array of posts
   * @returns {Function} - Returns unsubscribe function
   */
  listenToPosts(callback) {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      callback(posts);
    }, (error) => {
      console.error('Error listening to posts:', error);
    });
  }
};