// src/components/HomePage.js
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const API_BASE = "http://localhost:5000/api/metadata";

const HomePage = () => {
  const navigate = useNavigate();
  const [cmdInput, setCmdInput] = useState('');
  const [cmdLoading, setCmdLoading] = useState(false);
  const [cmdError, setCmdError] = useState('');

  // Available modules/applications (memoized)
  const MODULES = useMemo(() => [
    { id: 'customer', title: 'Customer', desc: 'Manage customers, profiles and KYC.', icon: '👤', color: '#667eea' },
    { id: 'fundtransfer', title: 'Fund Transfer', desc: 'Create and manage transfers.', icon: '💸', color: '#48bb78' },
    { id: 'account', title: 'Account', desc: 'Account opening and maintenance.', icon: '🏦', color: '#ed8936' },
    { id: 'deposit', title: 'Deposit', desc: 'Create deposit products and placements.', icon: '💰', color: '#9f7aea' },
    { id: 'lending', title: 'Lending', desc: 'Loan origination and servicing.', icon: '📈', color: '#4299e1' },
    { id: 'etd', title: 'Create App', desc: 'Create and design custom Electronic Transaction Documents.', icon: '📝', color: '#f56565' },
    {
      id: 'version-designer',
      title: 'Version Designer',
      desc: 'Create and customize versions of core applications (Customer, Fund Transfer, etc.).',
      icon: '🔧',
      color: '#7c3aed'
    }
  ], []);

  const handleModuleClick = (module) => {
    if (module.id === 'etd') {
      navigate('/mainapp/etd');
    } else if (module.id === 'version-designer') {
      navigate('/mainapp/version-designer');
    } else {
      navigate(`/mainapp/${module.id}`, { 
        state: { module: module } 
      });
    }
  };

  const checkApplicationExists = async (appName) => {
    try {
      const response = await fetch(
        `${API_BASE}/exists?application=${encodeURIComponent(appName)}`
      );
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      return data.exists === true;
    } catch (err) {
      console.error("Exists check failed:", err);
      return false;
    }
  };

  const handleCmdSubmit = async (e) => {
    e.preventDefault();
    const appName = cmdInput.trim();

    if (!appName) {
      setCmdError("Please enter an application name");
      return;
    }

    setCmdLoading(true);
    setCmdError('');

    const exists = await checkApplicationExists(appName);

    setCmdLoading(false);

    if (exists) {
      navigate(`/mainapp/${appName}`);
      setCmdInput('');
      setCmdError('');
    } else {
      setCmdError(`Application "${appName}" not found. Please check the name or create it in Version Designer.`);
    }
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="hp-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">1T</span>
            <span className="logo-text">1 Technologies Ltd</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">Welcome, Admin</span>
            <div className="user-status">
              <div className="status-dot"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Command Bar with Validation */}
      <div className="cmd-bar-container">
        <form onSubmit={handleCmdSubmit} className="cmd-bar">
          <input
            type="text"
            value={cmdInput}
            onChange={(e) => {
              setCmdInput(e.target.value);
              setCmdError('');
            }}
            placeholder="Enter application name (e.g. customer)..."
            className="cmd-input"
            autoComplete="off"
            disabled={cmdLoading}
          />
          <button 
            type="submit" 
            className="cmd-submit-btn" 
            title="Open Application"
            disabled={cmdLoading}
          >
            {cmdLoading ? '⟳' : '🔍'}
          </button>
        </form>
        <p className="cmd-hint">Quick launch any core or custom application</p>
        {cmdError && (
          <p className="cmd-error">{cmdError}</p>
        )}
      </div>

      {/* Main Content */}
      <main className="hp-main">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1>1 Technologies CBS</h1>
            <p>Select an application module to begin transaction processing</p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="modules-grid-section">
          <div className="section-header">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'}}>
              <div>
                <h2>Application Modules</h2>
                <p>Click on any module to proceed</p>
              </div>
            </div>
          </div>
          <div className="modules-grid">   
            {MODULES.map(module => (
              <div
                key={module.id}
                className="module-card"
                onClick={() => handleModuleClick(module)}
                style={{ '--card-color': module.color }}
              >
                <div className="module-icon" style={{ color: module.color }}>
                  {module.icon}
                </div>
                <div className="module-content">
                  <h3>{module.title}</h3>
                  <p>{module.desc}</p>
                </div>
                <div className="module-arrow">→</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h4>{MODULES.length}</h4>
              <p>Application Modules</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h4>Active</h4>
              <p>System Status</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h4>Admin</h4>
              <p>User Role</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span>1 Technologies Explorer v1.0.0</span>
            <span className="footer-separator">•</span>
            <span>1T Core Banking System</span>
          </div>
          <div className="footer-right">
            <span>Session: Active</span>
            <span className="footer-separator">•</span>
            <span>© 2025 All Rights Reserved by <b>1Technologies</b></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(HomePage);