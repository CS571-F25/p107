import { useState, useEffect, useContext } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import ThemeContext from '../contexts/ThemeContext';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    // Monitor auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      testFirebaseConnection();
    }
  }, [authLoading]);

  const testFirebaseConnection = async () => {
    const testResults = [];
    
    try {
      // Test 1: Basic Firebase connection
      testResults.push('✅ Firebase config loaded');
      
      // Test 2: Firestore connection
      try {
        const testCollection = collection(db, 'test');
        testResults.push('✅ Firestore connection established');
        
        // Test 3: Try to read from posts collection
        try {
          const postsCollection = collection(db, 'posts');
          const snapshot = await getDocs(postsCollection);
          testResults.push(`✅ Posts collection accessible (${snapshot.size} documents found)`);
          
          if (snapshot.size === 0) {
            testResults.push('ℹ️ No blog posts found - this is normal for a new setup');
          }
          
        } catch (readError) {
          testResults.push(`❌ Cannot read posts collection: ${readError.code || readError.message}`);
          
          if (readError.code === 'permission-denied') {
            testResults.push('🔧 Firestore security rules may need updating');
          }
        }
        
        // Test 4: Try to write a test document
        try {
          await addDoc(collection(db, 'test'), {
            message: 'Firebase connection test',
            timestamp: new Date()
          });
          testResults.push('✅ Write permissions working');
        } catch (writeError) {
          testResults.push(`❌ Cannot write to database: ${writeError.code || writeError.message}`);
          
          if (writeError.code === 'permission-denied') {
            testResults.push('🔧 Write permissions denied - check Firestore rules');
          }
        }
        
      } catch (firestoreError) {
        testResults.push(`❌ Firestore connection failed: ${firestoreError.message}`);
      }
      
    } catch (configError) {
      testResults.push(`❌ Firebase config error: ${configError.message}`);
    }
    
    setDetails(testResults);
    setStatus('Test completed');
  };

  const suggestedFirestoreRules = `// Firestore Security Rules - Option 1: Only specific user can write
// Copy this to Firebase Console > Firestore Database > Rules
// Replace 'YOUR_USER_ID_HERE' with your actual Firebase Auth UID

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blog posts: Anyone can read, only you can write
    match /posts/{document} {
      allow read: if true; // Anyone can read published posts
      allow write: if request.auth != null && request.auth.uid == 'YOUR_USER_ID_HERE';
    }
    
    // Test collection: only you can access
    match /test/{document} {
      allow read, write: if request.auth != null && request.auth.uid == 'YOUR_USER_ID_HERE';
    }
  }
}`;

  const alternativeRules = `// Firestore Security Rules - Option 2: Based on email domain
// Copy this to Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blog posts: Anyone can read, only your email can write
    match /posts/{document} {
      allow read: if true; // Anyone can read published posts
      allow write: if request.auth != null && 
                      request.auth.token.email.matches('.*@yourdomain\\.com');
    }
    
    // Test collection: only your email can access
    match /test/{document} {
      allow read, write: if request.auth != null && 
                           request.auth.token.email.matches('.*@yourdomain\\.com');
    }
  }
}`;

  const containerStyle = {
    maxWidth: 800,
    padding: '1rem',
    color: isDark ? '#e9ecef' : '#212529'
  };

  const codeBlockStyle = {
    backgroundColor: isDark ? '#343a40' : '#e9ecef',
    color: isDark ? '#e9ecef' : '#212529',
    padding: 12,
    borderRadius: 4,
    fontSize: '0.9em',
    overflow: 'auto',
    border: `1px solid ${isDark ? '#495057' : '#ced4da'}`
  };

  const infoBoxStyle = {
    backgroundColor: isDark ? '#1c2127' : '#f8f9fa',
    color: isDark ? '#e9ecef' : '#212529',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
    border: `1px solid ${isDark ? '#495057' : '#dee2e6'}`
  };

  const buttonStyle = {
    marginRight: 12,
    padding: '8px 16px',
    backgroundColor: isDark ? '#0d6efd' : '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4
  };

  return (
    <div style={containerStyle}>
      <h1>Firebase Connection Test</h1>
      
      <div style={{ marginBottom: 16 }}>
        <strong>Status:</strong> {status}
      </div>
      
      {/* Current User Info */}
      {user && (
        <div style={{ 
          marginBottom: 20, 
          padding: 15, 
          backgroundColor: isDark ? '#2c3034' : '#e7f3ff', 
          borderRadius: 5,
          border: `1px solid ${isDark ? '#495057' : '#b8daff'}`
        }}>
          <h4 style={{ marginBottom: 10, color: isDark ? '#17a2b8' : '#155724' }}>
            🔑 Your Firebase User Information:
          </h4>
          <div style={{ fontSize: '0.9em' }}>
            <p><strong>User ID (UID):</strong> <code style={{ 
              backgroundColor: isDark ? '#343a40' : '#f8f9fa', 
              padding: '2px 6px', 
              borderRadius: 3,
              fontSize: '0.85em'
            }}>{user.uid}</code></p>
            <p><strong>Email:</strong> {user.email}</p>
            <p style={{ fontSize: '0.8em', color: isDark ? '#adb5bd' : '#6c757d', marginBottom: 0 }}>
              💡 Copy the UID above and use it in your Firestore rules to restrict write access to only you.
            </p>
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: 24 }}>
        <h3>Test Results:</h3>
        <ul>
          {details.map((detail, index) => (
            <li key={index} style={{ marginBottom: 4 }}>
              {detail}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={infoBoxStyle}>
        <h3>If you see permission errors, update your Firestore rules:</h3>
        <ol>
          <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#78c2ad' : '#007bff' }}>Firebase Console</a></li>
          <li>Select your project: <strong>orientingway</strong></li>
          <li>Go to <strong>Firestore Database</strong> → <strong>Rules</strong></li>
          <li>Choose one of the security rule options below:</li>
        </ol>
        
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: isDark ? '#ffc107' : '#856404', marginBottom: 10 }}>
            🔒 Option 1: Only specific user (Recommended)
          </h4>
          <p style={{ fontSize: '0.9em', marginBottom: 10 }}>
            Replace <code>YOUR_USER_ID_HERE</code> with your actual Firebase Auth UID. 
            You can find your UID by logging in and checking the browser console.
          </p>
          <pre style={codeBlockStyle}>
            {suggestedFirestoreRules}
          </pre>
        </div>
        
        <div>
          <h4 style={{ color: isDark ? '#17a2b8' : '#155724', marginBottom: 10 }}>
            📧 Option 2: Based on email domain
          </h4>
          <p style={{ fontSize: '0.9em', marginBottom: 10 }}>
            Replace <code>yourdomain.com</code> with your email domain. 
            This allows anyone with your email domain to write.
          </p>
          <pre style={codeBlockStyle}>
            {alternativeRules}
          </pre>
        </div>
        
        <div style={{ marginTop: 15, padding: 10, backgroundColor: isDark ? '#2c3034' : '#e7f3ff', borderRadius: 5 }}>
          <strong>💡 How to get your User ID:</strong>
          <ol style={{ marginBottom: 0, fontSize: '0.9em' }}>
            <li>Log in to your account</li>
            <li>Open browser Developer Tools (F12)</li>
            <li>Go to Console tab</li>
            <li>Type: <code>firebase.auth().currentUser.uid</code></li>
            <li>Copy the returned string and replace <code>YOUR_USER_ID_HERE</code></li>
          </ol>
        </div>
      </div>
      
      <button onClick={testFirebaseConnection} style={buttonStyle}>
        Run Test Again
      </button>
      
      <a href="/" style={{ marginLeft: 12, color: isDark ? '#78c2ad' : '#007bff' }}>Back to Home</a>
    </div>
  );
}