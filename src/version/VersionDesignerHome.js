// src/components/version/VersionDesignerHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMetadata, getAllApplications } from '../metadata'; // Correct path
import './VersionDesignerHome.css';

const VersionDesignerHome = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [versionName, setVersionName] = useState('');
  const [availableApps, setAvailableApps] = useState([]);
  const navigate = useNavigate();

  // Load all available applications on mount
  useEffect(() => {
    const apps = getAllApplications();
    setAvailableApps(apps || []);
  }, []);

  const handleCreateNew = () => {
    let finalInput = inputValue;
    
    if (!selectedApp || !versionName) {
      if (!inputValue) {
        alert('Please select an application and enter a version name');
        return;
      }
      
      const parts = inputValue.trim().split(',');
      if (parts.length !== 2) {
        alert('Please enter in format: APPLICATION,VERSION\nExample: CUSTOMER,CUS.TEST');
        return;
      }
      
      finalInput = inputValue;
    } else {
      finalInput = `${selectedApp},${versionName}`;
    }

    const parts = finalInput.trim().split(',');
    const appInput = parts[0].trim();
    const version = parts[1].trim();

    if (!appInput || !version) {
      alert('Please provide both application name and version');
      return;
    }

    const metadata = getMetadata(appInput);
    if (!metadata) {
      alert(
        `Invalid or unknown core application: "${appInput}"\n\n` +
        `Available applications:\n` +
        availableApps.map(app => `• ${app.name}`).join('\n')
      );
      return;
    }

    navigate('/mainapp/version-designer/workspace', {
      state: {
        application: metadata.application,
        version: version.toUpperCase(),
        coreFields: metadata.fields,
        appInput: appInput
      }
    });
  };

  const handleDirectInputChange = (value) => {
    setInputValue(value);
    const parts = value.split(',');
    if (parts.length === 2) {
      setSelectedApp(parts[0].trim());
      setVersionName(parts[1].trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreateNew();
    }
  };

  const selectedAppDetails = availableApps.find(app => app.name === selectedApp);

  return (
    <div className="version-designer-home">
      {/* Header */}
      <div className="vdh-header">
        <div className="vdh-header-left">
          <button
            onClick={() => navigate('/')}
            className="vdh-back-button"
          >
            ← Home
          </button>
          <div className="vdh-title-container">
            <h1 className="vdh-title">VERSION DESIGNER</h1>
            <p className="vdh-subtitle">Create customized versions of core applications</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="vdh-content">
        {/* Main Input Card */}
        <div className="vdh-input-card">
          <h2 className="vdh-section-title">NEW VERSION</h2>

          {/* Combined Input Field */}
          <div className="vdh-input-container">
            <div className="vdh-combined-input">
              {/* REPLACED CUSTOM DROPDOWN WITH SIMPLE <select> */}
              <div className="vdh-app-dropdown-container">
                <select
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  className="vdh-dropdown-toggle" // Reuses your existing style
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    fontSize: '16px', 
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>
                    Select Application
                  </option>
                  {availableApps.map((app) => (
                    <option key={app.name} value={app.name}>
                      {app.name.replace('.', ' ')} {app.icon || ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comma Separator */}
              <div className="vdh-comma-separator">,</div>

              {/* Version Name Input */}
              <input
                id="versionNameInput"
                type="text"
                value={versionName}
                onChange={(e) => {
                  setVersionName(e.target.value);
                  setInputValue(`${selectedApp},${e.target.value}`);
                }}
                placeholder="Version Name (e.g., CUS.TEST)"
                className="vdh-version-input"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Action Buttons */}
            <div className="vdh-action-buttons">
              <button
                onClick={handleCreateNew}
                title="Create New"
                className="vdh-action-btn vdh-create-btn"
              >
                +
              </button>

              <button
                onClick={() => alert('Edit functionality coming soon')}
                title="Edit"
                className="vdh-action-btn vdh-edit-btn"
              >
                ✎
              </button>

              <button
                onClick={() => alert('View functionality coming soon')}
                title="View"
                className="vdh-action-btn vdh-view-btn"
              >
                👁️
              </button>

              <button
                onClick={() => {
                  setInputValue('');
                  setSelectedApp('');
                  setVersionName('');
                }}
                title="Clear"
                className="vdh-action-btn vdh-clear-btn"
              >
                ×
              </button>

              <button
                onClick={() => alert('Settings functionality coming soon')}
                title="Settings"
                className="vdh-action-btn vdh-settings-btn"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Alternative: Direct Text Input */}
          <div className="vdh-alternative-input">
            <p className="vdh-alternative-label">Or type directly:</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleDirectInputChange(e.target.value)}
              placeholder="CUSTOMER,CUS.TEST or FUND.TRANSFER,FT.V1"
              className="vdh-direct-input"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Create Button */}
          <div className="vdh-create-button-container">
            <button
              onClick={handleCreateNew}
              className="vdh-primary-button"
              disabled={!selectedApp || !versionName}
            >
              <span className="vdh-button-icon">+</span>
              Create New Version
            </button>
          </div>
        </div>

        {/* Selected Application Preview */}
        {selectedAppDetails && (
          <div className="vdh-app-preview">
            <h3 className="vdh-preview-title">Selected Application</h3>
            <div className="vdh-app-preview-card">
              <div className="vdh-preview-header">
                <span className="vdh-preview-icon">{selectedAppDetails.icon || '📁'}</span>
                <div className="vdh-preview-info">
                  <h4 className="vdh-preview-name">{selectedAppDetails.name}</h4>
                  <p className="vdh-preview-desc">{selectedAppDetails.description || 'No description available'}</p>
                </div>
              </div>
              <div className="vdh-preview-details">
                <div className="vdh-preview-detail">
                  <span className="vdh-detail-label">Fields:</span>
                  <span className="vdh-detail-value">{selectedAppDetails.fieldCount || 'N/A'}</span>
                </div>
                <div className="vdh-preview-detail">
                  <span className="vdh-detail-label">Type:</span>
                  <span className="vdh-detail-value">{selectedAppDetails.type || 'Core'}</span>
                </div>
                <div className="vdh-preview-detail">
                  <span className="vdh-detail-label">Status:</span>
                  <span className="vdh-detail-value vdh-status-active">Available</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="vdh-help-section">
          <h3 className="vdh-help-title">How to create a new version</h3>
          <div className="vdh-help-steps">
            <div className="vdh-help-step">
              <div className="vdh-step-number">1</div>
              <div className="vdh-step-content">
                <h4>Select Application</h4>
                <p>Choose from available applications or type the name directly</p>
              </div>
            </div>
            <div className="vdh-help-step">
              <div className="vdh-step-number">2</div>
              <div className="vdh-step-content">
                <h4>Enter Version Name</h4>
                <p>Provide a unique version name (e.g., CUS.TEST, FT.V1)</p>
              </div>
            </div>
            <div className="vdh-help-step">
              <div className="vdh-step-number">3</div>
              <div className="vdh-step-content">
                <h4>Create & Customize</h4>
                <p>Click create and customize fields in the designer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Applications Section */}
        <div className="vdh-all-apps-section">
          <div className="vdh-section-header">
            <h3 className="vdh-section-title">Available Applications</h3>
            <span className="vdh-section-count">{availableApps.length} applications</span>
          </div>
          <div className="vdh-apps-grid">
            {availableApps.map((app) => (
              <div
                key={app.name}
                className={`vdh-app-card ${selectedApp === app.name ? 'selected' : ''}`}
                onClick={() => setSelectedApp(app.name)}
              >
                <div className="vdh-app-card-icon" style={{ backgroundColor: app.color || '#4f46e5' }}>
                  {app.icon || '📁'}
                </div>
                <div className="vdh-app-card-content">
                  <h4 className="vdh-app-card-name">{app.name}</h4>
                  <p className="vdh-app-card-desc">{app.description || 'No description'}</p>
                  <div className="vdh-app-card-tags">
                    <span className="vdh-app-tag">{app.type || 'Core'}</span>
                    <span className="vdh-app-tag">{app.fieldCount || '0'} fields</span>
                  </div>
                </div>
                {selectedApp === app.name && (
                  <div className="vdh-app-card-selected">
                    <span>Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionDesignerHome;