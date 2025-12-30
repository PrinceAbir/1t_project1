// src/components/version/VersionDesignerContent.js
import React, { useState } from 'react';
import { getMetadata } from '../metadata';
import './VersionDesigner.css'; // We'll create this CSS file

const VersionDesignerContent = () => {
  const [versionInput, setVersionInput] = useState('');
  const [showDesigner, setShowDesigner] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [coreFields, setCoreFields] = useState(null);
  const [selectedFields, setSelectedFields] = useState({});
  const [activeTab, setActiveTab] = useState('field-definitions');
  const [isPrintOnly, setIsPrintOnly] = useState(false);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('1');
  const [noOfAuth, setNoOfAuth] = useState('');

  // Dropdown tab state
  const [dropDowns, setDropDowns] = useState([
    { fieldName: '', dropDown: '', selection: '' }
  ]);

  // Automatic Defaulting tab state
  const [autoDefaults, setAutoDefaults] = useState([
    { fieldToDefault: '', defaultValue: '', replaces: '' }
  ]);

  // Field Properties tab state
  const [fieldProperties, setFieldProperties] = useState({
    rightAdjust: false,
    noInput: false,
    noChange: false,
    reKey: false
  });

  // API Hooks tab state
  const [apiHooks, setApiHooks] = useState({
    checkId: '',
    checkRecord: '',
    beforeUnauth: '',
    afterUnauth: ''
  });

  // Other Details tab state
  const [otherDetails, setOtherDetails] = useState({
    associatedVersion: '',
    nextVersion: '',
    confirmVersion: '',
    previewVersion: ''
  });

  // Service tab state
  const [service, setService] = useState({
    exposeAsService: false,
    serviceName: '',
    activityName: ''
  });

  // Audit tab state
  const [audit, setAudit] = useState({
    recordStatus: '',
    currentNo: '',
    inputter: '1.1',
    authorizer: ''
  });

  const createNew = () => {
    const parts = versionInput.trim().split(',');
    if (parts.length !== 2) {
      alert('Invalid format. Use: APPLICATION,VERSION\nExample: CUSTOMER,CUS.TEST');
      return;
    }

    const appInput = parts[0].trim();
    const ver = parts[1].trim();

    const metadata = getMetadata(appInput);
    if (!metadata) {
      alert(
        `Invalid or unknown core application: "${appInput.toUpperCase()}"\n\n` +
        `Valid applications:\n` +
        `• CUSTOMER\n` +
        `• FUND.TRANSFER\n` +
        `• DEPOSIT (coming soon)\n` +
        `• LENDING (coming soon)\n\n` +
        `Note: Use exact spelling. "fund.transfer" or "FUND.TRANSFER" both work.`
      );
      return;
    }

    setCurrentApp(metadata.application);
    setCurrentVersion(ver.toUpperCase());
    setCoreFields(metadata.fields);
    setSelectedFields({});
    setShowDesigner(true);
    // Reset all form states
    setIsPrintOnly(false);
    setDescription('');
    setLanguage('1');
    setNoOfAuth('');
    setDropDowns([{ fieldName: '', dropDown: '', selection: '' }]);
    setAutoDefaults([{ fieldToDefault: '', defaultValue: '', replaces: '' }]);
    setFieldProperties({ rightAdjust: false, noInput: false, noChange: false, reKey: false });
    setApiHooks({ checkId: '', checkRecord: '', beforeUnauth: '', afterUnauth: '' });
    setOtherDetails({ associatedVersion: '', nextVersion: '', confirmVersion: '', previewVersion: '' });
    setService({ exposeAsService: false, serviceName: '', activityName: '' });
    setAudit({ recordStatus: '', currentNo: '', inputter: '1.1', authorizer: '' });
  };

  const addField = (key) => {
    if (!key || selectedFields[key]) return;
    setSelectedFields(prev => ({ 
      ...prev, 
      [key]: { 
        ...coreFields[key],
        column: '',
        textMax: '',
        text: '',
        attribute: '',
        displayType: 'Text',
        toolTip: '',
        enrich: false
      } 
    }));
  };

  const removeField = (key) => {
    setSelectedFields(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleFieldPropertyChange = (key, property, value) => {
    setSelectedFields(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [property]: value
      }
    }));
  };

  // Dropdown handlers
  const addDropDownRow = () => {
    setDropDowns([...dropDowns, { fieldName: '', dropDown: '', selection: '' }]);
  };

  const updateDropDownRow = (index, field, value) => {
    const updated = [...dropDowns];
    updated[index][field] = value;
    setDropDowns(updated);
  };

  // Automatic Defaulting handlers
  const addAutoDefaultRow = () => {
    setAutoDefaults([...autoDefaults, { fieldToDefault: '', defaultValue: '', replaces: '' }]);
  };

  const updateAutoDefaultRow = (index, field, value) => {
    const updated = [...autoDefaults];
    updated[index][field] = value;
    setAutoDefaults(updated);
  };

  const saveVersion = () => {
    const versionData = {
      application: currentApp,
      version: currentVersion,
      description,
      language,
      noOfAuth,
      isPrintOnly,
      fields: selectedFields,
      dropDowns,
      autoDefaults,
      fieldProperties,
      apiHooks,
      otherDetails,
      service,
      audit,
      createdAt: new Date().toISOString(),
    };
    console.log('VERSION SAVED:', JSON.stringify(versionData, null, 2));
    alert('Version designed successfully! Check console.');
  };

  const tabs = [
    { id: 'field-definitions', label: 'Field Definitions' },
    { id: 'drop-down', label: 'Drop Down' },
    { id: 'automatic-defaulting', label: 'Automatic Defaulting' },
    { id: 'field-properties-api', label: 'Field Properties and API' },
    { id: 'version-api-hooks', label: 'VERSION API Hooks' },
    { id: 'other-details', label: 'Other Details' },
    { id: 'service', label: 'Service' },
    { id: 'audit', label: 'Audit' }
  ];

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'field-definitions':
        return (
          <div className="tab-content">
            <div className="section">
              <div className="checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={isPrintOnly}
                    onChange={(e) => setIsPrintOnly(e.target.checked)}
                  />
                  Print Only
                </label>
              </div>
            </div>

            <div className="section">
              <h3>Description</h3>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Enter description..."
              />
            </div>

            <div className="section form-row">
              <div className="form-group">
                <label>Language 1</label>
                <input 
                  type="text" 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>No. of Auth</label>
                <input 
                  type="text" 
                  value={noOfAuth}
                  onChange={(e) => setNoOfAuth(e.target.value)}
                  placeholder="Enter number"
                />
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h3>Field Definitions</h3>
                <select
                  onChange={(e) => e.target.value && addField(e.target.value)}
                  defaultValue=""
                  className="field-selector"
                >
                  <option value="" disabled>-- Add a field --</option>
                  {Object.keys(coreFields || {})
                    .filter(k => !selectedFields[k])
                    .map(k => (
                      <option key={k} value={k}>
                        {coreFields[k].label} ({coreFields[k].type})
                      </option>
                    ))}
                </select>
              </div>

              <table className="fields-table">
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Col.</th>
                    <th>TextMax.</th>
                    <th>Text</th>
                    <th>Attribute</th>
                    <th>Display Type</th>
                    <th>Tool Tip</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(selectedFields).length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        No fields selected yet. Use the dropdown to add fields.
                      </td>
                    </tr>
                  ) : (
                    Object.keys(selectedFields).map(key => {
                      const field = selectedFields[key];
                      return (
                        <tr key={key}>
                          <td>{field.field_name}</td>
                          <td>
                            <input 
                              type="text"
                              value={field.column || ''}
                              onChange={(e) => handleFieldPropertyChange(key, 'column', e.target.value)}
                              placeholder="Column"
                            />
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={field.textMax || ''}
                              onChange={(e) => handleFieldPropertyChange(key, 'textMax', e.target.value)}
                              placeholder="TextMax"
                            />
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={field.text || ''}
                              onChange={(e) => handleFieldPropertyChange(key, 'text', e.target.value)}
                              placeholder="Text"
                            />
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={field.attribute || ''}
                              onChange={(e) => handleFieldPropertyChange(key, 'attribute', e.target.value)}
                              placeholder="Attribute"
                            />
                          </td>
                          <td>
                            <select 
                              value={field.displayType || 'Text'}
                              onChange={(e) => handleFieldPropertyChange(key, 'displayType', e.target.value)}
                            >
                              <option value="Text">Text</option>
                              <option value="Dropdown">Dropdown</option>
                              <option value="Date">Date</option>
                              <option value="Number">Number</option>
                            </select>
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={field.toolTip || ''}
                              onChange={(e) => handleFieldPropertyChange(key, 'toolTip', e.target.value)}
                              placeholder="Tool tip"
                            />
                          </td>
                          <td>
                            <div className="field-actions">
                              <label className="checkbox-inline">
                                <input 
                                  type="checkbox"
                                  checked={field.enrich || false}
                                  onChange={(e) => handleFieldPropertyChange(key, 'enrich', e.target.checked)}
                                />
                                Enrich
                              </label>
                              <button 
                                onClick={() => removeField(key)}
                                className="remove-btn"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'drop-down':
        return (
          <div className="tab-content">
            <div className="section">
              <div className="section-header">
                <h3>Drop Down Definitions</h3>
                <button onClick={addDropDownRow} className="add-btn">+ Add Row</button>
              </div>
              
              <table className="fields-table">
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Drop Down</th>
                    <th>Selection</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dropDowns.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input 
                          type="text"
                          value={row.fieldName}
                          onChange={(e) => updateDropDownRow(index, 'fieldName', e.target.value)}
                          placeholder="Field name"
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={row.dropDown}
                          onChange={(e) => updateDropDownRow(index, 'dropDown', e.target.value)}
                          placeholder="Drop down"
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={row.selection}
                          onChange={(e) => updateDropDownRow(index, 'selection', e.target.value)}
                          placeholder="Selection"
                        />
                      </td>
                      <td>
                        <button 
                          onClick={() => setDropDowns(dropDowns.filter((_, i) => i !== index))}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'automatic-defaulting':
        return (
          <div className="tab-content">
            <div className="section">
              <div className="section-header">
                <h3>Automatic Defaulting</h3>
                <button onClick={addAutoDefaultRow} className="add-btn">+ Add Row</button>
              </div>
              
              <table className="fields-table">
                <thead>
                  <tr>
                    <th>Field to default</th>
                    <th>Default Value</th>
                    <th>Replaces</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {autoDefaults.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input 
                          type="text"
                          value={row.fieldToDefault}
                          onChange={(e) => updateAutoDefaultRow(index, 'fieldToDefault', e.target.value)}
                          placeholder="Field to default"
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={row.defaultValue}
                          onChange={(e) => updateAutoDefaultRow(index, 'defaultValue', e.target.value)}
                          placeholder="Default value"
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={row.replaces}
                          onChange={(e) => updateAutoDefaultRow(index, 'replaces', e.target.value)}
                          placeholder="Replaces"
                        />
                      </td>
                      <td>
                        <button 
                          onClick={() => setAutoDefaults(autoDefaults.filter((_, i) => i !== index))}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'field-properties-api':
        return (
          <div className="tab-content">
            <div className="section">
              <h3>Field Properties</h3>
              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={fieldProperties.rightAdjust}
                    onChange={(e) => setFieldProperties({...fieldProperties, rightAdjust: e.target.checked})}
                  />
                  Right adjust 1
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={fieldProperties.noInput}
                    onChange={(e) => setFieldProperties({...fieldProperties, noInput: e.target.checked})}
                  />
                  No input 1
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={fieldProperties.noChange}
                    onChange={(e) => setFieldProperties({...fieldProperties, noChange: e.target.checked})}
                  />
                  No change 1
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={fieldProperties.reKey}
                    onChange={(e) => setFieldProperties({...fieldProperties, reKey: e.target.checked})}
                  />
                  Re-key 1
                </label>
              </div>
            </div>
          </div>
        );

      case 'version-api-hooks':
        return (
          <div className="tab-content">
            <div className="section">
              <h3>VERSION API Hooks</h3>
              <p className="api-note">** All API Routines will be invoked before JOURNAL_UPDATE **</p>
              
              <div className="api-hooks-grid">
                <div className="api-hook">
                  <label>Check ID 1</label>
                  <input 
                    type="text"
                    value={apiHooks.checkId}
                    onChange={(e) => setApiHooks({...apiHooks, checkId: e.target.value})}
                    placeholder="Check ID"
                  />
                  <div className="api-actions">
                    <button className="api-btn">+</button>
                    <button className="api-btn">-</button>
                  </div>
                </div>
                
                <div className="api-hook">
                  <label>Check Record 1</label>
                  <input 
                    type="text"
                    value={apiHooks.checkRecord}
                    onChange={(e) => setApiHooks({...apiHooks, checkRecord: e.target.value})}
                    placeholder="Check Record"
                  />
                  <div className="api-actions">
                    <button className="api-btn">+</button>
                    <button className="api-btn">-</button>
                  </div>
                </div>
                
                <div className="api-hook">
                  <label>Before Unauth 1</label>
                  <input 
                    type="text"
                    value={apiHooks.beforeUnauth}
                    onChange={(e) => setApiHooks({...apiHooks, beforeUnauth: e.target.value})}
                    placeholder="Before Unauth"
                  />
                  <div className="api-actions">
                    <button className="api-btn">+</button>
                    <button className="api-btn">-</button>
                  </div>
                </div>
                
                <div className="api-hook">
                  <label>After Unauth 1</label>
                  <input 
                    type="text"
                    value={apiHooks.afterUnauth}
                    onChange={(e) => setApiHooks({...apiHooks, afterUnauth: e.target.value})}
                    placeholder="After Unauth"
                  />
                  <div className="api-actions">
                    <button className="api-btn">+</button>
                    <button className="api-btn">-</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'other-details':
        return (
          <div className="tab-content">
            <div className="section">
              <h3>Other Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Associated Version</label>
                  <input 
                    type="text"
                    value={otherDetails.associatedVersion}
                    onChange={(e) => setOtherDetails({...otherDetails, associatedVersion: e.target.value})}
                    placeholder="Associated Version"
                  />
                </div>
                
                <div className="form-group">
                  <label>Next Version</label>
                  <select 
                    value={otherDetails.nextVersion}
                    onChange={(e) => setOtherDetails({...otherDetails, nextVersion: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="next1">Next Version 1</option>
                    <option value="next2">Next Version 2</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Confirm Version</label>
                  <select 
                    value={otherDetails.confirmVersion}
                    onChange={(e) => setOtherDetails({...otherDetails, confirmVersion: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="confirm1">Confirm Version 1</option>
                    <option value="confirm2">Confirm Version 2</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Preview Version</label>
                  <select 
                    value={otherDetails.previewVersion}
                    onChange={(e) => setOtherDetails({...otherDetails, previewVersion: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="preview1">Preview Version 1</option>
                    <option value="preview2">Preview Version 2</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'service':
        return (
          <div className="tab-content">
            <div className="section">
              <h3>Service Configuration</h3>
              <div className="form-grid">
                <div className="form-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox"
                      checked={service.exposeAsService}
                      onChange={(e) => setService({...service, exposeAsService: e.target.checked})}
                    />
                    Expose Version as Service?
                  </label>
                </div>
                
                <div className="form-group">
                  <label>Service Name</label>
                  <input 
                    type="text"
                    value={service.serviceName}
                    onChange={(e) => setService({...service, serviceName: e.target.value})}
                    placeholder="Service Name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Activity Name</label>
                  <input 
                    type="text"
                    value={service.activityName}
                    onChange={(e) => setService({...service, activityName: e.target.value})}
                    placeholder="Activity Name"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'audit':
        return (
          <div className="tab-content">
            <div className="section">
              <h3>Audit Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Record Status</label>
                  <input 
                    type="text"
                    value={audit.recordStatus}
                    onChange={(e) => setAudit({...audit, recordStatus: e.target.value})}
                    placeholder="Record Status"
                  />
                </div>
                
                <div className="form-group">
                  <label>Current No</label>
                  <input 
                    type="text"
                    value={audit.currentNo}
                    onChange={(e) => setAudit({...audit, currentNo: e.target.value})}
                    placeholder="Current No"
                  />
                </div>
                
                <div className="form-group">
                  <label>Inputter</label>
                  <input 
                    type="text"
                    value={audit.inputter}
                    onChange={(e) => setAudit({...audit, inputter: e.target.value})}
                    placeholder="Inputter"
                  />
                </div>
                
                <div className="form-group">
                  <label>Authorizer</label>
                  <input 
                    type="text"
                    value={audit.authorizer}
                    onChange={(e) => setAudit({...audit, authorizer: e.target.value})}
                    placeholder="Authorizer"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="tab-content">Select a tab to configure</div>;
    }
  };

  return (
    <div className="version-designer">
      <div className="designer-header">
        <h1>VERSION DESIGNER</h1>
      </div>

      <div className="input-section">
        <div className="input-container">
          <div className="input-group">
            <span className="input-label">NEW VERSION</span>
            <input
              type="text"
              value={versionInput}
              onChange={(e) => setVersionInput(e.target.value)}
              placeholder="e.g., CUSTOMER,CUS.TEST"
              className="version-input"
            />
            <div className="action-buttons">
              <button className="icon-btn" title="Create New">+</button>
              <button className="icon-btn" title="Edit">✎</button>
              <button className="icon-btn" title="View">👁️</button>
              <button className="icon-btn" title="Clear">×</button>
              <button className="icon-btn" title="Settings">⚙️</button>
            </div>
          </div>
        </div>
        
        <button onClick={createNew} className="create-btn">
          + Create New Version
        </button>
      </div>

      {showDesigner && coreFields && (
        <>
          <div className="designer-title">
            <h2>Version Designer / {currentApp},{currentVersion}</h2>
          </div>

          <div className="tabs-container">
            <div className="tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-content-container">
              {renderTabContent()}
            </div>

            <div className="save-section">
              <button onClick={saveVersion} className="save-btn">
                Save Version
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VersionDesignerContent;