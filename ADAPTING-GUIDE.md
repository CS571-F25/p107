# Adapting Guide

> This guide helps you replicate, customize, and deploy this project on your own GitHub Pages site with Firebase authentication.

## 📋 Table of Contents

- [Before You Begin](#before-you-begin)
- [Get the Code](#get-the-code)
- [Firebase Authentication Setup](#firebase-authentication-setup)
- [Update the Base Path](#update-the-base-path)
- [Customize Your Site](#customize-your-site)
- [Build and Deploy](#build-and-deploy)
- [Optional: Custom Domain](#optional-custom-domain)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)
- [License](#license)

---

<a id="before-you-begin"></a>
## 0️⃣ Before You Begin

Make sure you have:

- **Git** installed → [Install Git](https://git-scm.com/downloads)
- **Node.js + npm** installed (v18 or later) → [Download here](https://nodejs.org/)
- A **GitHub account** with a repository ready (you can create one using "Use this template")
- A **Firebase account** → [Create one free](https://console.firebase.google.com/)

Optional but recommended:
- Use [Visual Studio Code](https://code.visualstudio.com/) or any text editor you like

---

<a id="get-the-code"></a>
## 1️⃣ Get the Code

You can start in one of these ways:

### Option A: Use as Template (Recommended)
Click **"Use this template"** on GitHub to create your own copy.

### Option B: Fork
Make a linked copy under your account.

### Option C: Clone Manually
```bash
git clone <source-repo-url> <your-repo>
cd <your-repo>
git remote remove origin
git remote add origin git@github.com:<your-username>/<your-repo>.git
git push -u origin main
```

### Install Dependencies

After getting the code, install dependencies:
```bash
npm install
```

> 📝 **Note:** You need Node.js installed for `npm install` and `npm run build` to work.  
> If you're not sure, run `node -v` in your terminal to check.

### Test Locally

You can always test the project locally:
```bash
npm run dev
```
Then open the shown localhost URL in your browser to confirm it runs correctly.

---

<a id="firebase-authentication-setup"></a>
## 2️⃣ Firebase Authentication Setup

This project uses Firebase for user authentication and data storage. Follow these steps to set it up:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "orient-way")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)
5. Click **"Create project"**

### Step 2: Add a Web App

1. In your Firebase project dashboard, click the **web icon** `</>`
2. Register your app with a nickname (e.g., "Orient Way Web")
3. **Do NOT** check "Also set up Firebase Hosting" (we're using GitHub Pages)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object — you'll need these values

### Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click on **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

### Step 4: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** → **Create database**
2. Select a location close to your users
3. Choose **"Start in production mode"** (recommended)
4. Click **Enable**

### Step 5: Configure Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Choose one of the following security rule configurations based on your needs:

#### Option A: Public Blog with Owner-Only Write Access (Recommended for Blogs)

For a public blog where anyone can read but only you can write:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blog posts: Public read, owner-only write
    match /posts/{postId} {
      allow read: if true; // Anyone can read published posts
      allow write: if request.auth != null && request.auth.uid == 'YOUR_USER_ID_HERE';
    }
    
    // Test collection (optional for debugging)
    match /test/{document} {
      allow read, write: if request.auth != null && request.auth.uid == 'YOUR_USER_ID_HERE';
    }
  }
}
```

**To get your User ID:**
1. Log in to your account
2. Visit `/admin/test` page
3. Copy the displayed User ID (UID)
4. Replace `YOUR_USER_ID_HERE` with your actual UID

#### Option B: Email Domain-Based Access

For organizations where multiple users with the same email domain should have write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blog posts: Public read, domain-restricted write
    match /posts/{postId} {
      allow read: if true; // Anyone can read published posts
      allow write: if request.auth != null && 
                      request.auth.token.email.matches('.*@yourdomain\\.com');
    }
  }
}
```

#### Option C: Multi-User Blog Platform

For a platform where authenticated users can manage their own content:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts collection with author-based permissions
    match /posts/{postId} {
      allow read: if true; // Public read
      allow create: if request.auth != null; // Auth users can create
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

3. **Copy your chosen rules** to the Firebase Console
4. Click **Publish**

> ⚠️ **Security Note:** Option A (owner-only) is recommended for personal blogs. It ensures maximum security while keeping content publicly readable.

> 💡 **Testing:** Use the `/admin/test` page to verify your rules are working correctly after deployment.

### Step 6: Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

   Get these values from Firebase Console → Project Settings → Your apps → SDK setup and configuration

3. **Verify `.gitignore`** contains:
   ```
   .env.local
   .env*.local
   ```

   This ensures your credentials won't be committed to Git.

### Step 7: Test Authentication

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/register` and create a test account
3. Check Firebase Console → Authentication → Users to see your new user
4. Try logging in at `/login`
5. Check that email verification works

> 💡 **Tip:** Check your spam folder if you don't receive verification emails.

### Optional: Customize Email Templates

1. Go to Firebase Console → Authentication → Templates
2. Customize the templates for:
   - Email verification
   - Password reset
   - Email address change
3. You can edit the subject, body, and sender name

---

<a id="update-the-base-path"></a>
## 3️⃣ Update the Base Path

Open `vite.config.js` and change the `base` value according to where you deploy:

### For Project Page
If you deploy to `https://username.github.io/repo-name/`:

```js
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

### For User Page
If you deploy to `https://username.github.io/`:

```js
export default defineConfig({
  base: '/',
  // ...
})
```

---

<a id="customize-your-site"></a>
## 4️⃣ Customize Your Site

Most personal changes happen inside the `/src` folder:

| Folder / File | Purpose |
|----------------|----------|
| `src/assets/` | Images, logos, or icons. Replace with your own. |
| `src/components/auth/` | Authentication UI (Login, Register, etc.) |
| `src/components/content/` | Page components (Home, Now, etc.) |
| `src/components/structural/` | App layout, navigation, routes |
| `src/services/` | API services (authentication, Firestore) |
| `src/firebase/` | Firebase configuration |
| `src/main.jsx` | Entry point (usually no need to modify) |

### Common Customizations

#### Change Site Branding
Edit `src/components/structural/Layout.jsx`:
```jsx
<Navbar.Brand as={Link} to="/">
  Your Site Name  {/* Change this */}
</Navbar.Brand>
```

#### Add New Pages
1. Create a component in `src/components/content/`
2. Add a route in `src/components/structural/App.jsx`:
   ```jsx
   <Route path="your-page" element={<YourPage />} />
   ```

#### Modify Theme Colors
Edit `src/index.css` to customize colors and styles.

#### Add Protected Routes
Wrap routes that require authentication:
```jsx
import ProtectedRoute from "../auth/ProtectedRoute";

<Route
  path="protected-page"
  element={
    <ProtectedRoute>
      <YourProtectedPage />
    </ProtectedRoute>
  }
/>
```

---

<a id="build-and-deploy"></a>
## 5️⃣ Build and Deploy

### Build the Static Site

```bash
npm run build
```

This creates a `docs/` folder containing the production files.

> 💡 **Note:** The `docs/` folder is configured in `vite.config.js` with `outDir: 'docs'`

### Push to GitHub

```bash
git add -A
git commit -m "build: generate docs for GitHub Pages"
git push
```

### Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Branch:** `main`
   - **Folder:** `/docs`
4. Click **Save**

After a minute or two, your site will be available at:
- Project page: `https://<username>.github.io/<your-repo>/`
- User page: `https://<username>.github.io/`

### Authorize Domain for Firebase

1. Go to Firebase Console → Authentication → Settings
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Add your GitHub Pages domain:
   - `<username>.github.io` (for user pages)
   - Or your custom domain (if using one)
5. Click **Add**

> ⚠️ **Important:** Without this, Firebase authentication won't work on your deployed site.

---

<a id="optional-custom-domain"></a>
## 6️⃣ Optional: Custom Domain

To use your own domain:

### Step 1: Configure DNS
Add these DNS records at your domain registrar:

For apex domain (example.com):
```
Type: A
Name: @
Value: 185.199.108.153
```
```
Type: A
Name: @
Value: 185.199.109.153
```
```
Type: A
Name: @
Value: 185.199.110.153
```
```
Type: A
Name: @
Value: 185.199.111.153
```

For subdomain (www.example.com):
```
Type: CNAME
Name: www
Value: <username>.github.io
```

### Step 2: Configure GitHub Pages
1. Go to **GitHub → Settings → Pages**
2. Under **Custom domain**, enter your domain
3. Click **Save**
4. Check **Enforce HTTPS** (after DNS propagates)

### Step 3: Update Firebase
Add your custom domain to Firebase Console → Authentication → Settings → Authorized domains

---

<a id="security-best-practices"></a>
## 🔐 Security Best Practices

### Firebase Configuration
1. **Never commit `.env.local`** — It's in `.gitignore`, but double-check
2. **Firebase API keys are safe in client code** — They identify your project, not authenticate it
3. **Protect data with Firestore Security Rules** — Server-side validation is crucial

### Firestore Security Rules Guidelines
4. **Use specific user ID for personal blogs** — Most secure option
   ```javascript
   allow write: if request.auth != null && request.auth.uid == 'specific-uid';
   ```
5. **Always allow public read for blog content** — Unless it's a private blog
   ```javascript
   allow read: if true; // Public blog posts
   ```
6. **Test your rules regularly** — Use `/admin/test` to verify permissions
7. **Monitor suspicious activity** — Check Firebase Console → Usage for unexpected patterns

### Authentication Security
8. **Enable email verification** — Reduces spam accounts and ensures valid emails
9. **Use strong password requirements** — Firebase handles this by default
10. **Monitor failed login attempts** — Available in Firebase Console → Authentication

### Deployment Security
11. **Add only necessary domains to authorized domains** — Don't use wildcards
12. **Set up Firebase budget alerts** — Prevent unexpected charges
13. **Regularly review Firebase project members** — Remove unused accounts

### Content Security
14. **Validate content on both client and server** — Don't trust client-side validation alone
15. **Sanitize user input** — Especially important for blog content
16. **Implement content moderation** — For user-generated content

---

<a id="troubleshooting"></a>
## 🆘 Troubleshooting

### Authentication Errors
- **"Firebase: Error (auth/configuration-not-found)"**
  - Check `.env.local` file exists and has all required variables
  - Restart dev server after creating `.env.local`

- **"Firebase: Error (auth/unauthorized-domain)"**
  - Add your domain to Firebase Console → Authentication → Authorized domains

### Firestore Permission Errors
- **"Access denied. Please check your permissions."**
  - Update your Firestore security rules (see Step 5 above)
  - Use `/admin/test` page to verify your rules
  - Ensure you're using the correct User ID in your rules

- **"Missing or insufficient permissions"**
  - Check if you're logged in when trying to write data
  - Verify your security rules allow the operation
  - Test with Firebase Console → Firestore → Rules Playground

- **Blog posts not loading for visitors**
  - Ensure your security rules have `allow read: if true;` for posts
  - Check that posts collection exists in Firestore
  - Verify there are published posts in the database

### Build Errors
- **"Cannot find module 'firebase'"**
  - Run `npm install firebase`

- **Build succeeds but site doesn't work**
  - Check `vite.config.js` base path matches your deployment
  - Verify Firebase credentials in `.env.local`

### Email Issues
- **Verification emails not received**
  - Check spam folder
  - Verify email is correct
  - Check Firebase Console → Authentication → Templates
  - Try using a different email provider

---

<a id="additional-resources"></a>
## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Cloud Firestore Docs](https://firebase.google.com/docs/firestore)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

---

<a id="license"></a>
## 📜 License

Licensed under the [MIT License](./LICENSE) © 2025 [eliotziqi](https://github.com/eliotziqi)  
You are free to use, modify, and distribute it with proper attribution.
