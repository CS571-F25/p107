import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const POSTS_COLLECTION = 'posts';

// Create blog post
export const createPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
      ...postData,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      views: 0,
      // Use the isPublished value from postData, default to false if not specified
      isPublished: postData.isPublished !== undefined ? postData.isPublished : false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get all published blog posts (with pagination)
export const getPosts = async (limitCount = 10, isPublishedOnly = true) => {
  try {
    let q;
    
    if (isPublishedOnly) {
      // Use a simpler query that doesn't require a composite index
      // First get all posts, then filter and sort in JavaScript
      q = query(collection(db, POSTS_COLLECTION), where('isPublished', '==', true));
    } else {
      q = collection(db, POSTS_COLLECTION);
    }
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to JavaScript Date
        publishedAt: doc.data().publishedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });
    
    // Sort by publishedAt in JavaScript and limit results
    const sortedPosts = posts
      .filter(post => post.publishedAt) // Filter out posts without publishedAt
      .sort((a, b) => b.publishedAt - a.publishedAt) // Sort by date descending
      .slice(0, limitCount); // Apply limit
    
    return sortedPosts;
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Get single blog post
export const getPost = async (postId) => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Increment view count
      await updateDoc(docRef, {
        views: (data.views || 0) + 1
      });
      
      return {
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        views: (data.views || 0) + 1
      };
    } else {
      throw new Error('Post not found');
    }
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

// Update blog post
export const updatePost = async (postId, updateData) => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete blog post
export const deletePost = async (postId) => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Get posts by tag
export const getPostsByTag = async (tag, limitCount = 10) => {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('tags', 'array-contains', tag),
      where('isPublished', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts by tag:', error);
    throw error;
  }
};

// Get posts by category
export const getPostsByCategory = async (category, limitCount = 10) => {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('category', '==', category),
      where('isPublished', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts by category:', error);
    throw error;
  }
};

// Like post
export const likePost = async (postId) => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentLikes = docSnap.data().likes || 0;
      await updateDoc(docRef, {
        likes: currentLikes + 1
      });
      return currentLikes + 1;
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Calculate reading time (estimate: 200 words per minute)
export const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Generate article excerpt
export const generateExcerpt = (content, maxLength = 150) => {
  // Remove Markdown syntax
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
};