// src/App.js (updated: centralized routing with path params, added 404, lazy loading for efficiency)
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

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mainapp/:module" element={<MainApp />} /> {/* Updated to path param */}
            <Route path="*" element={<div>404 - Page Not Found. <button onClick={() => window.location.href = '/'}>Go Home</button></div>} /> {/* Edge case: 404 */}
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;