import{j as e,C as l,a as d,A as c,b as B,R as v,c as x}from"./vendor-bootstrap-D2eqalZl.js";import{r as o}from"./vendor-router-CUyV5JBb.js";import{a as p,k as R,g as W,c as M,i as $,L as z,m as F,n as H,o as J,p as Z,q}from"./auth-DdQ2LLef.js";import{T as G,u as V,h as K}from"./blog-BQPs9klV.js";import"./vendor-react-Bzgz95E1.js";import"./vendor-firebase-CYcY3q11.js";const Q=()=>{const[t,n]=o.useState(null),[u,i]=o.useState(!1),m=async()=>{try{i(!0);const s=p.currentUser?.uid;if(!s){n({error:"Not logged in"});return}const[f,C,g,j]=await Promise.all([R(s),W(s),M(s),$(s)]);n({userId:s,userRoles:f,level:C,adminAccess:g,ownerStatus:j,timestamp:new Date().toISOString()})}catch(s){n({error:s.message})}finally{i(!1)}};return o.useEffect(()=>{m()},[]),e.jsxs(l,{children:[e.jsx(l.Header,{children:e.jsx("h5",{children:"Permission Debug Tool"})}),e.jsxs(l.Body,{children:[e.jsx(d,{onClick:m,disabled:u,className:"mb-3",children:u?"Checking...":"Refresh Debug Info"}),t&&e.jsx("div",{children:t.error?e.jsxs(c,{variant:"danger",children:["Error: ",t.error]}):e.jsxs("div",{children:[e.jsx(c,{variant:"info",children:e.jsxs("strong",{children:["Debug Info (Last checked: ",new Date(t.timestamp).toLocaleTimeString(),")"]})}),e.jsxs("div",{className:"mb-3",children:[e.jsx("strong",{children:"User ID:"})," ",t.userId]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("strong",{children:"Level:"})," ",t.level]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("strong",{children:"Can Access Admin:"})," ",t.adminAccess?"YES":"NO"]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("strong",{children:"Is Owner:"})," ",t.ownerStatus?"YES":"NO"]}),e.jsxs("div",{className:"mb-3",children:[e.jsxs("strong",{children:["User Roles (",t.userRoles.length,"):"]}),e.jsx("ul",{children:t.userRoles.map((s,f)=>e.jsxs("li",{children:[s.roleId," - Level: ",s.role?.level," - Name: ",s.role?.name,e.jsx("br",{}),"Permissions: ",s.role?.permissions?.join(", ")]},f))})]})]})})]})]})};function ne(){const[t,n]=o.useState(!1),[u,i]=o.useState(""),[m,s]=o.useState(""),[f,C]=o.useState(""),[g,j]=o.useState(null),{isLoggedIn:a,user:I}=o.useContext(z),{theme:A}=o.useContext(G),{level:N,isOwner:T,isAdmin:k,canAccessAdmin:E}=V(),S=A==="dark",w=async()=>{try{if(n(!0),s(""),!a){s("You must be logged in to check roles");return}const r=p.currentUser?.uid,h=await R(r);j(h);const y=h.length;i(`Found ${y} role${y===1?"":"s"} for current user`)}catch(r){s(`Error checking roles: ${r.message}`)}finally{n(!1)}},L=async()=>{try{n(!0),i(""),s(""),await F(),i("Default roles created successfully! (owner, admin, author, user, guest)")}catch(r){s(`Error initializing roles: ${r.message}`)}finally{n(!1)}},O=async()=>{try{if(n(!0),i(""),s(""),!a){s("You must be logged in to assign owner role");return}await H(),i(`Owner role assigned exclusively to ${I?.email||"current user"}! All previous roles removed.`),setTimeout(()=>{w(),window.location.reload()},1e3)}catch(r){s(`Error assigning owner role: ${r.message}`)}finally{n(!1)}},P=async()=>{try{if(n(!0),i(""),s(""),!a){s("You must be logged in to reset roles");return}const r=p.currentUser?.uid;await J(r),await Z(r,"user","system-reset"),i("Your roles have been reset to default User level."),setTimeout(()=>{w(),window.location.reload()},1e3)}catch(r){s(`Error resetting roles: ${r.message}`)}finally{n(!1)}},D=async()=>{try{if(n(!0),i(""),s(""),!a){s("You must be logged in");return}const r=p.currentUser?.uid;await q(r),i("Default user role assigned successfully!")}catch(r){s(`Error assigning default role: ${r.message}`)}finally{n(!1)}},U=async()=>{try{n(!0),i(""),s("");const r=[{title:"Welcome to Orient Way",subtitle:"A journey begins with a single step",content:`# Welcome to Orient Way

This is the beginning of a new adventure in digital storytelling. Orient Way is where I document my journeys, both physical and digital.

## What You'll Find Here

- **Travel Stories**: Adventures from around the world
- **Tech Insights**: Lessons learned in the startup world
- **Life Reflections**: Thoughts on growth and change
- **Cultural Observations**: Perspectives from different places

## The Journey Ahead

Stay tuned for stories about raising funding, walking across continents, living in South America, and building technology that matters.

*Every journey starts with a single step, and this is ours.*`,excerpt:"Welcome to Orient Way - where travel meets technology and stories come alive.",category:"Life",tags:["welcome","introduction","travel","technology"],slug:"welcome-to-orient-way",status:"published",author:"Eliot Zhu",coverImage:"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"},{title:"Building in Public: The Startup Journey",subtitle:"Lessons from the entrepreneurial trenches",content:`# Building in Public: The Startup Journey

## The Beginning

Starting a company is like jumping off a cliff and building a plane on the way down. Here's what I learned along the way.

### Lesson 1: Validation is Everything

Before writing a single line of code, make sure people actually want what you're building.

### Lesson 2: Team is Everything

The right co-founder can make all the difference. Choose wisely.

### Lesson 3: Persistence Pays

Some days you'll want to quit. Those are the days that define you.

## The Road Ahead

Building something meaningful takes time, patience, and a lot of coffee.`,excerpt:"Reflections on the startup journey, from idea to execution and everything in between.",category:"Business",tags:["startup","entrepreneurship","lessons","building"],slug:"building-in-public-startup-journey",status:"draft",author:"Eliot Zhu"},{title:"The Art of Slow Travel",subtitle:"Why rushing misses the point",content:`# The Art of Slow Travel

## Moving Slowly

In a world obsessed with efficiency, slow travel is a radical act.

When you slow down, you notice things:
- The way morning light hits a plaza
- How locals interact with each other  
- The rhythm of a place

## Lessons from the Road

Every place has stories to tell, but only if you're willing to listen.

### South America Taught Me

- Time moves differently in different places
- Patience is a superpower
- The best conversations happen in unexpected places

*Some places shape you so fundamentally that you carry them with you wherever you go.*`,excerpt:"Reflections on the beauty and importance of taking your time while traveling.",category:"Travel",tags:["travel","philosophy","slow-living","south-america"],slug:"art-of-slow-travel",status:"published",author:"Eliot Zhu",coverImage:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"}],h=[];for(const y of r){const Y=await K({...y,readTime:Math.ceil(y.content.split(" ").length/200)});h.push(Y)}i(`Successfully created ${h.length} sample blog posts!`)}catch(r){s(`Error creating sample posts: ${r.message}`)}finally{n(!1)}},b={backgroundColor:S?"#2d3748":"#fff",borderColor:S?"#4a5568":"#dee2e6"};return e.jsxs(B,{fluid:!0,style:{maxWidth:"1000px",padding:"2rem 1rem"},children:[e.jsx(v,{className:"mb-4",children:e.jsxs(x,{children:[e.jsx("h2",{className:"mb-1",children:"System Setup"}),e.jsx("p",{className:"text-muted",children:"Initialize your blog system and configure permissions"})]})}),u&&e.jsx(c,{variant:"success",onClose:()=>i(""),dismissible:!0,children:u}),m&&e.jsx(c,{variant:"danger",onClose:()=>s(""),dismissible:!0,children:m}),e.jsxs(v,{className:"g-4",children:[e.jsx(x,{md:6,children:e.jsxs(l,{style:b,children:[e.jsx(l.Header,{children:e.jsx("h5",{className:"mb-0",children:"Role System Setup"})}),e.jsxs(l.Body,{children:[e.jsx("p",{className:"text-muted",children:"Initialize the role-based access control system with default roles."}),e.jsxs("div",{className:"d-grid gap-2",children:[e.jsx(d,{variant:"primary",onClick:L,disabled:t,children:t?"Initializing...":"Initialize Roles"}),e.jsx(d,{variant:"warning",onClick:O,disabled:t||!a,children:t?"Assigning...":"Make Me Owner (Exclusive)"}),e.jsx(d,{variant:"secondary",onClick:D,disabled:t||!a,children:t?"Assigning...":"Assign Default Role"}),e.jsx(d,{variant:"info",onClick:w,disabled:t||!a,children:t?"Checking...":"Check My Roles"}),e.jsx(d,{variant:"danger",onClick:P,disabled:t||!a,children:t?"Resetting...":"Reset to User Role"}),e.jsx(d,{variant:"success",onClick:()=>window.location.reload(),disabled:t,children:"Refresh Page"})]}),!a&&e.jsx(c,{variant:"info",className:"mt-3 mb-0",children:"Please log in to assign roles to your account."}),a&&e.jsxs(c,{variant:"info",className:"mt-3 mb-0",children:[e.jsx("strong",{children:"Current Status:"}),e.jsx("br",{}),"Level: ",N," | Owner: ",T?"Yes":"No"," | Admin: ",k?"Yes":"No"," | Can Access Admin: ",E?"Yes":"No"]}),g&&e.jsxs(c,{variant:"success",className:"mt-3 mb-0",children:[e.jsx("strong",{children:"Your Roles:"}),e.jsx("br",{}),g.length===0?"No roles assigned":g.map((r,h)=>e.jsxs("div",{children:["- ",r.role?.name||r.roleId," (Level: ",r.role?.level,")"]},h))]})]})]})}),e.jsx(x,{md:6,children:e.jsxs(l,{style:b,children:[e.jsx(l.Header,{children:e.jsx("h5",{className:"mb-0",children:"Sample Content"})}),e.jsxs(l.Body,{children:[e.jsx("p",{className:"text-muted",children:"Create sample blog posts to test the system and demonstrate features."}),e.jsx("div",{className:"d-grid gap-2",children:e.jsx(d,{variant:"success",onClick:U,disabled:t||!a,children:t?"Creating...":"Create Sample Posts"})}),!a&&e.jsx(c,{variant:"info",className:"mt-3 mb-0",children:"Please log in to create sample content."})]})]})}),e.jsx(x,{md:12,children:e.jsxs(l,{style:b,children:[e.jsx(l.Header,{children:e.jsx("h5",{className:"mb-0",children:"Manual Setup Instructions"})}),e.jsxs(l.Body,{children:[e.jsx("h6",{children:"Firestore Console Setup (Alternative Method)"}),e.jsx("p",{className:"text-muted",children:"If you prefer to set up manually through the Firestore console:"}),e.jsxs("ol",{className:"text-muted",children:[e.jsx("li",{children:"Go to your Firebase Console → Firestore Database"}),e.jsxs("li",{children:["Create a new collection called ",e.jsx("code",{children:"userRoles"})]}),e.jsxs("li",{children:["Add a document with these fields:",e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"userId"}),": Your Firebase Auth UID"]}),e.jsxs("li",{children:[e.jsx("code",{children:"roleId"}),': "owner"']}),e.jsxs("li",{children:[e.jsx("code",{children:"assignedBy"}),': "manual"']}),e.jsxs("li",{children:[e.jsx("code",{children:"assignedAt"}),": Current timestamp"]})]})]}),e.jsx("li",{children:'Click "Initialize Roles" above to create the role definitions'})]}),e.jsxs(c,{variant:"warning",children:[e.jsx("strong",{children:"Important:"})," Only assign the owner role to trusted administrators. The owner role has full system access and cannot be restricted."]})]})]})})]}),e.jsx(v,{className:"mt-4",children:e.jsx(x,{children:e.jsx(Q,{})})})]})}export{ne as default};
