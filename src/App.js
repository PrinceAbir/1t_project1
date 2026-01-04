import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";


const HomePage = lazy(() => import("./components/Homepage"));
const MainApp = lazy(() => import("./components/MainApp"));
const MetadataPage= lazy(() => import("./components/MetadataPage"));
const MetadataAddOnlyPage= lazy(() => import("./components/MetadataAddOnlyPage"));


let Router = ({ children }) => <>{children}</>;
let Routes = ({ children }) => <>{children}</>;
let Route = ({ element }) => element;

try {
  const rr = require('react-router-dom');
  Router = rr.BrowserRouter || rr.Router || Router;
  Routes = rr.Routes || Routes;
  Route = rr.Route || Route;
} catch (e) {
  // ignore
}

const MetaBuilder = lazy(() => import('./components/MetaBuilder'));
const ETDDesigner = lazy(() => import('./ETD/ETDDesigner'));
const VersionDesignerHome = lazy(() => import('./version/VersionDesignerHome'));
const VersionDesignerWorkspace = lazy(() => import('./version/VersionDesignerWorkspace'));

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mainapp/:module" element={<MainApp />} />{" "}
            <Route path="/metadata/:module" element={<MetadataPage />} />
            <Route
              path="/metadata-add/:module"
              element={<MetadataAddOnlyPage />}
            />
            <Route
              path="*"
              element={
                <div>
                  404 - Page Not Found.{" "}
                  <button onClick={() => (window.location.href = "/")}>
                    Go Home
                  </button>
                </div>
              }
            />{" "}
            {/* Edge case: 404 */}
            <Route path="/meta-builder" element={<MetaBuilder />} />

            {/* Version Designer Routes - Support both patterns */}
            {/* Pattern 1: Without /mainapp/ prefix */}
            <Route path="/version-designer" element={<VersionDesignerHome />} />
            <Route path="/version-designer/workspace" element={<VersionDesignerWorkspace />} />
            
            {/* Pattern 2: With /mainapp/ prefix (for consistency with other modules) */}
            <Route path="/mainapp/version-designer" element={<VersionDesignerHome />} />
            <Route path="/mainapp/version-designer/workspace" element={<VersionDesignerWorkspace />} />
            
            {/* ETD route */}
            <Route path="/mainapp/etd" element={<ETDDesigner />} />

            {/* CATCH-ALL route for other modules */}
            <Route path="/mainapp/:module" element={<MainApp />} />

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
