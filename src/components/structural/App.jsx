// App shell: theme provider + router + layout
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';
import { Suspense, lazy } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from './Layout.jsx';
import AuthProvider from "../auth/AuthProvider.jsx";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";

// Lazy load components for better code splitting
const Home = lazy(() => import('../content/Home.jsx'));
const Now = lazy(() => import('../content/Now.jsx'));
const NoMatch = lazy(() => import('../content/NoMatch.jsx'));
const Register = lazy(() => import("../auth/Register"));
const Login = lazy(() => import("../auth/Login"));
const Logout = lazy(() => import("../auth/Logout"));
const ForgotPassword = lazy(() => import("../auth/ForgotPassword"));
const BlogPost = lazy(() => import("../blog/BlogPost.jsx"));
const CreatePost = lazy(() => import("../admin/CreatePost.jsx"));
const QuickSetup = lazy(() => import("../admin/QuickSetup.jsx"));
const FirebaseTest = lazy(() => import("../admin/FirebaseTest.jsx"));
const PostsDebug = lazy(() => import("../admin/PostsDebug.jsx"));

// Loading component
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
    <Spinner animation="border" variant="primary" />
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="bg-body text-body min-vh-100 pv-4">
          <HashRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Layout />}> 
                  <Route index element={<Home />} />
                  <Route path="now" element={<Now />} />

                  {/* Blog routes */}
                  <Route path="blog/:id" element={<BlogPost />} />

                  {/* Admin routes */}
                  <Route
                    path="admin/create-post"
                    element={
                      <ProtectedRoute>
                        <CreatePost />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/setup"
                    element={
                      <ProtectedRoute>
                        <QuickSetup />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/test"
                    element={
                      <FirebaseTest />
                    }
                  />
                  <Route
                    path="admin/debug"
                    element={
                      <PostsDebug />
                    }
                  />

                  {/* Auth routes */}
                  <Route path="register" element={<Register />} />
                  <Route path="login" element={<Login />} />
                  <Route path="logout" element={<Logout />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />

                  {/* Protected routes can be wrapped like this: */}
                  <Route
                    path="secret"
                    element={
                      <ProtectedRoute>
                        <div style={{ padding: 8 }}>
                          This is a protected page (visible only when signed in).
                        </div>
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NoMatch />} />
                </Route>
              </Routes>
            </Suspense>
          </HashRouter>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}