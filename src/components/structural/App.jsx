// App shell: theme provider + router + layout
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';

import Layout from './Layout.jsx';
import Home from '../content/Home.jsx';
import Now from '../content/Now.jsx';
import NoMatch from '../content/NoMatch.jsx';

import AuthProvider from "../auth/AuthProvider.jsx";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";

import Register from "../auth/Register";
import Login from "../auth/Login";
import Logout from "../auth/Logout";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="bg-body text-body min-vh-100 pv-4">
          <HashRouter>
            <Routes>
              <Route path="/" element={<Layout />}> 
                <Route index element={<Home />} />
                <Route path="now" element={<Now />} />

                {/* Auth routes */}
                <Route path="register" element={<Register />} />
                <Route path="login" element={<Login />} />
                <Route path="logout" element={<Logout />} />

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
          </HashRouter>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}