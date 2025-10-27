// App shell: theme provider + router + layout

import { HashRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';

import Layout from './Layout.jsx';
import Home from '../content/Home.jsx';
import Now from '../content/Now.jsx';
import NoMatch from '../content/NoMatch.jsx';

export default function App() {
return (
  <ThemeProvider>
    <div className="bg-body text-body min-vh-100 pv-4">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}> 
            <Route index element={<Home />} />
            <Route path="now" element={<Now />} />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  </ThemeProvider>
);
}
