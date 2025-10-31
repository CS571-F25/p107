import { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import ThemeContext from '../contexts/ThemeContext';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState([]);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    testFirebaseConnection();
  }, []);

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

  const suggestedFirestoreRules = `// Firestore Security Rules
// Copy this to Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write posts
    match /posts/{document} {
      allow read: if true; // Anyone can read published posts
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Allow test collection for debugging
    match /test/{document} {
      allow read, write: if request.auth != null;
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
          <li>Replace the rules with:</li>
        </ol>
        <pre style={codeBlockStyle}>
          {suggestedFirestoreRules}
        </pre>
      </div>
      
      <button onClick={testFirebaseConnection} style={buttonStyle}>
        Run Test Again
      </button>
      
      <a href="/" style={{ marginLeft: 12, color: isDark ? '#78c2ad' : '#007bff' }}>Back to Home</a>
    </div>
  );
}