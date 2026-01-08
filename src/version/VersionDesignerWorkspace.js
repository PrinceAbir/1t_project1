// src/components/version/VersionDesignerWorkspace.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ActionButtons from '../components/ActionButtons';
import './VersionDesignerWorkspace.css';

const VersionDesignerWorkspace = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from navigation state
  const { application, version, coreFields, appInput } = location.state || {};

  // States for each tab
  const [activeTab, setActiveTab] = useState('field-definitions');
  const [selectedFields, setSelectedFields] = useState({});
  const [selectedFieldKeys, setSelectedFieldKeys] = useState([]);
  const [isPrintOnly, setIsPrintOnly] = useState(false);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('1');
  const [noOfAuth, setNoOfAuth] = useState('');

  // Multi-select dropdown state
  const [selectedDropdownOptions, setSelectedDropdownOptions] = useState([]);

  // Group management state
  const [groups, setGroups] = useState([]);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');

  // Track which group is being expanded for field addition
  const [expandedGroupForField, setExpandedGroupForField] = useState(null);

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

  // Loading state for commit
  const [isCommitting, setIsCommitting] = useState(false);

  // Available fields for selection
  const availableFields = useMemo(() => {
    if (!coreFields) return [];
    return Object.keys(coreFields).filter(k => !selectedFields[k]);
  }, [coreFields, selectedFields]);

  // Check if selected fields are eligible for grouping (more than 1 selected)
  const canCreateGroup = useMemo(() => {
    return selectedDropdownOptions.length > 1;
  }, [selectedDropdownOptions]);

  // Create a combined list of fields and groups for display
  const fieldDefinitionsList = useMemo(() => {
    const list = [];
    
    // Add groups first
    groups.forEach(group => {
      list.push({
        type: 'group',
        id: group.id,
        data: group
      });
      
      // Add fields within the group
      group.fields.forEach(fieldKey => {
        if (selectedFields[fieldKey]) {
          list.push({
            type: 'field',
            id: fieldKey,
            data: selectedFields[fieldKey],
            groupId: group.id
          });
        }
      });
    });
    
    // Add single fields that are not in any group
    selectedFieldKeys.forEach(key => {
      const isInGroup = groups.some(group => group.fields.includes(key));
      if (!isInGroup) {
        list.push({
          type: 'field',
          id: key,
          data: selectedFields[key]
        });
      }
    });
    
    return list;
  }, [selectedFields, selectedFieldKeys, groups]);

  useEffect(() => {
    if (!application || !version || !coreFields) {
      navigate('/version-designer');
    }
  }, [application, version, coreFields, navigate]);

  const handleBack = () => {
    navigate('/version-designer');
  };

  // Handle commit button click
  const handleCommit = async () => {
    setIsCommitting(true);
    try {
      // Prepare the version data
      const versionData = {
        application,
        version,
        appInput,
        description,
        language,
        noOfAuth,
        isPrintOnly,
        fields: selectedFields,
        groups,
        dropDowns,
        autoDefaults,
        fieldProperties,
        apiHooks,
        otherDetails,
        service,
        audit,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      // Log the data being sent (for debugging)
      console.log('Committing version data:', JSON.stringify(versionData, null, 2));
      
      // Make POST request to the API
      const response = await fetch('http://localhost:5000/api/applications/version', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(versionData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Commit successful:', result);
      
      alert(`Version "${version}" for "${application}" committed successfully!`);
      
    } catch (error) {
      console.error('Error committing version:', error);
      alert(`Failed to commit version: ${error.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  // Handle hold button click
  const handleHold = () => {
    // For now, just show a message
    alert('Hold functionality - This would save the current state as a draft');
    
    // You can implement actual hold/draft saving logic here
    const draftData = {
      application,
      version,
      appInput,
      description,
      language,
      noOfAuth,
      isPrintOnly,
      fields: selectedFields,
      groups,
      dropDowns,
      autoDefaults,
      fieldProperties,
      apiHooks,
      otherDetails,
      service,
      audit,
      savedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    console.log('Hold (Save Draft):', JSON.stringify(draftData, null, 2));
  };

  // Handle validate button click
  const handleValidate = () => {
    const errors = [];
    
    // Validation checks
    if (!description.trim()) {
      errors.push('Description is required');
    }
    
    if (Object.keys(selectedFields).length === 0) {
      errors.push('At least one field must be selected');
    }
    
    // Check if any dropdown fields have dropdown source configured
    const dropdownFields = Object.entries(selectedFields)
      .filter(([_, field]) => field.displayType === 'Dropdown');
    
    dropdownFields.forEach(([key, field]) => {
      if (!field.dropdownSource) {
        errors.push(`Field "${field.label || key}" is set as Dropdown but no dropdown source is selected`);
      }
    });
    
    if (errors.length > 0) {
      alert('Validation Errors:\n\n' + errors.join('\n'));
    } else {
      alert('Validation successful! All required configurations are in place.');
    }
  };

  // Handle multi-select field addition
  const handleAddFields = (keys) => {
    if (!keys || keys.length === 0) return;

    const newFields = {};
    keys.forEach(key => {
      if (!selectedFields[key] && coreFields[key]) {
        const coreField = coreFields[key];
        newFields[key] = {
          ...coreField,
          column: '',
          textMax: coreField.max_length?.toString() || '',
          text: '',
          attribute: '',
          displayType: 'Text',
          dropdownSource: '',
          toolTip: '',
          enrich: false,
          mandatory: coreField.mandatory || false,
          min_length: coreField.min_length,
          max_length: coreField.max_length,
          isInGroup: false
        };
      }
    });

    setSelectedFields(prev => ({ ...prev, ...newFields }));
    setSelectedFieldKeys(prev => [...prev, ...keys.filter(k => !prev.includes(k))]);
  };

  // Handle single field addition
  const addField = (key) => {
    if (!key || selectedFields[key]) return;

    const coreField = coreFields[key];
    const newField = {
      ...coreField,
      column: '',
      textMax: coreField.max_length?.toString() || '',
      text: '',
      attribute: '',
      displayType: 'Text',
      dropdownSource: '',
      toolTip: '',
      enrich: false,
      mandatory: coreField.mandatory || false,
      min_length: coreField.min_length,
      max_length: coreField.max_length,
      isInGroup: false
    };

    setSelectedFields(prev => ({ ...prev, [key]: newField }));
    setSelectedFieldKeys(prev => [...prev, key]);
  };

  // Handle batch field addition from selected dropdown options
  const handleBatchAddFields = () => {
    if (selectedDropdownOptions.length === 0) {
      alert('Please select fields from the dropdown');
      return;
    }

    handleAddFields(selectedDropdownOptions);
    setSelectedDropdownOptions([]);
  };

  // Handle create group from selected fields
  const handleCreateGroup = () => {
    if (selectedDropdownOptions.length < 2) {
      alert('Please select at least 2 fields to create a group');
      return;
    }

    setShowGroupDialog(true);
  };

  // Confirm group creation
  const confirmCreateGroup = () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      fields: [...selectedDropdownOptions],
      createdAt: new Date().toISOString()
    };

    setGroups(prev => [...prev, newGroup]);
    
    // Also add the fields to selected fields if not already added
    handleAddFields(newGroup.fields);
    
    // Clear the dialog and selections
    setGroupName('');
    setShowGroupDialog(false);
    setSelectedDropdownOptions([]);
  };

  // Duplicate a group
  const duplicateGroup = (groupId) => {
    const groupToDuplicate = groups.find(g => g.id === groupId);
    if (!groupToDuplicate) return;

    const newGroup = {
      ...groupToDuplicate,
      id: Date.now().toString(),
      name: `${groupToDuplicate.name} (Copy)`,
      createdAt: new Date().toISOString()
    };

    setGroups(prev => [...prev, newGroup]);
    
    // Add the fields from the duplicated group to selected fields
    const newFieldKeys = [];
    groupToDuplicate.fields.forEach(fieldKey => {
      if (coreFields[fieldKey]) {
        const newFieldKey = `${fieldKey}_copy_${Date.now()}`;
        const field = coreFields[fieldKey];
        const newField = {
          ...field,
          column: '',
          textMax: field.max_length?.toString() || '',
          text: '',
          attribute: '',
          displayType: 'Text',
          dropdownSource: '',
          toolTip: '',
          enrich: false,
          mandatory: field.mandatory || false,
          min_length: field.min_length,
          max_length: field.max_length,
          field_name: newFieldKey,
          label: `${field.label || field.field_name} (Copy)`
        };
        
        setSelectedFields(prev => ({ ...prev, [newFieldKey]: newField }));
        setSelectedFieldKeys(prev => [...prev, newFieldKey]);
        newFieldKeys.push(newFieldKey);
      }
    });
    
    // Update the duplicated group with new field keys
    newGroup.fields = newFieldKeys;
    setGroups(prev => prev.map(g => g.id === newGroup.id ? newGroup : g));
  };

  // Remove a group
  const removeGroup = (groupId) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  // Add a duplicate field to a group
  const addFieldToGroup = (groupId, fieldKey = null) => {
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    
    // If no specific field key provided, use the first field in the group
    const sourceFieldKey = fieldKey || group.fields[0];
    if (!sourceFieldKey || !selectedFields[sourceFieldKey]) return;

    // Create a new unique key for the duplicate field
    const field = selectedFields[sourceFieldKey];
    const newFieldKey = `${sourceFieldKey}_copy_${Date.now()}`;
    
    // Add the new field to selected fields
    const newField = {
      ...field,
      field_name: newFieldKey,
      label: `${field.label || field.field_name} (Copy)`
    };

    setSelectedFields(prev => ({ ...prev, [newFieldKey]: newField }));
    setSelectedFieldKeys(prev => [...prev, newFieldKey]);

    // Add the new field to the group
    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = {
      ...group,
      fields: [...group.fields, newFieldKey]
    };
    setGroups(updatedGroups);
  };

  // Show field selection for a specific group
  const showAddFieldToGroup = (groupId) => {
    setExpandedGroupForField(groupId === expandedGroupForField ? null : groupId);
  };

  const removeField = (key) => {
    setSelectedFields(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setSelectedFieldKeys(prev => prev.filter(k => k !== key));
    
    // Remove field from any groups
    setGroups(prev => prev.map(group => ({
      ...group,
      fields: group.fields.filter(fieldKey => fieldKey !== key)
    })).filter(group => group.fields.length > 0));
  };

  const updateFieldProperty = (key, property, value) => {
    setSelectedFields(prev => {
      const updatedField = { ...prev[key] };
      
      if (property === 'displayType' && value !== 'Dropdown') {
        // Clear dropdown source if changing from Dropdown to another type
        updatedField.dropdownSource = '';
      }
      
      updatedField[property] = value;
      
      return {
        ...prev,
        [key]: updatedField
      };
    });
  };

  // Handle dropdown selection changes
  const handleDropdownOptionToggle = (key) => {
    setSelectedDropdownOptions(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Handle select all available fields
  const handleSelectAllAvailable = () => {
    const allAvailable = availableFields.filter(k => !selectedDropdownOptions.includes(k));
    setSelectedDropdownOptions(prev => [...prev, ...allAvailable]);
  };

  // Handle clear all selected from dropdown
  const handleClearDropdownSelection = () => {
    setSelectedDropdownOptions([]);
  };

  // Get field details for display
  const getFieldDetails = (key) => {
    if (!coreFields || !coreFields[key]) return null;
    return coreFields[key];
  };

  // Render field type badge
  const renderFieldTypeBadge = (type) => {
    const typeColors = {
      'string': 'text-bg-blue',
      'dropdown': 'text-bg-green',
      'date': 'text-bg-purple',
      'number': 'text-bg-orange',
      'boolean': 'text-bg-red'
    };

    const colorClass = typeColors[type] || 'text-bg-gray';
    return (
      <span className={`field-type-badge ${colorClass}`}>
        {type}
      </span>
    );
  };

  // Render a group row
  const renderGroupRow = (group) => (
    <tr key={`group-${group.id}`} className="group-header-row">
      <td colSpan="9" className="group-header-cell">
        <div className="group-header-content">
          <div className="group-title">
            <span className="group-icon">📁</span>
            <span className="group-name">{group.name}</span>
            <span className="group-field-count">
              ({group.fields.length} field{group.fields.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="group-actions">
            <button
              onClick={() => showAddFieldToGroup(group.id)}
              className="btn-secondary btn-small btn-icon"
              title="Add Field to Group"
            >
              <span className="icon">+</span> Add Field
            </button>
            <button
              onClick={() => duplicateGroup(group.id)}
              className="btn-secondary btn-small btn-icon"
              title="Duplicate Group"
            >
              <span className="icon">📋</span> Duplicate
            </button>
            <button
              onClick={() => removeGroup(group.id)}
              className="btn-danger btn-small btn-icon"
              title="Remove Group"
            >
              <span className="icon">×</span> Remove
            </button>
          </div>
        </div>
        
        {/* Field selection for this group */}
        {expandedGroupForField === group.id && (
          <div className="group-add-field-section">
            <div className="group-add-field-controls">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addFieldToGroup(group.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="field-select-dropdown"
                disabled={availableFields.length === 0}
              >
                <option value="" disabled>Select a field to add to group</option>
                {availableFields.map(k => (
                  <option key={k} value={k}>
                    {coreFields[k].label} ({coreFields[k].type})
                  </option>
                ))}
              </select>
              <button
                onClick={() => addFieldToGroup(group.id)}
                className="btn-primary btn-small"
                disabled={group.fields.length === 0}
              >
                <span className="btn-icon">+</span>
                Duplicate Existing Field
              </button>
            </div>
            {availableFields.length === 0 && (
              <div className="group-add-field-hint">
                No more available fields to add
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );

  // Render a field row
  const renderFieldRow = (fieldKey, field, isGrouped = false, groupId = null) => (
    <tr key={fieldKey} className={`field-row ${isGrouped ? 'grouped-field' : ''}`}>
      <td className="field-name-cell">
        <div className="field-name-content">
          {isGrouped && <span className="group-indicator">↳</span>}
          <span className="field-name">{field.field_name}</span>
          {field.mandatory && (
            <span className="required-badge">Required</span>
          )}
          {groupId && (
            <button
              onClick={() => addFieldToGroup(groupId, fieldKey)}
              className="btn-add-similar btn-extra-small"
              title="Duplicate this field in group"
            >
              +
            </button>
          )}
        </div>
      </td>
      <td>
        <input
          type="text"
          value={field.label || ''}
          onChange={(e) => updateFieldProperty(fieldKey, 'label', e.target.value)}
          placeholder="Display label"
          className="table-input"
        />
      </td>
      <td>
        <div className="field-type-cell">
          {renderFieldTypeBadge(field.type)}
        </div>
      </td>
      <td>
        <input
          type="text"
          value={field.column || ''}
          onChange={(e) => updateFieldProperty(fieldKey, 'column', e.target.value)}
          placeholder="Col"
          className="table-input small-input"
        />
      </td>
      <td>
        <input
          type="text"
          value={field.textMax || ''}
          onChange={(e) => updateFieldProperty(fieldKey, 'textMax', e.target.value)}
          placeholder="Max"
          className="table-input small-input"
        />
      </td>
      <td>
        <select
          value={field.displayType || 'Text'}
          onChange={(e) => updateFieldProperty(fieldKey, 'displayType', e.target.value)}
          className="table-select"
        >
          <option value="Text">Text</option>
          <option value="Dropdown">Dropdown</option>
          <option value="Date">Date</option>
          <option value="Number">Number</option>
          <option value="Checkbox">Checkbox</option>
        </select>

        {field.displayType === 'Dropdown' && (
          <select
            value={field.dropdownSource || ''}
            onChange={(e) => updateFieldProperty(fieldKey, 'dropdownSource', e.target.value)}
            className="table-select dropdown-source-select"
            style={{ marginTop: '5px', width: '100%' }}
          >
            <option value="">Select a dropdown...</option>
            <option value="sector">Sector</option>
            <option value="industry">Industry</option>
            <option value="nationality">Nationality</option>
            <option value="customerStatus">Customer Status</option>
            <option value="residence">Residence</option>
            <option value="accountOfficer">Account Officer</option>
            <option value="otherOfficer1">Other Officer 1</option>
          </select>
        )}
      </td>
      <td>
        <input
          type="text"
          value={field.toolTip || ''}
          onChange={(e) => updateFieldProperty(fieldKey, 'toolTip', e.target.value)}
          placeholder="Tooltip text"
          className="table-input"
        />
      </td>
      <td className="enrich-cell">
        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={field.enrich || false}
            onChange={(e) => updateFieldProperty(fieldKey, 'enrich', e.target.checked)}
            className="checkbox-input"
          />
          <span className="checkbox-label">Enrich</span>
        </label>
      </td>
      <td className="actions-cell">
        <button
          onClick={() => removeField(fieldKey)}
          className="btn-danger btn-small"
          title="Remove field"
        >
          Remove
        </button>
      </td>
    </tr>
  );

  const renderFieldDefinitions = () => (
    <div className="tab-content">
      {/* Print Only */}
      <div className="section">
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPrintOnly}
              onChange={(e) => setIsPrintOnly(e.target.checked)}
            />
            <span className="checkbox-text">Print Only</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="section">
        <h3 className="section-title">Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          placeholder="Enter version description..."
          className="description-textarea"
        />
      </div>

      {/* Language and No. of Auth */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Language 1</label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="form-input small-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">No. of Auth</label>
          <input
            type="text"
            value={noOfAuth}
            onChange={(e) => setNoOfAuth(e.target.value)}
            placeholder="Enter number"
            className="form-input small-input"
          />
        </div>
      </div>

      {/* Field Selection Section */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Select Fields</h3>
          <div className="field-selection-stats">
            <span className="stat-item">
              Available: <strong>{availableFields.length}</strong>
            </span>
            <span className="stat-item">
              Selected: <strong>{Object.keys(selectedFields).length}</strong>
            </span>
            <span className="stat-item">
              Groups: <strong>{groups.length}</strong>
            </span>
          </div>
        </div>

        {/* Multi-Select Dropdown */}
        <div className="multi-select-container">
          <div className="multi-select-header">
            <div className="multi-select-title">
              <span className="select-icon">📋</span>
              <span>Select Multiple Fields</span>
            </div>
            <div className="multi-select-actions">
              <button
                onClick={handleSelectAllAvailable}
                className="btn-secondary btn-small"
                disabled={availableFields.length === 0}
              >
                Select All
              </button>
              <button
                onClick={handleClearDropdownSelection}
                className="btn-secondary btn-small"
                disabled={selectedDropdownOptions.length === 0}
              >
                Clear
              </button>
              {canCreateGroup && (
                <button
                  onClick={handleCreateGroup}
                  className="btn-primary btn-small"
                >
                  <span className="btn-icon">📁</span>
                  Create Group
                </button>
              )}
            </div>
          </div>

          <div className="multi-select-dropdown">
            <div className="dropdown-list">
              {availableFields.length === 0 ? (
                <div className="empty-dropdown-state">
                  <span className="empty-icon">✅</span>
                  <p>All fields have been added</p>
                </div>
              ) : (
                availableFields.map(key => {
                  const field = getFieldDetails(key);
                  if (!field) return null;

                  return (
                    <div
                      key={key}
                      className={`dropdown-option ${selectedDropdownOptions.includes(key) ? 'selected' : ''}`}
                      onClick={() => handleDropdownOptionToggle(key)}
                    >
                      <div className="option-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedDropdownOptions.includes(key)}
                          onChange={() => handleDropdownOptionToggle(key)}
                          className="checkbox-input"
                        />
                      </div>
                      <div className="option-content">
                        <div className="option-header">
                          <span className="option-name">{field.label || field.field_name}</span>
                          {renderFieldTypeBadge(field.type)}
                        </div>
                        <div className="option-details">
                          <span className="option-id">{field.field_name}</span>
                          {field.mandatory && (
                            <span className="option-mandatory">Required</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="multi-select-footer">
            <div className="selection-summary">
              <span className="summary-text">
                {selectedDropdownOptions.length} field{selectedDropdownOptions.length !== 1 ? 's' : ''} selected
              </span>
              {canCreateGroup && (
                <span className="summary-hint">
                  ✓ You can create a group with these fields
                </span>
              )}
            </div>
            <div className="footer-buttons">
              <button
                onClick={handleBatchAddFields}
                className="btn-primary"
                disabled={selectedDropdownOptions.length === 0}
              >
                <span className="btn-icon">+</span>
                Add Selected Fields
              </button>
            </div>
          </div>
        </div>

        {/* Quick Add Field */}
        <div className="quick-add-section">
          <h4 className="quick-add-title">Quick Add Single Field</h4>
          <div className="quick-add-controls">
            <select
              onChange={(e) => e.target.value && addField(e.target.value)}
              defaultValue=""
              className="field-select-dropdown"
              disabled={availableFields.length === 0}
            >
              <option value="" disabled>Select a field to add</option>
              {availableFields.map(k => (
                <option key={k} value={k}>
                  {coreFields[k].label} ({coreFields[k].type})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const select = document.querySelector('.field-select-dropdown');
                if (select.value) addField(select.value);
              }}
              className="btn-secondary"
              disabled={availableFields.length === 0}
            >
              Add Field
            </button>
          </div>
        </div>

        {/* Field Definitions Table */}
        <div className="field-definitions-section">
          <div className="section-header">
            <h3 className="section-title">Field Definitions</h3>
            <div className="field-count-badge">
              {Object.keys(selectedFields).length} fields
            </div>
          </div>

          {fieldDefinitionsList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h4>No Fields Added Yet</h4>
              <p>Use the multi-select dropdown or quick add above to add fields to your version.</p>
            </div>
          ) : (
            <div className="fields-table-container">
              <table className="fields-table">
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Label</th>
                    <th>Type</th>
                    <th>Col.</th>
                    <th>TextMax.</th>
                    <th>Display Type</th>
                    <th>Tool Tip</th>
                    <th>Enrich</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldDefinitionsList.map(item => {
                    if (item.type === 'group') {
                      return renderGroupRow(item.data);
                    } else {
                      return renderFieldRow(item.id, item.data, !!item.groupId, item.groupId);
                    }
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Group Creation Dialog */}
      {showGroupDialog && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Create Field Group</h3>
              <button
                onClick={() => {
                  setShowGroupDialog(false);
                  setGroupName('');
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="form-input"
                  autoFocus
                />
                <p className="form-hint">
                  This will create a group with {selectedDropdownOptions.length} selected fields
                </p>
              </div>
              
              <div className="selected-fields-preview">
                <h4 className="preview-title">Selected Fields</h4>
                <div className="preview-list">
                  {selectedDropdownOptions.map(key => {
                    const field = getFieldDetails(key);
                    return field ? (
                      <div key={key} className="preview-field">
                        <span className="preview-field-name">{field.label || field.field_name}</span>
                        <span className="preview-field-type">{field.type}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowGroupDialog(false);
                  setGroupName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateGroup}
                className="btn-primary"
                disabled={!groupName.trim()}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ... [All other tab render functions remain exactly the same as in your original code] ...

  const renderDropDown = () => (
    <div className="tab-content">
      <div className="section">
        <h3 className="section-title">Drop Down Configurations</h3>
        <p className="section-description">
          Configure dropdown fields for this version. Each row defines a dropdown field, its source, and selection criteria.
        </p>

        <div className="table-controls">
          <button
            onClick={() => setDropDowns([...dropDowns, { fieldName: '', dropDown: '', selection: '' }])}
            className="btn-primary"
          >
            <span className="btn-icon">+</span>
            Add Dropdown Configuration
          </button>
        </div>

        {dropDowns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h4>No Dropdown Configurations</h4>
            <p>Add dropdown configurations to define custom dropdown fields for this version.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Field Name</th>
                  <th>Drop Down Source</th>
                  <th>Selection Criteria</th>
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
                        onChange={(e) => {
                          const updated = [...dropDowns];
                          updated[index].fieldName = e.target.value;
                          setDropDowns(updated);
                        }}
                        placeholder="Field name"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.dropDown}
                        onChange={(e) => {
                          const updated = [...dropDowns];
                          updated[index].dropDown = e.target.value;
                          setDropDowns(updated);
                        }}
                        placeholder="Dropdown source"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.selection}
                        onChange={(e) => {
                          const updated = [...dropDowns];
                          updated[index].selection = e.target.value;
                          setDropDowns(updated);
                        }}
                        placeholder="Selection criteria"
                        className="table-input"
                      />
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => setDropDowns(dropDowns.filter((_, i) => i !== index))}
                        className="btn-danger btn-small"
                        title="Remove configuration"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderAutomaticDefaulting = () => (
    <div className="tab-content">
      <div className="section">
        <h3 className="section-title">Automatic Defaulting</h3>
        <p className="section-description">
          Configure automatic field defaults. When a field matches the "Replaces" value, it will be auto-filled with the "Default Value".
        </p>

        <div className="table-controls">
          <button
            onClick={() => setAutoDefaults([...autoDefaults, { fieldToDefault: '', defaultValue: '', replaces: '' }])}
            className="btn-primary"
          >
            <span className="btn-icon">+</span>
            Add Default Rule
          </button>
        </div>

        {autoDefaults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚡</div>
            <h4>No Default Rules</h4>
            <p>Add rules to automatically populate fields with default values.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Field to Default</th>
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
                        onChange={(e) => {
                          const updated = [...autoDefaults];
                          updated[index].fieldToDefault = e.target.value;
                          setAutoDefaults(updated);
                        }}
                        placeholder="Field to default"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.defaultValue}
                        onChange={(e) => {
                          const updated = [...autoDefaults];
                          updated[index].defaultValue = e.target.value;
                          setAutoDefaults(updated);
                        }}
                        placeholder="Default value"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.replaces}
                        onChange={(e) => {
                          const updated = [...autoDefaults];
                          updated[index].replaces = e.target.value;
                          setAutoDefaults(updated);
                        }}
                        placeholder="Value to replace"
                        className="table-input"
                      />
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => setAutoDefaults(autoDefaults.filter((_, i) => i !== index))}
                        className="btn-danger btn-small"
                        title="Remove rule"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderFieldProperties = () => (
    <div className="tab-content">
      <div className="section">
        <h3 className="section-title">Field Properties</h3>
        <p className="section-description">
          Configure global field properties that apply to all fields in this version.
        </p>

        <div className="field-properties-grid">
          <label className="property-checkbox">
            <input
              type="checkbox"
              checked={fieldProperties.rightAdjust}
              onChange={(e) => setFieldProperties({ ...fieldProperties, rightAdjust: e.target.checked })}
              className="checkbox-input"
            />
            <div className="property-content">
              <span className="property-label">Right Adjust</span>
              <span className="property-description">Align text to the right</span>
            </div>
          </label>

          <label className="property-checkbox">
            <input
              type="checkbox"
              checked={fieldProperties.noInput}
              onChange={(e) => setFieldProperties({ ...fieldProperties, noInput: e.target.checked })}
              className="checkbox-input"
            />
            <div className="property-content">
              <span className="property-label">No Input</span>
              <span className="property-description">Field cannot receive input</span>
            </div>
          </label>

          <label className="property-checkbox">
            <input
              type="checkbox"
              checked={fieldProperties.noChange}
              onChange={(e) => setFieldProperties({ ...fieldProperties, noChange: e.target.checked })}
              className="checkbox-input"
            />
            <div className="property-content">
              <span className="property-label">No Change</span>
              <span className="property-description">Field value cannot be changed</span>
            </div>
          </label>

          <label className="property-checkbox">
            <input
              type="checkbox"
              checked={fieldProperties.reKey}
              onChange={(e) => setFieldProperties({ ...fieldProperties, reKey: e.target.checked })}
              className="checkbox-input"
            />
            <div className="property-content">
              <span className="property-label">Re-key Required</span>
              <span className="property-description">Requires re-entry for confirmation</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderApiHooks = () => (
    <div className="tab-content">
      <div className="section">
        <h3 className="section-title">VERSION API Hooks</h3>
        <p className="api-note">
          <span className="api-note-icon">⚠️</span>
          <strong>Note:</strong> All API Routines will be invoked before JOURNAL_UPDATE
        </p>

        <div className="api-hooks-grid">
          <div className="api-hook">
            <div className="api-hook-header">
              <label className="api-hook-label">Check ID</label>
              <div className="api-hook-actions">
                <button className="btn-icon" onClick={() => setApiHooks({ ...apiHooks, checkId: apiHooks.checkId + '1' })}>
                  <span className="icon-plus">+</span>
                </button>
                <button className="btn-icon" onClick={() => setApiHooks({ ...apiHooks, checkId: '' })}>
                  <span className="icon-minus">-</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={apiHooks.checkId}
              onChange={(e) => setApiHooks({ ...apiHooks, checkId: e.target.value })}
              placeholder="Check ID routine"
              className="api-hook-input"
            />
          </div>

          <div className="api-hook">
            <div className="api-hook-header">
              <label className="api-hook-label">Check Record</label>
              <div className="api-hook-actions">
                <button className="btn-icon" onClick={() => setApiHooks({ ...apiHooks, checkRecord: apiHooks.checkRecord + '1' })}>
                  <span className="icon-plus">+</span>
                </button>
                <button className="btn-icon" onClick={() => setApiHooks({ ...apiHooks, checkRecord: '' })}>
                  <span className="icon-minus">-</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={apiHooks.checkRecord}
              onChange={(e) => setApiHooks({ ...apiHooks, checkRecord: e.target.value })}
              placeholder="Check Record routine"
              className="api-hook-input"
            />
          </div>

          <div className="api-hook">
            <div className="api-hook-header">
              <label className="api-hook-label">Before Unauth</label>
              <div className="api-hook-actions">
                <button className="btn-icon" onClick={() => setApiHooks({ ...apiHooks, beforeUnauth: apiHooks.beforeUnauth + '1' })}>
                  <span className="icon-plus">+</span>
                </button>
                <button className="btn-icon" onClick={() => setApiHooks({ ...apiHooks, beforeUnauth: '' })}>
                  <span className="icon-minus">-</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={apiHooks.beforeUnauth}
              onChange={(e) => setApiHooks({ ...apiHooks, beforeUnauth: e.target.value })}
              placeholder="Before Unauth routine"
              className="api-hook-input"
            />
          </div>

          <div className="api-hook">
            <div className="api-hook-header">
              <label className="api-hook-label">After Unauth</label>
              <div className="api-hook-actions">
                <button className="btn-icon" onClick={() => setApiHooks({ ...apiHooks, afterUnauth: apiHooks.afterUnauth + '1' })}>
                  <span className="icon-plus">+</span>
                </button>
                <button className="btn-icon" onClick={() => setApiHooks({ ...apiHooks, afterUnauth: '' })}>
                  <span className="icon-minus">-</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={apiHooks.afterUnauth}
              onChange={(e) => setApiHooks({ ...apiHooks, afterUnauth: e.target.value })}
              placeholder="After Unauth routine"
              className="api-hook-input"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOtherDetails = () => (
    <div className="tab-content">
      <div className="section">
        <h3 className="section-title">Other Details</h3>
        <p className="section-description">
          Configure version relationships and navigation settings.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Associated Version</label>
            <input
              type="text"
              value={otherDetails.associatedVersion}
              onChange={(e) => setOtherDetails({ ...otherDetails, associatedVersion: e.target.value })}
              placeholder="Associated version name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Next Version</label>
            <select
              value={otherDetails.nextVersion}
              onChange={(e) => setOtherDetails({ ...otherDetails, nextVersion: e.target.value })}
              className="form-select"
            >
              <option value="">Select next version</option>
              <option value="next1">Next Version 1</option>
              <option value="next2">Next Version 2</option>
              <option value="next3">Next Version 3</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Version</label>
            <select
              value={otherDetails.confirmVersion}
              onChange={(e) => setOtherDetails({ ...otherDetails, confirmVersion: e.target.value })}
              className="form-select"
            >
              <option value="">Select confirm version</option>
              <option value="confirm1">Confirm Version 1</option>
              <option value="confirm2">Confirm Version 2</option>
              <option value="confirm3">Confirm Version 3</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Preview Version</label>
            <select
              value={otherDetails.previewVersion}
              onChange={(e) => setOtherDetails({ ...otherDetails, previewVersion: e.target.value })}
              className="form-select"
            >
              <option value="">Select preview version</option>
              <option value="preview1">Preview Version 1</option>
              <option value="preview2">Preview Version 2</option>
              <option value="preview3">Preview Version 3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderService = () => (
    <div className="tab-content">
      <div className="section">
        <h3 className="section-title">Service Configuration</h3>
        <p className="section-description">
          Configure service exposure settings for this version.
        </p>

        <div className="service-configuration">
          <label className="service-checkbox">
            <input
              type="checkbox"
              checked={service.exposeAsService}
              onChange={(e) => setService({ ...service, exposeAsService: e.target.checked })}
              className="checkbox-input"
            />
            <div className="service-content">
              <span className="service-label">Expose Version as Service?</span>
              <span className="service-description">
                Make this version available as a web service endpoint
              </span>
            </div>
          </label>

          {service.exposeAsService && (
            <div className="service-fields">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input
                    type="text"
                    value={service.serviceName}
                    onChange={(e) => setService({ ...service, serviceName: e.target.value })}
                    placeholder="Service name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Activity Name</label>
                  <input
                    type="text"
                    value={service.activityName}
                    onChange={(e) => setService({ ...service, activityName: e.target.value })}
                    placeholder="Activity name"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="tab-content">
      <div className="section">
        <h3 className="section-title">Audit Information</h3>
        <p className="section-description">
          Configure audit trail settings for this version.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Record Status</label>
            <input
              type="text"
              value={audit.recordStatus}
              onChange={(e) => setAudit({ ...audit, recordStatus: e.target.value })}
              placeholder="Record status"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current No</label>
            <input
              type="text"
              value={audit.currentNo}
              onChange={(e) => setAudit({ ...audit, currentNo: e.target.value })}
              placeholder="Current number"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Inputter</label>
            <input
              type="text"
              value={audit.inputter}
              onChange={(e) => setAudit({ ...audit, inputter: e.target.value })}
              placeholder="Inputter ID"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Authorizer</label>
            <input
              type="text"
              value={audit.authorizer}
              onChange={(e) => setAudit({ ...audit, authorizer: e.target.value })}
              placeholder="Authorizer ID"
              className="form-input"
            />
          </div>
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
      groups,
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
    alert(`Version "${version}" for "${application}" saved successfully! Check console.`);
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
      <div className="error-state">
        <div className="error-content">
          <h2 className="error-title">No Version Data Found</h2>
          <p className="error-description">
            The version designer requires application data to function properly.
          </p>
          <button
            onClick={handleBack}
            className="btn-primary"
          >
            ← Back to Version Designer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="version-designer-workspace">
      {/* Back Button */}
      <div className="back-button-container">
        <button
          onClick={handleBack}
          className="back-button"
        >
          ← Back to Version Designer
        </button>
      </div>

      {/* Header */}
      <div className="workspace-header">
        <div className="header-content">
          {/* Action Buttons - Placed ABOVE the version title */}
          <div className="action-buttons-container">
            <ActionButtons
              onBack={handleBack}
              onHold={handleHold}
              onValidate={handleValidate}
              onCommit={handleCommit}
              disabled={isCommitting}
            />
          </div>
          
          <h2 className="workspace-title">
            Version Designer / {application},{version}
          </h2>
          
          <div className="version-info">
            <span className="info-item">
              <span className="info-label">Fields:</span>
              <span className="info-value">{Object.keys(selectedFields).length} selected</span>
            </span>
            <span className="info-item">
              <span className="info-label">Available:</span>
              <span className="info-value">{availableFields.length} remaining</span>
            </span>
            <span className="info-item">
              <span className="info-label">Groups:</span>
              <span className="info-value">{groups.length} created</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="workspace-container">
        <div className="tabs-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content-wrapper">
          {tabs.find(tab => tab.id === activeTab)?.render()}
        </div>

        {/* Save Button */}
        <div className="save-section">
          <button
            onClick={saveVersion}
            className="save-button"
            disabled={isCommitting}
          >
            <span className="save-icon">💾</span>
            Save Version Configuration
          </button>
          <p className="save-note">
            Save all configurations for version: {application},{version}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VersionDesignerWorkspace;