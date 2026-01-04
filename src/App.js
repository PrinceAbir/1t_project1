import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";


const HomePage = lazy(() => import("./components/Homepage"));
const MainApp = lazy(() => import("./components/MainApp"));
const MetadataPage= lazy(() => import("./components/MetadataPage"));
const MetadataAddOnlyPage= lazy(() => import("./components/MetadataAddOnlyPage"));

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
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
