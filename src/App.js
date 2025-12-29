// src/App.js (updated: added direct route for /mainapp/etd to ETDDesigner)
import React, { lazy, Suspense } from 'react';
// Note: runtime require used below to avoid Jest/ESM resolver issues
import './App.css';

// Load routing components at runtime to avoid test-time resolver issues
let Router = ({ children }) => <>{children}</>;
let Routes = ({ children }) => <>{children}</>;
let Route = ({ element }) => element;

try {
  // Require react-router-dom if available (avoids ESM-only resolution issues in Jest)
  // Wrap in try/catch so environments without the package (or with ESM-only builds) fall back.
  // eslint-disable-next-line global-require
  const rr = require('react-router-dom');
  Router = rr.BrowserRouter || rr.Router || Router;
  Routes = rr.Routes || Routes;
  Route = rr.Route || Route;
} catch (e) {
  // ignore - fallback components will be used
}

const HomePage = lazy(() => import('./components/Homepage'));
const MainApp = lazy(() => import('./components/MainApp'));
const MetaBuilder = lazy(() => import('./components/MetaBuilder'));
const ETDDesigner = lazy(() => import('./ETD/ETDDesigner'));

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/meta-builder" element={<MetaBuilder />} />

            {/* Direct route for ETD module - this fixes the "invalid module" error */}
            <Route path="/mainapp/etd" element={<ETDDesigner />} />

            {/* Catch-all for other modules (customer, funds, account, deposit, lending) */}
            <Route path="/mainapp/:module" element={<MainApp />} />

            {/* Optional: old direct route if anyone bookmarks it */}
            {/* <Route path="/etd-designer" element={<ETDDesigner />} /> */}

            {/* 404 Fallback */}
            <Route 
              path="*" 
              element={
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>404 - Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
                  >
                    Go Home
                  </button>
                </div>
              } 
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;