import{j as e}from"./vendor-bootstrap-Dg_DQlAt.js";import{r as i}from"./vendor-router-DblBPfa5.js";import{d as n}from"./auth-CXpiOxRP.js";import{f as a,h as j,m as w}from"./vendor-firebase-CynBMA2D.js";import{T as F}from"./blog-ZFWPbi0U.js";import"./vendor-react-Bzgz95E1.js";function B(){const[d,u]=i.useState("Testing..."),[h,p]=i.useState([]),{theme:m}=i.useContext(F),t=m==="dark";i.useEffect(()=>{c()},[]);const c=async()=>{const s=[];try{s.push("✅ Firebase config loaded");try{const r=a(n,"test");s.push("✅ Firestore connection established");try{const o=a(n,"posts"),l=await j(o);s.push(`✅ Posts collection accessible (${l.size} documents found)`),l.size===0&&s.push("ℹ️ No blog posts found - this is normal for a new setup")}catch(o){s.push(`❌ Cannot read posts collection: ${o.code||o.message}`),o.code==="permission-denied"&&s.push("🔧 Firestore security rules may need updating")}try{await w(a(n,"test"),{message:"Firebase connection test",timestamp:new Date}),s.push("✅ Write permissions working")}catch(o){s.push(`❌ Cannot write to database: ${o.code||o.message}`),o.code==="permission-denied"&&s.push("🔧 Write permissions denied - check Firestore rules")}}catch(r){s.push(`❌ Firestore connection failed: ${r.message}`)}}catch(r){s.push(`❌ Firebase config error: ${r.message}`)}p(s),u("Test completed")},f=`// Firestore Security Rules
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
}`,g={maxWidth:800,padding:"1rem",color:t?"#e9ecef":"#212529"},b={backgroundColor:t?"#343a40":"#e9ecef",color:t?"#e9ecef":"#212529",padding:12,borderRadius:4,fontSize:"0.9em",overflow:"auto",border:`1px solid ${t?"#495057":"#ced4da"}`},x={backgroundColor:t?"#1c2127":"#f8f9fa",color:t?"#e9ecef":"#212529",padding:16,borderRadius:4,marginBottom:16,border:`1px solid ${t?"#495057":"#dee2e6"}`},y={marginRight:12,padding:"8px 16px",backgroundColor:t?"#0d6efd":"#007bff",color:"white",border:"none",borderRadius:4};return e.jsxs("div",{style:g,children:[e.jsx("h1",{children:"Firebase Connection Test"}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("strong",{children:"Status:"})," ",d]}),e.jsxs("div",{style:{marginBottom:24},children:[e.jsx("h3",{children:"Test Results:"}),e.jsx("ul",{children:h.map((s,r)=>e.jsx("li",{style:{marginBottom:4},children:s},r))})]}),e.jsxs("div",{style:x,children:[e.jsx("h3",{children:"If you see permission errors, update your Firestore rules:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:["Go to ",e.jsx("a",{href:"https://console.firebase.google.com",target:"_blank",rel:"noopener noreferrer",style:{color:t?"#78c2ad":"#007bff"},children:"Firebase Console"})]}),e.jsxs("li",{children:["Select your project: ",e.jsx("strong",{children:"orientingway"})]}),e.jsxs("li",{children:["Go to ",e.jsx("strong",{children:"Firestore Database"})," → ",e.jsx("strong",{children:"Rules"})]}),e.jsx("li",{children:"Replace the rules with:"})]}),e.jsx("pre",{style:b,children:f})]}),e.jsx("button",{onClick:c,style:y,children:"Run Test Again"}),e.jsx("a",{href:"/",style:{marginLeft:12,color:t?"#78c2ad":"#007bff"},children:"Back to Home"})]})}export{B as default};
