import { useState, useContext } from 'react';
import { Link } from 'react-router';
import { createPost } from '../../services/blogService';
import ThemeContext from '../contexts/ThemeContext';

export default function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    isPublished: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author: 'Eliot Zhu',
        readTime: Math.ceil(formData.content.split(' ').length / 200) // Estimate reading time
      };

      const postId = await createPost(postData);
      setMessage(`Post created successfully! ID: ${postId}`);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
        isPublished: false
      });
    } catch (err) {
      setError(`Error creating post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const containerStyle = {
    maxWidth: 800,
    padding: '1rem',
    color: isDark ? '#e9ecef' : '#212529'
  };

  const inputStyle = {
    width: '100%',
    padding: 6,
    marginTop: 4,
    backgroundColor: isDark ? '#495057' : '#ffffff',
    color: isDark ? '#e9ecef' : '#212529',
    border: `1px solid ${isDark ? '#6c757d' : '#ced4da'}`,
    borderRadius: 4
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical'
  };

  const selectStyle = {
    ...inputStyle
  };

  const buttonStyle = {
    marginRight: 12,
    padding: '8px 16px',
    backgroundColor: isDark ? '#0d6efd' : '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1
  };

  const successStyle = {
    color: isDark ? '#d1e7dd' : 'green',
    marginBottom: 16,
    padding: 8,
    backgroundColor: isDark ? '#0f5132' : '#d4edda',
    border: `1px solid ${isDark ? '#146c43' : '#c3e6cb'}`,
    borderRadius: 4
  };

  const errorStyle = {
    color: isDark ? '#f8d7da' : 'crimson',
    marginBottom: 16,
    padding: 8,
    backgroundColor: isDark ? '#842029' : '#f8d7da',
    border: `1px solid ${isDark ? '#a41e22' : '#f5c6cb'}`,
    borderRadius: 4
  };

  const labelStyle = {
    color: isDark ? '#e9ecef' : '#212529',
    fontWeight: '500'
  };

  const helpTextStyle = {
    fontSize: 14,
    color: isDark ? '#adb5bd' : '#666',
    marginTop: 4
  };

  return (
    <div style={containerStyle}>
      <h1>Create New Blog Post</h1>
      
      {message && (
        <div style={successStyle}>
          {message}
        </div>
      )}
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Title</label>
          <br />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter post title"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Category</label>
          <br />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={selectStyle}
          >
            <option value="">Select category</option>
            <option value="travel">Travel</option>
            <option value="tech">Tech</option>
            <option value="cycling">Cycling</option>
            <option value="personal">Personal</option>
            <option value="adventures">Adventures</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Tags</label>
          <br />
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas (e.g., travel, taiwan, cycling)"
            style={inputStyle}
          />
          <div style={helpTextStyle}>
            Separate multiple tags with commas
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Excerpt</label>
          <br />
          <textarea
            rows={3}
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief description of the post (optional - will be auto-generated if empty)"
            style={textareaStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Content</label>
          <br />
          <textarea
            rows={15}
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Write your blog post content here... (Markdown supported)"
            style={textareaStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, ...labelStyle }}>
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            Publish immediately
          </label>
          <div style={helpTextStyle}>
            Uncheck to save as draft
          </div>
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Creating...' : 'Create Post'}
        </button>
        
        <Link to="/" style={{ marginLeft: 12, color: isDark ? '#78c2ad' : '#007bff' }}>Back to Home</Link>
      </form>
    </div>
  );
}