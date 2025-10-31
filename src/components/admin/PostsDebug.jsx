import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ThemeContext from '../contexts/ThemeContext';

export default function PostsDebug() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const allPosts = [];
      
      querySnapshot.forEach((doc) => {
        allPosts.push({
          id: doc.id,
          ...doc.data(),
          publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
        });
      });
      
      setPosts(allPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async (postId) => {
    try {
      setUpdating(postId);
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        isPublished: true
      });
      
      // Refresh the list
      await fetchAllPosts();
      alert('Post published successfully!');
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Error publishing post: ' + error.message);
    } finally {
      setUpdating(null);
    }
  };

  const unpublishPost = async (postId) => {
    try {
      setUpdating(postId);
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        isPublished: false
      });
      
      // Refresh the list
      await fetchAllPosts();
      alert('Post unpublished successfully!');
    } catch (error) {
      console.error('Error unpublishing post:', error);
      alert('Error unpublishing post: ' + error.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: 800, 
        padding: '1rem',
        color: isDark ? '#e9ecef' : '#212529'
      }}>
        <h1>Posts Debug</h1>
        <p>Loading posts...</p>
      </div>
    );
  }

  const containerStyle = {
    maxWidth: 800, 
    padding: '1rem',
    color: isDark ? '#e9ecef' : '#212529'
  };

  const postCardStyle = (isPublished) => ({
    border: `1px solid ${isDark ? '#495057' : '#ddd'}`,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    backgroundColor: isDark 
      ? (isPublished ? '#1a4a2e' : '#4a1e1e') 
      : (isPublished ? '#d4edda' : '#f8d7da'),
    color: isDark ? '#e9ecef' : '#212529'
  });

  const buttonStyle = (variant, disabled) => ({
    backgroundColor: variant === 'danger' 
      ? (isDark ? '#dc3545' : '#dc3545')
      : (isDark ? '#198754' : '#28a745'),
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: 4,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer'
  });

  const infoBoxStyle = {
    marginTop: 24,
    padding: 16,
    backgroundColor: isDark ? '#343a40' : '#f8f9fa',
    border: `1px solid ${isDark ? '#495057' : '#dee2e6'}`,
    borderRadius: 4,
    color: isDark ? '#e9ecef' : '#212529'
  };

  return (
    <div style={containerStyle}>
      <h1>Posts Debug ({posts.length} total posts)</h1>
      
      <div style={{ marginBottom: 16 }}>
        <Link to="/">← Back to Home</Link> | 
        <Link to="/admin/setup" style={{ marginLeft: 8 }}>Quick Setup</Link>
      </div>

      {posts.length === 0 ? (
        <div>
          <p>No posts found in database.</p>
          <Link to="/admin/setup">Create some sample posts</Link>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <div 
              key={post.id} 
              style={postCardStyle(post.isPublished)}
            >
              <h3>{post.title}</h3>
              <p><strong>ID:</strong> {post.id}</p>
              <p><strong>Published:</strong> {post.isPublished ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Category:</strong> {post.category}</p>
              <p><strong>Author:</strong> {post.author}</p>
              <p><strong>Created:</strong> {post.publishedAt ? post.publishedAt.toString() : 'No date'}</p>
              
              <div style={{ marginTop: 12 }}>
                {post.isPublished ? (
                  <button 
                    onClick={() => unpublishPost(post.id)}
                    disabled={updating === post.id}
                    style={buttonStyle('danger', updating === post.id)}
                  >
                    {updating === post.id ? 'Updating...' : 'Unpublish'}
                  </button>
                ) : (
                  <button 
                    onClick={() => publishPost(post.id)}
                    disabled={updating === post.id}
                    style={buttonStyle('success', updating === post.id)}
                  >
                    {updating === post.id ? 'Publishing...' : 'Publish'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={infoBoxStyle}>
        <h3>Debug Info:</h3>
        <p><strong>Total posts in database:</strong> {posts.length}</p>
        <p><strong>Published posts:</strong> {posts.filter(p => p.isPublished).length}</p>
        <p><strong>Draft posts:</strong> {posts.filter(p => !p.isPublished).length}</p>
      </div>
    </div>
  );
}