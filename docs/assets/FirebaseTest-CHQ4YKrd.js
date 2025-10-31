import{j as e}from"./vendor-bootstrap-Dg_DQlAt.js";import{r as i}from"./vendor-router-DblBPfa5.js";import{d as a,a as F}from"./auth-DEfQYUln.js";import{o as E,f as l,h as D,m as B}from"./vendor-firebase-CynBMA2D.js";import{T as U}from"./blog-Q4gOWMd_.js";import"./vendor-react-Bzgz95E1.js";function z(){const[m,p]=i.useState("Testing..."),[f,y]=i.useState([]),[n,g]=i.useState(null),[c,x]=i.useState(!0),{theme:b}=i.useContext(U),s=b==="dark";i.useEffect(()=>{const o=E(F,r=>{g(r),x(!1)});return()=>o()},[]),i.useEffect(()=>{c||d()},[c]);const d=async()=>{const o=[];try{o.push("✅ Firebase config loaded");try{const r=l(a,"test");o.push("✅ Firestore connection established");try{const t=l(a,"posts"),h=await D(t);o.push(`✅ Posts collection accessible (${h.size} documents found)`),h.size===0&&o.push("ℹ️ No blog posts found - this is normal for a new setup")}catch(t){o.push(`❌ Cannot read posts collection: ${t.code||t.message}`),t.code==="permission-denied"&&o.push("🔧 Firestore security rules may need updating")}try{await B(l(a,"test"),{message:"Firebase connection test",timestamp:new Date}),o.push("✅ Write permissions working")}catch(t){o.push(`❌ Cannot write to database: ${t.code||t.message}`),t.code==="permission-denied"&&o.push("🔧 Write permissions denied - check Firestore rules")}}catch(r){o.push(`❌ Firestore connection failed: ${r.message}`)}}catch(r){o.push(`❌ Firebase config error: ${r.message}`)}y(o),p("Test completed")},j=`// Firestore Security Rules - Option 1: Only specific user can write
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
}`,R=`// Firestore Security Rules - Option 2: Based on email domain
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
}`,w={maxWidth:800,padding:"1rem",color:s?"#e9ecef":"#212529"},u={backgroundColor:s?"#343a40":"#e9ecef",color:s?"#e9ecef":"#212529",padding:12,borderRadius:4,fontSize:"0.9em",overflow:"auto",border:`1px solid ${s?"#495057":"#ced4da"}`},S={backgroundColor:s?"#1c2127":"#f8f9fa",color:s?"#e9ecef":"#212529",padding:16,borderRadius:4,marginBottom:16,border:`1px solid ${s?"#495057":"#dee2e6"}`},C={marginRight:12,padding:"8px 16px",backgroundColor:s?"#0d6efd":"#007bff",color:"white",border:"none",borderRadius:4};return e.jsxs("div",{style:w,children:[e.jsx("h1",{children:"Firebase Connection Test"}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("strong",{children:"Status:"})," ",m]}),n&&e.jsxs("div",{style:{marginBottom:20,padding:15,backgroundColor:s?"#2c3034":"#e7f3ff",borderRadius:5,border:`1px solid ${s?"#495057":"#b8daff"}`},children:[e.jsx("h4",{style:{marginBottom:10,color:s?"#17a2b8":"#155724"},children:"🔑 Your Firebase User Information:"}),e.jsxs("div",{style:{fontSize:"0.9em"},children:[e.jsxs("p",{children:[e.jsx("strong",{children:"User ID (UID):"})," ",e.jsx("code",{style:{backgroundColor:s?"#343a40":"#f8f9fa",padding:"2px 6px",borderRadius:3,fontSize:"0.85em"},children:n.uid})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Email:"})," ",n.email]}),e.jsx("p",{style:{fontSize:"0.8em",color:s?"#adb5bd":"#6c757d",marginBottom:0},children:"💡 Copy the UID above and use it in your Firestore rules to restrict write access to only you."})]})]}),e.jsxs("div",{style:{marginBottom:24},children:[e.jsx("h3",{children:"Test Results:"}),e.jsx("ul",{children:f.map((o,r)=>e.jsx("li",{style:{marginBottom:4},children:o},r))})]}),e.jsxs("div",{style:S,children:[e.jsx("h3",{children:"If you see permission errors, update your Firestore rules:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:["Go to ",e.jsx("a",{href:"https://console.firebase.google.com",target:"_blank",rel:"noopener noreferrer",style:{color:s?"#78c2ad":"#007bff"},children:"Firebase Console"})]}),e.jsxs("li",{children:["Select your project: ",e.jsx("strong",{children:"orientingway"})]}),e.jsxs("li",{children:["Go to ",e.jsx("strong",{children:"Firestore Database"})," → ",e.jsx("strong",{children:"Rules"})]}),e.jsx("li",{children:"Choose one of the security rule options below:"})]}),e.jsxs("div",{style:{marginBottom:20},children:[e.jsx("h4",{style:{color:s?"#ffc107":"#856404",marginBottom:10},children:"🔒 Option 1: Only specific user (Recommended)"}),e.jsxs("p",{style:{fontSize:"0.9em",marginBottom:10},children:["Replace ",e.jsx("code",{children:"YOUR_USER_ID_HERE"})," with your actual Firebase Auth UID. You can find your UID by logging in and checking the browser console."]}),e.jsx("pre",{style:u,children:j})]}),e.jsxs("div",{children:[e.jsx("h4",{style:{color:s?"#17a2b8":"#155724",marginBottom:10},children:"📧 Option 2: Based on email domain"}),e.jsxs("p",{style:{fontSize:"0.9em",marginBottom:10},children:["Replace ",e.jsx("code",{children:"yourdomain.com"})," with your email domain. This allows anyone with your email domain to write."]}),e.jsx("pre",{style:u,children:R})]}),e.jsxs("div",{style:{marginTop:15,padding:10,backgroundColor:s?"#2c3034":"#e7f3ff",borderRadius:5},children:[e.jsx("strong",{children:"💡 How to get your User ID:"}),e.jsxs("ol",{style:{marginBottom:0,fontSize:"0.9em"},children:[e.jsx("li",{children:"Log in to your account"}),e.jsx("li",{children:"Open browser Developer Tools (F12)"}),e.jsx("li",{children:"Go to Console tab"}),e.jsxs("li",{children:["Type: ",e.jsx("code",{children:"firebase.auth().currentUser.uid"})]}),e.jsxs("li",{children:["Copy the returned string and replace ",e.jsx("code",{children:"YOUR_USER_ID_HERE"})]})]})]})]}),e.jsx("button",{onClick:d,style:C,children:"Run Test Again"}),e.jsx("a",{href:"/",style:{marginLeft:12,color:s?"#78c2ad":"#007bff"},children:"Back to Home"})]})}export{z as default};
