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
import { db, auth } from '../firebase/config';
import { getUserLevel, hasPermission, logAction, ROLE_LEVELS } from './roleService';
import { getLikeCount, hasLiked } from './likeService';

const POSTS_COLLECTION = 'posts';

// Post status constants
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Create blog post
export const createPost = async (postData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to create posts');
    }

    // Check permission
    const canCreate = await hasPermission(userId, 'blog:write-own') || 
                     await hasPermission(userId, 'blog:write-all');
    if (!canCreate) {
      throw new Error('You do not have permission to create posts');
    }

    // Generate slug from title if not provided
    const slug = postData.slug || generateSlug(postData.title);
    
    // Check if slug is unique
    await validateUniqueSlug(slug);

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
      ...postData,
      slug,
      authorId: userId,
      status: postData.status || POST_STATUS.DRAFT,
      publishedAt: postData.status === POST_STATUS.PUBLISHED ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      views: 0,
      // Use the isPublished value from postData for backward compatibility
      isPublished: postData.status === POST_STATUS.PUBLISHED || postData.isPublished === true
    });

    // Log the action
    await logAction({
      actorId: userId,
      action: 'blog:create',
      entityType: 'post',
      entityId: docRef.id,
      meta: { status: postData.status || POST_STATUS.DRAFT }
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get all published blog posts (with pagination and permission-based filtering)
export const getPosts = async (limitCount = 10, filterOptions = {}) => {
  try {
    const userId = auth.currentUser?.uid;
    const { 
      status = 'published-only',  // 'published-only', 'all', 'drafts-only'
      authorId = null,
      category = null
    } = filterOptions;

    let q;
    
    // Determine what posts user can see based on permissions
    const canViewAll = userId && await hasPermission(userId, 'view:all-posts');
    const userLevel = await getUserLevel(userId);
    
    if (status === 'all' && canViewAll) {
      // Admin/Owner can see all posts
      q = collection(db, POSTS_COLLECTION);
    } else if (status === 'drafts-only' && canViewAll) {
      // Admin/Owner can see all drafts
      q = query(collection(db, POSTS_COLLECTION), where('status', '==', POST_STATUS.DRAFT));
    } else if (status === 'my-drafts' && userId) {
      // Authors can see their own drafts
      q = query(
        collection(db, POSTS_COLLECTION), 
        where('authorId', '==', userId),
        where('status', '==', POST_STATUS.DRAFT)
      );
    } else {
      // Default: only published posts
      q = query(collection(db, POSTS_COLLECTION), where('status', '==', POST_STATUS.PUBLISHED));
    }

    // Add additional filters
    if (authorId) {
      q = query(q, where('authorId', '==', authorId));
    }
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to JavaScript Date
        publishedAt: data.publishedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    // Sort by publishedAt or createdAt in JavaScript and limit results
    const sortedPosts = posts
      .filter(post => {
        // Additional permission-based filtering
        if (post.status === POST_STATUS.PUBLISHED) return true;
        if (!userId) return false;
        
        // User can see their own drafts
        if (post.authorId === userId) return true;
        
        // Admin can see all
        return canViewAll;
      })
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt || new Date(0);
        const dateB = b.publishedAt || b.createdAt || new Date(0);
        return dateB - dateA;
      })
      .slice(0, limitCount);

    // Enhance posts with like information for logged-in users
    if (userId) {
      for (const post of sortedPosts) {
        try {
          post.likeCount = await getLikeCount(post.id);
          post.userHasLiked = await hasLiked(post.id, userId);
        } catch (error) {
          console.warn('Error fetching like info for post:', post.id, error);
          post.likeCount = post.likes || 0;
          post.userHasLiked = false;
        }
      }
    } else {
      // For non-logged-in users, just use the stored like count
      for (const post of sortedPosts) {
        post.likeCount = await getLikeCount(post.id);
        post.userHasLiked = false;
      }
    }
    
    return sortedPosts;
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Get single blog post with permission checks
export const getPost = async (postId) => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Post not found');
    }

    const data = docSnap.data();
    const userId = auth.currentUser?.uid;
    
    // Permission check
    const canViewPost = await canUserViewPost(data, userId);
    if (!canViewPost) {
      throw new Error('You do not have permission to view this post');
    }
    
    // Increment view count only for published posts and authenticated users
    // Skip for guest users to avoid permission errors
    if (data.status === POST_STATUS.PUBLISHED && userId) {
      try {
        await updateDoc(docRef, {
          views: (data.views || 0) + 1
        });
      } catch (err) {
        // Silently fail if user doesn't have write permission
        console.log('Could not update view count (user may not have permission)');
      }
    }

    const post = {
      id: docSnap.id,
      ...data,
      publishedAt: data.publishedAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      views: (data.views || 0) + (data.status === POST_STATUS.PUBLISHED && userId ? 1 : 0)
    };

    // Add like information
    if (userId) {
      post.likeCount = await getLikeCount(postId);
      post.userHasLiked = await hasLiked(postId, userId);
    } else {
      post.likeCount = await getLikeCount(postId);
      post.userHasLiked = false;
    }

    return post;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

// Update blog post with permission checks
export const updatePost = async (postId, updateData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to update posts');
    }

    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Post not found');
    }

    const postData = docSnap.data();
    
    // Check permission
    const canEdit = await canUserEditPost(postData, userId);
    if (!canEdit) {
      throw new Error('You do not have permission to edit this post');
    }

    // If slug is being changed, validate uniqueness
    if (updateData.slug && updateData.slug !== postData.slug) {
      await validateUniqueSlug(updateData.slug, postId);
    }

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    // Log the action
    await logAction({
      actorId: userId,
      action: 'blog:update',
      entityType: 'post',
      entityId: postId,
      meta: { fields: Object.keys(updateData) }
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Publish post
export const publishPost = async (postId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to publish posts');
    }

    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Post not found');
    }

    const postData = docSnap.data();
    
    // Check permission
    const canPublish = await canUserPublishPost(postData, userId);
    if (!canPublish) {
      throw new Error('You do not have permission to publish this post');
    }

    // Validate post has required fields
    if (!postData.title || !postData.content) {
      throw new Error('Post must have title and content to be published');
    }

    await updateDoc(docRef, {
      status: POST_STATUS.PUBLISHED,
      isPublished: true, // For backward compatibility
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Log the action
    await logAction({
      actorId: userId,
      action: 'blog:publish',
      entityType: 'post',
      entityId: postId
    });

    return true;
  } catch (error) {
    console.error('Error publishing post:', error);
    throw error;
  }
};

// Unpublish post (back to draft)
export const unpublishPost = async (postId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to unpublish posts');
    }

    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Post not found');
    }

    const postData = docSnap.data();
    
    // Check permission (usually admin only)
    const canUnpublish = await hasPermission(userId, 'blog:publish-all') ||
                        (postData.authorId === userId && await hasPermission(userId, 'blog:publish-own'));
    if (!canUnpublish) {
      throw new Error('You do not have permission to unpublish this post');
    }

    await updateDoc(docRef, {
      status: POST_STATUS.DRAFT,
      isPublished: false, // For backward compatibility
      updatedAt: serverTimestamp()
    });

    // Log the action
    await logAction({
      actorId: userId,
      action: 'blog:unpublish',
      entityType: 'post',
      entityId: postId
    });

    return true;
  } catch (error) {
    console.error('Error unpublishing post:', error);
    throw error;
  }
};

// Delete blog post with permission checks
export const deletePost = async (postId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to delete posts');
    }

    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Post not found');
    }

    const postData = docSnap.data();
    
    // Check permission
    const canDelete = await canUserDeletePost(postData, userId);
    if (!canDelete) {
      throw new Error('You do not have permission to delete this post');
    }

    await deleteDoc(docRef);

    // Log the action
    await logAction({
      actorId: userId,
      action: 'blog:delete',
      entityType: 'post',
      entityId: postId,
      meta: { title: postData.title }
    });

    return true;
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

// Generate URL-friendly slug from title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Validate unique slug
export const validateUniqueSlug = async (slug, excludePostId = null) => {
  try {
    const q = query(collection(db, POSTS_COLLECTION), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    // Check if any existing post has this slug (excluding current post if updating)
    let isUnique = true;
    querySnapshot.forEach((doc) => {
      if (excludePostId && doc.id === excludePostId) {
        return; // Skip the current post being updated
      }
      isUnique = false;
    });

    if (!isUnique) {
      throw new Error(`Slug "${slug}" is already in use. Please choose a different one.`);
    }

    return true;
  } catch (error) {
    console.error('Error validating slug:', error);
    throw error;
  }
};

// Get single blog post by slug with permission checks
export const getPostBySlug = async (slug) => {
  try {
    console.log('🔍 getPostBySlug called with slug:', slug);
    
    const q = query(collection(db, POSTS_COLLECTION), where('slug', '==', slug));
    console.log('🔍 Executing Firestore query...');
    
    const querySnapshot = await getDocs(q);
    console.log('🔍 Query result - empty?', querySnapshot.empty);
    
    if (querySnapshot.empty) {
      console.log('❌ No post found with slug:', slug);
      throw new Error('Post not found');
    }

    let postDoc = null;
    querySnapshot.forEach((doc) => {
      postDoc = doc;
    });

    const data = postDoc.data();
    const userId = auth.currentUser?.uid;
    
    console.log('🔍 Post data:', {
      slug: data.slug,
      status: data.status,
      isPublished: data.isPublished,
      title: data.title
    });
    console.log('🔍 Current user ID:', userId);
    
    // Permission check
    console.log('🔍 Checking permissions...');
    const canViewPost = await canUserViewPost(data, userId);
    console.log('🔍 Can view post:', canViewPost);
    
    if (!canViewPost) {
      console.log('❌ Permission denied for post:', data.title);
      throw new Error('You do not have permission to view this post');
    }
    
    // Increment view count only for published posts and authenticated users
    // Guest users can read but cannot write (update view count)
    if (data.status === POST_STATUS.PUBLISHED && userId) {
      try {
        await updateDoc(postDoc.ref, {
          views: (data.views || 0) + 1
        });
        console.log('📈 View count updated');
      } catch (error) {
        console.log('⚠️ Could not update view count (guest user):', error.message);
        // Don't throw error - guest access should still work
      }
    }

    const post = {
      id: postDoc.id,
      ...data,
      publishedAt: data.publishedAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      views: (data.views || 0) + (data.status === POST_STATUS.PUBLISHED && userId ? 1 : 0)
    };

    // Add like information
    if (userId) {
      post.likeCount = await getLikeCount(postDoc.id);
      post.userHasLiked = await hasLiked(postDoc.id, userId);
    } else {
      post.likeCount = await getLikeCount(postDoc.id);
      post.userHasLiked = false;
    }

    return post;
  } catch (error) {
    console.error('Error getting post by slug:', error);
    throw error;
  }
};
export const canUserViewPost = async (postData, userId) => {
  console.log('🔍 canUserViewPost called:', {
    userId,
    postStatus: postData.status,
    postIsPublished: postData.isPublished,
    postTitle: postData.title
  });
  
  // Published posts are viewable by everyone
  // Check both new status field and legacy isPublished field for compatibility
  const isPublished = postData.status === POST_STATUS.PUBLISHED || postData.isPublished === true;
  console.log('🔍 Post is published?', isPublished);
  
  if (isPublished) {
    console.log('✅ Post is published, allowing access to everyone');
    return true;
  }

  console.log('🔍 Post is not published, checking user permissions...');

  // Not logged in and post is not published
  if (!userId) {
    console.log('❌ Guest user trying to access unpublished post');
    return false;
  }

  console.log('🔍 Checking author permissions...');

  // Author can view their own posts
  if (postData.authorId === userId) {
    console.log('✅ User is the author');
    return true;
  }

  // Admin can view all posts - only check this for authenticated users
  console.log('🔍 Checking admin permissions for authenticated user...');
  try {
    const hasAdminAccess = await hasPermission(userId, 'view:all-posts');
    console.log('🔍 Has admin access:', hasAdminAccess);
    return hasAdminAccess;
  } catch (error) {
    console.error('❌ Error checking admin permissions:', error);
    return false;
  }
};

export const canUserEditPost = async (postData, userId) => {
  if (!userId) return false;

  // Admin can edit all posts
  if (await hasPermission(userId, 'blog:write-all')) {
    return true;
  }

  // Author can edit their own posts
  if (postData.authorId === userId && await hasPermission(userId, 'blog:write-own')) {
    return true;
  }

  return false;
};

export const canUserPublishPost = async (postData, userId) => {
  if (!userId) return false;

  // Admin can publish any post
  if (await hasPermission(userId, 'blog:publish-all')) {
    return true;
  }

  // Author can publish their own posts (if they have permission)
  if (postData.authorId === userId && await hasPermission(userId, 'blog:publish-own')) {
    return true;
  }

  return false;
};

export const canUserDeletePost = async (postData, userId) => {
  if (!userId) return false;

  // Admin can delete any post
  if (await hasPermission(userId, 'blog:delete-all')) {
    return true;
  }

  // Author can delete their own posts
  if (postData.authorId === userId && await hasPermission(userId, 'blog:delete-own')) {
    return true;
  }

  return false;
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