// src/components/version/VersionDesignerWorkspace.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VersionDesignerWorkspace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract data from navigation state
  const { application, version, coreFields, appInput } = location.state || {};

  // States for each tab
  const [activeTab, setActiveTab] = useState('field-definitions');
  const [selectedFields, setSelectedFields] = useState({});
  const [isPrintOnly, setIsPrintOnly] = useState(false);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('1');
  const [noOfAuth, setNoOfAuth] = useState('');

  // Dropdown tab
  const [dropDowns, setDropDowns] = useState([
    { fieldName: '', dropDown: '', selection: '' }
  ]);

  // Automatic Defaulting tab
  const [autoDefaults, setAutoDefaults] = useState([
    { fieldToDefault: '', defaultValue: '', replaces: '' }
  ]);

  // Field Properties tab
  const [fieldProperties, setFieldProperties] = useState({
    rightAdjust: false,
    noInput: false,
    noChange: false,
    reKey: false
  });

  // API Hooks tab
  const [apiHooks, setApiHooks] = useState({
    checkId: '',
    checkRecord: '',
    beforeUnauth: '',
    afterUnauth: ''
  });

  // Other Details tab
  const [otherDetails, setOtherDetails] = useState({
    associatedVersion: '',
    nextVersion: '',
    confirmVersion: '',
    previewVersion: ''
  });

  // Service tab
  const [service, setService] = useState({
    exposeAsService: false,
    serviceName: '',
    activityName: ''
  });

  // Audit tab
  const [audit, setAudit] = useState({
    recordStatus: '',
    currentNo: '',
    inputter: '1.1',
    authorizer: ''
  });

  useEffect(() => {
    if (!application || !version || !coreFields) {
      navigate('/version-designer');
    }
  }, [application, version, coreFields, navigate]);

  const handleBack = () => {
    navigate('/version-designer');
  };

  const addField = (key) => {
    if (!key || selectedFields[key]) return;
    
    const coreField = coreFields[key];
    const newField = {
      ...coreField,
      // Add version-specific properties
      column: '',
      textMax: coreField.max_length?.toString() || '',
      text: '',
      attribute: '',
      displayType: 'Text',
      toolTip: '',
      enrich: false,
      mandatory: coreField.mandatory || false,
      min_length: coreField.min_length,
      max_length: coreField.max_length
    };
    
    setSelectedFields(prev => ({ ...prev, [key]: newField }));
  };

  const removeField = (key) => {
    setSelectedFields(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const updateFieldProperty = (key, property, value) => {
    setSelectedFields(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [property]: value
      }
    }));
  };

  // Tab content renderers
  const renderFieldDefinitions = () => (
    <div style={{ padding: '20px' }}>
      {/* Print Only */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={isPrintOnly}
            onChange={(e) => setIsPrintOnly(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '16px', color: '#334155' }}>Print Only</span>
        </label>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '10px' }}>Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Language and No. of Auth */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        <div>
          <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '10px' }}>Language 1</h3>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              width: '100px',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '10px' }}>No. of Auth</h3>
          <input
            type="text"
            value={noOfAuth}
            onChange={(e) => setNoOfAuth(e.target.value)}
            style={{
              width: '100px',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Field Definitions Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', color: '#334155' }}>Field Definitions</h3>
          <select
            onChange={(e) => e.target.value && addField(e.target.value)}
            defaultValue=""
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          >
            <option value="" disabled>-- Add a field --</option>
            {Object.keys(coreFields)
              .filter(k => !selectedFields[k])
              .map(k => (
                <option key={k} value={k}>
                  {coreFields[k].label}
                </option>
              ))}
          </select>
        </div>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              {['Field Name', 'Col.', 'TextMax.', 'Text', 'Attribute', 'Display Type', 'Tool Tip', 'Enrich', 'Actions'].map(header => (
                <th key={header} style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontSize: '14px',
                  color: '#334155',
                  fontWeight: '600'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(selectedFields).length === 0 ? (
              <tr>
                <td colSpan="9" style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#94a3b8',
                  fontStyle: 'italic'
                }}>
                  No fields selected yet. Use the dropdown to add fields.
                </td>
              </tr>
            ) : (
              Object.keys(selectedFields).map(key => {
                const field = selectedFields[key];
                return (
                  <tr key={key} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                    <td style={{ padding: '12px 15px', fontSize: '14px', color: '#334155' }}>
                      {field.field_name}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <input
                        type="text"
                        value={field.column || ''}
                        onChange={(e) => updateFieldProperty(key, 'column', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <input
                        type="text"
                        value={field.textMax || ''}
                        onChange={(e) => updateFieldProperty(key, 'textMax', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <input
                        type="text"
                        value={field.text || ''}
                        onChange={(e) => updateFieldProperty(key, 'text', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <input
                        type="text"
                        value={field.attribute || ''}
                        onChange={(e) => updateFieldProperty(key, 'attribute', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <select
                        value={field.displayType || 'Text'}
                        onChange={(e) => updateFieldProperty(key, 'displayType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="Text">Text</option>
                        <option value="Dropdown">Dropdown</option>
                        <option value="Date">Date</option>
                        <option value="Number">Number</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <input
                        type="text"
                        value={field.toolTip || ''}
                        onChange={(e) => updateFieldProperty(key, 'toolTip', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={field.enrich || false}
                        onChange={(e) => updateFieldProperty(key, 'enrich', e.target.checked)}
                        style={{ width: '16px', height: '16px' }}
                      />
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <button
                        onClick={() => removeField(key)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
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

  const renderDropDown = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '20px' }}>Drop Down</h3>
        <button
          onClick={() => setDropDowns([...dropDowns, { fieldName: '', dropDown: '', selection: '' }])}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          + Add Row
        </button>
        
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              {['Field Name', 'Drop Down', 'Selection', 'Actions'].map(header => (
                <th key={header} style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontSize: '14px',
                  color: '#334155',
                  fontWeight: '600'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dropDowns.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                <td style={{ padding: '12px 15px' }}>
                  <input
                    type="text"
                    value={row.fieldName}
                    onChange={(e) => {
                      const updated = [...dropDowns];
                      updated[index].fieldName = e.target.value;
                      setDropDowns(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </td>
                <td style={{ padding: '12px 15px' }}>
                  <input
                    type="text"
                    value={row.dropDown}
                    onChange={(e) => {
                      const updated = [...dropDowns];
                      updated[index].dropDown = e.target.value;
                      setDropDowns(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </td>
                <td style={{ padding: '12px 15px' }}>
                  <input
                    type="text"
                    value={row.selection}
                    onChange={(e) => {
                      const updated = [...dropDowns];
                      updated[index].selection = e.target.value;
                      setDropDowns(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </td>
                <td style={{ padding: '12px 15px' }}>
                  <button
                    onClick={() => setDropDowns(dropDowns.filter((_, i) => i !== index))}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
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

  const renderAutomaticDefaulting = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '20px' }}>Automatic Defaulting</h3>
        <button
          onClick={() => setAutoDefaults([...autoDefaults, { fieldToDefault: '', defaultValue: '', replaces: '' }])}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          + Add Row
        </button>
        
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              {['Field to default', 'Default Value', 'Replaces', 'Actions'].map(header => (
                <th key={header} style={{
                  padding: '12px 15px',
                  textAlign: 'left',
                  fontSize: '14px',
                  color: '#334155',
                  fontWeight: '600'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {autoDefaults.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                <td style={{ padding: '12px 15px' }}>
                  <input
                    type="text"
                    value={row.fieldToDefault}
                    onChange={(e) => {
                      const updated = [...autoDefaults];
                      updated[index].fieldToDefault = e.target.value;
                      setAutoDefaults(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </td>
                <td style={{ padding: '12px 15px' }}>
                  <input
                    type="text"
                    value={row.defaultValue}
                    onChange={(e) => {
                      const updated = [...autoDefaults];
                      updated[index].defaultValue = e.target.value;
                      setAutoDefaults(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </td>
                <td style={{ padding: '12px 15px' }}>
                  <input
                    type="text"
                    value={row.replaces}
                    onChange={(e) => {
                      const updated = [...autoDefaults];
                      updated[index].replaces = e.target.value;
                      setAutoDefaults(updated);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </td>
                <td style={{ padding: '12px 15px' }}>
                  <button
                    onClick={() => setAutoDefaults(autoDefaults.filter((_, i) => i !== index))}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
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

  const renderFieldProperties = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '20px' }}>Field Properties</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '500px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
          <input
            type="checkbox"
            checked={fieldProperties.rightAdjust}
            onChange={(e) => setFieldProperties({...fieldProperties, rightAdjust: e.target.checked})}
            style={{ width: '16px', height: '16px' }}
          />
          <span>Right adjust 1</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
          <input
            type="checkbox"
            checked={fieldProperties.noInput}
            onChange={(e) => setFieldProperties({...fieldProperties, noInput: e.target.checked})}
            style={{ width: '16px', height: '16px' }}
          />
          <span>No input 1</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
          <input
            type="checkbox"
            checked={fieldProperties.noChange}
            onChange={(e) => setFieldProperties({...fieldProperties, noChange: e.target.checked})}
            style={{ width: '16px', height: '16px' }}
          />
          <span>No change 1</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
          <input
            type="checkbox"
            checked={fieldProperties.reKey}
            onChange={(e) => setFieldProperties({...fieldProperties, reKey: e.target.checked})}
            style={{ width: '16px', height: '16px' }}
          />
          <span>Re-key 1</span>
        </label>
      </div>
    </div>
  );

  const renderApiHooks = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '10px' }}>VERSION API Hooks</h3>
      <p style={{ color: '#dc2626', fontSize: '12px', marginBottom: '20px', fontStyle: 'italic' }}>
        ** All API Routines will be invoked before JOURNAL_UPDATE **
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', maxWidth: '800px' }}>
        {[
          { label: 'Check ID 1', value: apiHooks.checkId, onChange: (val) => setApiHooks({...apiHooks, checkId: val}) },
          { label: 'Check Record 1', value: apiHooks.checkRecord, onChange: (val) => setApiHooks({...apiHooks, checkRecord: val}) },
          { label: 'Before Unauth 1', value: apiHooks.beforeUnauth, onChange: (val) => setApiHooks({...apiHooks, beforeUnauth: val}) },
          { label: 'After Unauth 1', value: apiHooks.afterUnauth, onChange: (val) => setApiHooks({...apiHooks, afterUnauth: val}) }
        ].map((item, index) => (
          <div key={index} style={{
            backgroundColor: '#f8fafc',
            padding: '15px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1'
          }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
              {item.label}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={item.value}
                onChange={(e) => item.onChange(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <button style={{
                padding: '8px 12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>+</button>
              <button style={{
                padding: '8px 12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>-</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOtherDetails = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '20px' }}>Other Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Associated Version</label>
          <input
            type="text"
            value={otherDetails.associatedVersion}
            onChange={(e) => setOtherDetails({...otherDetails, associatedVersion: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Next Version</label>
          <select
            value={otherDetails.nextVersion}
            onChange={(e) => setOtherDetails({...otherDetails, nextVersion: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">Select</option>
            <option value="next1">Next Version 1</option>
            <option value="next2">Next Version 2</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Confirm Version</label>
          <select
            value={otherDetails.confirmVersion}
            onChange={(e) => setOtherDetails({...otherDetails, confirmVersion: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">Select</option>
            <option value="confirm1">Confirm Version 1</option>
            <option value="confirm2">Confirm Version 2</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Preview Version</label>
          <select
            value={otherDetails.previewVersion}
            onChange={(e) => setOtherDetails({...otherDetails, previewVersion: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">Select</option>
            <option value="preview1">Preview Version 1</option>
            <option value="preview2">Preview Version 2</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderService = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '20px' }}>Service</h3>
      <div style={{ maxWidth: '600px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
          <input
            type="checkbox"
            checked={service.exposeAsService}
            onChange={(e) => setService({...service, exposeAsService: e.target.checked})}
            style={{ width: '16px', height: '16px' }}
          />
          <span>Expose Version as Service?</span>
        </label>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Service Name</label>
            <input
              type="text"
              value={service.serviceName}
              onChange={(e) => setService({...service, serviceName: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Activity Name</label>
            <input
              type="text"
              value={service.activityName}
              onChange={(e) => setService({...service, activityName: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '20px' }}>Audit</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Record Status</label>
          <input
            type="text"
            value={audit.recordStatus}
            onChange={(e) => setAudit({...audit, recordStatus: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Current No</label>
          <input
            type="text"
            value={audit.currentNo}
            onChange={(e) => setAudit({...audit, currentNo: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Inputter</label>
          <input
            type="text"
            value={audit.inputter}
            onChange={(e) => setAudit({...audit, inputter: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Authorizer</label>
          <input
            type="text"
            value={audit.authorizer}
            onChange={(e) => setAudit({...audit, authorizer: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  );

  const saveVersion = () => {
    const versionData = {
      application,
      version,
      appInput,
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
      createdAt: new Date().toISOString()
    };
    
    console.log('VERSION SAVED:', JSON.stringify(versionData, null, 2));
    alert(`Version ${version} for ${application} saved successfully! Check console.`);
  };

  const tabs = [
    { id: 'field-definitions', label: 'Field Definitions', render: renderFieldDefinitions },
    { id: 'drop-down', label: 'Drop Down', render: renderDropDown },
    { id: 'automatic-defaulting', label: 'Automatic Defaulting', render: renderAutomaticDefaulting },
    { id: 'field-properties-api', label: 'Field Properties and API', render: renderFieldProperties },
    { id: 'version-api-hooks', label: 'VERSION API Hooks', render: renderApiHooks },
    { id: 'other-details', label: 'Other Details', render: renderOtherDetails },
    { id: 'service', label: 'Service', render: renderService },
    { id: 'audit', label: 'Audit', render: renderAudit }
  ];

  if (!application || !version || !coreFields) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#64748b'
      }}>
        <h2>No version data found</h2>
        <button
          onClick={handleBack}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Go Back to Version Designer
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
      }}>
        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#4f46e5',
            border: '1px solid #4f46e5',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Version Designer
        </button>

        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '15px 20px',
          borderRadius: '8px 8px 0 0',
          borderBottom: '1px solid #cbd5e1',
          marginBottom: '0'
        }}>
          <h2 style={{
            margin: 0,
            color: '#334155',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Version Designer / {application},{version}
          </h2>
        </div>

        {/* Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#4f46e5',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '15px 25px',
                  backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? '#1e293b' : '#e0e7ff',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {tabs.find(tab => tab.id === activeTab)?.render()}
          </div>

          {/* Save Button */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #cbd5e1',
            textAlign: 'center'
          }}>
            <button
              onClick={saveVersion}
              style={{
                padding: '14px 40px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Save Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionDesignerWorkspace;