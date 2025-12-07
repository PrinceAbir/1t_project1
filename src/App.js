// src/App.js (updated: centralized routing with path params, added 404, lazy loading for efficiency)
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

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