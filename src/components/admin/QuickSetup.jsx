import { useState, useContext } from 'react';
import { Link } from 'react-router';
import { createPost } from '../../services/blogService';
import ThemeContext from '../contexts/ThemeContext';

export default function QuickSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const samplePosts = [
    {
      title: "Cycling Around Taiwan: 1,000km of Discovery",
      category: "travel",
      tags: ["taiwan", "cycling", "adventure", "solo-travel"],
      excerpt: "A solo cycling journey around the beautiful island of Taiwan, from bustling Taipei to the highest peaks in Southeast Asia.",
      content: `# Cycling Around Taiwan: 1,000km of Discovery

## The Beginning

Three months ago, I made a decision that would change my perspective on travel forever. Instead of flying around Taiwan like most tourists, I decided to cycle the entire island - all 1,000 kilometers of it.

## The Route

Starting from **Taipei**, my route took me through:
- The dramatic coastlines of the East Coast
- The challenging climbs to Taroko National Park  
- The highest road in Southeast Asia at 3,275 meters
- Remote indigenous villages in the mountains
- The tropical south with its endless rice fields

## Lessons Learned

### Physical Challenges
The physical demands were immense. Climbing from sea level to over 3,000 meters in a single day tested every muscle in my body.

### Mental Resilience
But the mental challenges were even greater. Long hours alone with my thoughts, pushing through pain, and navigating in a foreign language built a resilience I never knew I had.

### Cultural Immersion
Staying in local guesthouses and eating at family-run restaurants gave me insights into Taiwanese culture that no guidebook could provide.

## The Summit

Reaching the highest point was surreal. Standing at 3,275 meters, looking down at clouds below and the Pacific Ocean in the distance, I felt a profound sense of accomplishment.

## Reflection

This journey taught me that the most rewarding experiences often come from choosing the difficult path. Taiwan by bicycle isn't just about covering distance - it's about discovering what you're capable of when you commit fully to something challenging.

*Next up: Planning a bikepacking route from the Midwest to the Pacific...*`,
      isPublished: true,
      author: "Eliot Zhu"
    },
    {
      title: "Learning to Orienteer: Finding Direction in High School",
      category: "personal",
      tags: ["orienteering", "navigation", "high-school", "personal-growth"],
      excerpt: "How learning to navigate with map and compass in high school became a metaphor for finding direction in life.",
      content: `# Learning to Orienteer: Finding Direction in High School

## An Unexpected Discovery

High school can be a confusing time. For me, clarity came in an unexpected form: orienteering. What started as a random elective became a foundational skill that shaped how I approach challenges.

## The Basics

Orienteering is simple in concept: navigate from point to point using only a map and compass. No GPS, no digital assistance - just your ability to read terrain and trust your navigation skills.

## Early Struggles

My first few races were disasters. I'd get lost within minutes, spending hours wandering in circles while other participants finished the course. But something about the challenge kept pulling me back.

## The Breakthrough

The moment everything clicked was during a particularly challenging race in dense forest. I was lost (again), but instead of panicking, I stopped, took a bearing, and methodically worked my way back to a known point.

## Life Lessons

### Trust the Process
Orienteering taught me to trust systematic approaches over gut feelings. When you're lost in the woods, panic doesn't help - methodical navigation does.

### Embrace Getting Lost
Being lost isn't failure; it's information. Every wrong turn teaches you something about the terrain and about yourself.

### Confidence Through Competence
As my navigation skills improved, so did my confidence in tackling other challenges. If I could find my way through unmarked wilderness, I could figure out other complex problems too.

## Beyond High School

These navigation skills proved invaluable during my cycling adventures. But more importantly, the mental framework - break down complex problems, trust your tools, stay calm under pressure - became my approach to everything from coding to life decisions.

## Today

I still orienteer when I can. There's something profoundly satisfying about moving confidently through unknown terrain with nothing but a map, compass, and the skills you've developed.

*Sometimes the best way to find where you're going is to learn how to navigate when you're lost.*`,
      isPublished: true,
      author: "Eliot Zhu"
    },
    {
      title: "Growing Up by West Lake: Reflections from Hangzhou",
      category: "personal",
      tags: ["hangzhou", "childhood", "west-lake", "china", "memories"],
      excerpt: "Memories and reflections from growing up near one of China's most beautiful landmarks.",
      content: `# Growing Up by West Lake: Reflections from Hangzhou

## A Childhood Paradise

Growing up in Hangzhou meant having West Lake as my backyard. This UNESCO World Heritage site wasn't just a tourist destination - it was where I learned to ride a bike, where my family took evening walks, and where I first developed my love for exploration.

## Seasons of Change

### Spring: Cherry Blossoms and New Beginnings
Spring at West Lake was magical. Cherry blossoms reflected in still water, families picnicking on the grass, and the sense that anything was possible.

### Summer: Lotus Flowers and Long Days
Summer meant lotus flowers blooming across the lake's surface and long bicycle rides on the causeways that divide the lake into sections.

### Fall: Golden Leaves and Contemplation
Autumn brought golden leaves and cooler temperatures perfect for longer walks around the lake's perimeter.

### Winter: Solitude and Reflection
Winter was quieter, with fewer crowds and a peaceful atmosphere perfect for contemplation.

## Cultural Heritage

Living near West Lake meant growing up surrounded by 1,000 years of Chinese poetry, art, and literature. Every pavilion, bridge, and garden had stories stretching back centuries.

## Learning to Appreciate Beauty

Having such natural beauty as part of daily life taught me to notice and appreciate environmental aesthetics. This appreciation later influenced my choice to seek out beautiful places for cycling and hiking adventures.

## A Global Perspective

Watching millions of tourists visit my hometown each year gave me perspective on how special places can be shared and appreciated by people from all cultures.

## Carrying It Forward

Now studying in Madison, I find myself drawn to Lake Mendota, which reminds me of home. The connection between water, nature, and urban life that I learned in Hangzhou continues to shape where I choose to live and travel.

## Full Circle

West Lake taught me that home isn't just a place - it's a feeling of belonging with the natural world. Whether I'm cycling around Taiwan or hiking in the American Midwest, I'm searching for that same sense of harmony I first discovered by the lake.

*Some places shape you so fundamentally that you carry them with you wherever you go.*`,
      isPublished: true,
      author: "Eliot Zhu"
    }
  ];

  const createSamplePosts = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const results = [];
      for (const post of samplePosts) {
        const postId = await createPost({
          ...post,
          readTime: Math.ceil(post.content.split(' ').length / 200)
        });
        results.push(postId);
      }
      
      setMessage(`Successfully created ${results.length} sample blog posts! You can now see them on the home page.`);
    } catch (err) {
      setError(`Error creating sample posts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: 600,
    padding: '1rem',
    color: isDark ? '#e9ecef' : '#212529'
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

  const buttonStyle = {
    padding: '12px 24px',
    fontSize: '16px',
    marginBottom: 16,
    backgroundColor: isDark ? '#0d6efd' : '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1
  };

  const infoStyle = {
    marginTop: 16,
    color: isDark ? '#adb5bd' : '#666'
  };

  return (
    <div style={containerStyle}>
      <h1>Quick Blog Setup</h1>
      
      <div style={{ marginBottom: 16 }}>
        <p>This will create 3 sample blog posts to populate your blog:</p>
        <ul>
          <li><strong>Cycling Around Taiwan</strong> - Travel/Adventure story</li>
          <li><strong>Learning to Orienteer</strong> - Personal growth story</li>
          <li><strong>Growing Up by West Lake</strong> - Childhood memories</li>
        </ul>
        <p style={{ color: isDark ? '#adb5bd' : '#666' }}>These match the experiences mentioned in your sidebar!</p>
      </div>

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

      <button 
        onClick={createSamplePosts} 
        disabled={loading}
        style={buttonStyle}
      >
        {loading ? 'Creating Sample Posts...' : 'Create Sample Blog Posts'}
      </button>

      <div style={infoStyle}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>
          After creating these posts, go back to the home page to see your blog in action!
        </div>
        <Link to="/">Back to Home</Link> | <Link to="/admin/create-post">Create Custom Post</Link>
      </div>
    </div>
  );
}