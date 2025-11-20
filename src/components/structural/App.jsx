// App shell: theme provider + router + layout
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';
import { Suspense, lazy } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from './Layout.jsx';
import AuthProvider from "../auth/AuthProvider.jsx";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";
import AdminLayout from '../admin/AdminLayout.jsx'; // 导入 AdminLayout

// Lazy load components for better code splitting
const Home = lazy(() => import('../content/Home.jsx'));
const Now = lazy(() => import('../content/Now.jsx'));
const NoMatch = lazy(() => import('../content/NoMatch.jsx'));
const Register = lazy(() => import("../auth/Register"));
const Login = lazy(() => import("../auth/Login"));
const Logout = lazy(() => import("../auth/Logout"));
const ForgotPassword = lazy(() => import("../auth/ForgotPassword"));
const BlogPost = lazy(() => import("../blog/BlogPost.jsx"));
const BlogEditor = lazy(() => import("../blog/BlogEditor.jsx"));

// Admin components
const PostManagement = lazy(() => import("../admin/PostManagement.jsx"));
const RoleManagement = lazy(() => import('../admin/RoleManagement.jsx'));
const SystemSetup = lazy(() => import("../admin/SystemSetup.jsx"));

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
                  <Route path="blog/:slug" element={<BlogPost />} />
                  <Route path="editor/new" element={<BlogEditor />} />
                  <Route path="editor/:id" element={<BlogEditor />} />

                  {/* New Unified Admin Routes */}
                  <Route 
                    path="admin" 
                    element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
                  >
                    <Route index element={<PostManagement />} />
                    <Route path="posts" element={<PostManagement />} />
                    <Route path="roles" element={<RoleManagement />} />
                    <Route path="setup" element={<SystemSetup />} />
                  </Route>

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