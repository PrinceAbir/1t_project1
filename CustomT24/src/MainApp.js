// MainApp.js
import React, { useState, useEffect } from 'react';
import T24TransactExplorer from './components/T24TransactExplorer';
import './MainApp.css';

const MainApp = () => {
  const [recordId, setRecordId] = useState('');
  const [activeRecord, setActiveRecord] = useState(null);
  const [appMode, setAppMode] = useState('create'); // 'create', 'edit', 'view'
  const [showSettings, setShowSettings] = useState(false);
  const [recentRecords, setRecentRecords] = useState([]);
  const [currentModule, setCurrentModule] = useState('customer'); // Default module

  // Mock recent records
  const MOCK_RECORDS = [
    { id: 'CUST00123', name: 'John Smith', type: 'Customer', date: '2024-01-15' },
    { id: 'FT2024001', name: 'Domestic Transfer', type: 'Funds', date: '2024-01-14' },
    { id: 'ACCT45678', name: 'Savings Account', type: 'Account', date: '2024-01-13' },
    { id: 'DEP78901', name: 'Fixed Deposit', type: 'Deposit', date: '2024-01-12' },
    { id: 'LN234567', name: 'Home Loan', type: 'Lending', date: '2024-01-11' },
  ];

  // Get module from URL or default
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const moduleParam = params.get('module');
    if (moduleParam) {
      setCurrentModule(moduleParam);
    }
    
    // Load recent records
    const savedRecords = JSON.parse(localStorage.getItem('t24_recent_records') || '[]');
    setRecentRecords(savedRecords.length > 0 ? savedRecords : MOCK_RECORDS);
  }, []);

  const handleCreate = () => {
    if (!recordId.trim()) {
      alert('Please enter a record ID');
      return;
    }

    const newRecord = {
      id: recordId,
      name: `New ${getModuleName()} Record`,
      type: getModuleName(),
      date: new Date().toISOString().split('T')[0],
      isNew: true
    };

    // Save to recent records
    const updatedRecords = [
      newRecord,
      ...recentRecords.filter(record => record.id !== newRecord.id)
    ].slice(0, 5);
    
    setRecentRecords(updatedRecords);
    localStorage.setItem('t24_recent_records', JSON.stringify(updatedRecords));

    setActiveRecord(newRecord);
    setAppMode('create');
    setRecordId('');
  };

  const handleEdit = () => {
    if (!recordId.trim()) {
      alert('Please enter a record ID to edit');
      return;
    }

    // Find existing record or create new for editing
    const existingRecord = recentRecords.find(record => 
      record.id === recordId || record.name.toLowerCase().includes(recordId.toLowerCase())
    );

    if (existingRecord) {
      setActiveRecord(existingRecord);
      setAppMode('edit');
    } else {
      const newRecord = {
        id: recordId,
        name: `${getModuleName()} Record`,
        type: getModuleName(),
        date: new Date().toISOString().split('T')[0],
        isNew: false
      };
      setActiveRecord(newRecord);
      setAppMode('edit');
    }
    setRecordId('');
  };

  const handleView = () => {
    if (!recordId.trim()) {
      alert('Please enter a record ID to view');
      return;
    }

    const existingRecord = recentRecords.find(record => 
      record.id === recordId || record.name.toLowerCase().includes(recordId.toLowerCase())
    );

    if (existingRecord) {
      setActiveRecord(existingRecord);
      setAppMode('view');
      setRecordId('');
    } else {
      alert('Record not found. Please create a new record or check the ID.');
    }
  };

  const handleClear = () => {
    setRecordId('');
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleRecordClick = (record) => {
    setRecordId(record.id);
    setActiveRecord(record);
    setAppMode('view');
  };

  const getModuleName = () => {
    const modules = {
      'customer': 'Customer',
      'funds': 'Fund Transfer',
      'account': 'Account',
      'deposit': 'Deposit',
      'lending': 'Lending'
    };
    return modules[currentModule] || 'Application';
  };

  const getModuleIcon = () => {
    const icons = {
      'customer': '👤',
      'funds': '💸',
      'account': '🏦',
      'deposit': '💰',
      'lending': '📈'
    };
    return icons[currentModule] || '📋';
  };

  const getPlaceholder = () => {
    const placeholders = {
      'customer': 'e.g., CUST00123, CUST00456...',
      'funds': 'e.g., FT2024001, FT2024002...',
      'account': 'e.g., ACCT45678, ACCT45679...',
      'deposit': 'e.g., DEP78901, DEP78902...',
      'lending': 'e.g., LN234567, LN234568...'
    };
    return placeholders[currentModule] || 'Enter a record ID...';
  };

  return (
    <div className="main-app">

      {/* Main Content */}
      <main className="ma-main">
        {!activeRecord ? (
          <>
            {/* Record Input Section */}
            <div className="record-input-section">
              
              <div className="input-container">
                <div className="input-group">
                  <div className="input-label-row">
                    <label htmlFor="recordInput">
                      CUSTOMER
                    </label>
                  </div>
                  <div className="input-field">
                    <input
                      id="recordInput"
                      type="text"
                      value={recordId}
                      onChange={(e) => setRecordId(e.target.value)}
                      placeholder={getPlaceholder()}
                      className="record-input"
                      autoComplete="off"
                    />
                    <div className="input-actions">
                      <button
                        className="action-btn create-btn"
                        onClick={handleCreate}
                        disabled={!recordId.trim()}
                      >
                        <span className="btn-icon">+</span>
                        <span className="btn-text">Create New</span>
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={handleEdit}
                        disabled={!recordId.trim()}
                      >
                        <span className="btn-icon">✎</span>
                        <span className="btn-text">Edit</span>
                      </button>
                      <button
                        className="action-btn view-btn"
                        onClick={handleView}
                        disabled={!recordId.trim()}
                      >
                        <span className="btn-icon">👁️</span>
                        <span className="btn-text">View</span>
                      </button>
                      <button
                        className="action-btn clear-btn"
                        onClick={handleClear}
                      >
                        <span className="btn-icon">×</span>
                        <span className="btn-text">Clear</span>
                      </button>
                      <button
                        className="action-btn settings-btn"
                        onClick={handleSettings}
                      >
                        <span className="btn-icon">⚙️</span>
                        <span className="btn-text">Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

        
          </>
        ) : (
          /* T24 Transact Explorer View */
          <div className="explorer-view">
            <div className="explorer-header">
              <button className="back-to-main" onClick={() => setActiveRecord(null)}>
                ← Back to Records
              </button>
              <div className="explorer-info">
                <h2>
                  {activeRecord.name}
                  <span className="record-mode">[{appMode.toUpperCase()}]</span>
                </h2>
                <div className="record-details">
                  <span className="detail-item">
                    <strong>ID:</strong> {activeRecord.id}
                  </span>
                  <span className="detail-item">
                    <strong>Type:</strong> {activeRecord.type}
                  </span>
                  <span className="detail-item">
                    <strong>Date:</strong> {activeRecord.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="explorer-content">
              <T24TransactExplorer 
                module={currentModule}
                recordId={activeRecord.id}
                mode={appMode}
              />
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default MainApp;