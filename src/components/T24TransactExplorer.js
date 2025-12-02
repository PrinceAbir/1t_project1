// T24TransactExplorer.js
import React, { useState, useEffect } from 'react';
import ActionButtons from './ActionButtons';
import TabButton from './TabButton';
import FieldRenderer from './FieldRenderer';
import ValidationService from '../services/ValidationService';
import DataTransformer from '../services/DataTransformer';
import formData from '../metadata/formData';
import '../App';

const T24TransactExplorer = () => {
  const [activeTab, setActiveTab] = useState('FUNDS.TRANSFER');
  const [formState, setFormState] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Transform metadata to T24 format
  const t24FormData = {
    'FUNDS.TRANSFER': {
      title: 'FUNDS.TRANSFER / FT/25105/ZGG16',
      fields: DataTransformer.metadataToT24Fields(formData)
    },
    'Audit': {
      title: 'Audit Information',
      fields: [
        {
          id: 'auditId',
          label: 'Audit ID',
          value: 'AUD' + Date.now(),
          type: 'display',
          metadata: {
            required: true,
            readOnly: true,
            fieldType: 'DISPLAY'
          }
        },
        {
          id: 'auditTimestamp',
          label: 'Timestamp',
          value: new Date().toLocaleString(),
          type: 'display',
          metadata: {
            required: false,
            fieldType: 'DISPLAY'
          }
        }
      ]
    },
    'Reserved': {
      title: 'Reserved Fields',
      fields: [
        {
          id: 'comments',
          label: 'Comments',
          value: '',
          type: 'textarea',
          metadata: {
            required: false,
            maxLength: 200,
            fieldType: 'TEXTAREA'
          }
        }
      ]
    }
  };

  // Initialize form state
  useEffect(() => {
    const initializeForm = () => {
      const initialState = {};
      const errors = {};

      Object.keys(t24FormData).forEach(tab => {
        initialState[tab] = {};
        errors[tab] = {};

        t24FormData[tab].fields.forEach(field => {
          initialState[tab][field.id] = field.value;
          errors[tab][field.id] = '';
        });
      });

      setFormState(initialState);
      setIsLoading(false);
    };

    initializeForm();
  }, []);

  // Handle field value change
  const handleFieldChange = (fieldName, value) => {
    setFormState(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [fieldName]: value
      }
    }));

    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  // T24 Action Handlers
  const handleBack = () => {
    console.log('Back to previous screen');
  };

  const handleHold = () => {
    console.log('Transaction held');
  };

  const handleValidate = () => {
    const currentTabData = t24FormData[activeTab];
    const currentFormData = formState[activeTab] || {};
    
    const { errors, isValid } = ValidationService.validateAllFields(
      currentTabData.fields.map(f => ({
        name: f.id,
        label: f.label,
        type: f.type === 'number' ? 'number' : 'string',
        required: f.metadata.required,
        multi: f.metadata.multi,
        min: f.metadata.min,
        max: f.metadata.max,
        options: f.metadata.options,
        max_multifield: f.metadata.max_multifield
      })),
      currentFormData
    );

    setValidationErrors(errors);
    setTabErrors(prev => ({ ...prev, [activeTab]: !isValid }));

    if (isValid) {
      alert(`${activeTab} validation successful!`);
    } else {
      alert('Please fix validation errors');
    }

    return isValid;
  };

  const handleCommit = () => {
    if (handleValidate()) {
      const t24Submission = DataTransformer.toT24Submission(
        formState[activeTab],
        { fields: t24FormData[activeTab].fields }
      );
      console.log('Committing to T24:', t24Submission);
      alert(`${activeTab} committed successfully!`);
    }
  };

  const handleAuthorize = () => {
    console.log('Authorizing transaction');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setFormState(prev => ({
        ...prev,
        [activeTab]: {}
      }));
      setValidationErrors({});
      alert('Transaction deleted');
    }
  };

  const handleCopy = () => {
    console.log('Copying transaction');
  };

  if (isLoading) {
    return <div className="loading">Loading T24 Transact Explorer...</div>;
  }

  const currentTabData = t24FormData[activeTab];
  const currentFormData = formState[activeTab] || {};

  return (
    <div className="t24-transact-explorer">
      {/* Header */}
      <div className="t24-header">
        <div className="header-info">
          <span className="date-time">02/12/2025, 12:37</span>
          <span className="t24-title">Transact Explorer - Model Bank</span>
        </div>
        <div className="t24-status">
          <span className="status-indicator">Online</span>
          <span className="session-id">Session: T24-001</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="t24-tab-navigation">
        {['FUNDS.TRANSFER', 'Audit', 'Reserved'].map(tab => (
          <TabButton
            key={tab}
            label={tab}
            isActive={activeTab === tab}
            hasError={tabErrors[tab]}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="t24-main-content">
        {/* Form Title */}
        <div className="t24-form-title">
          {currentTabData.title}
        </div>

        {/* Form Fields */}
        <div className="t24-form-container">
          <div className="t24-form-grid">
            {currentTabData.fields.map(field => (
              <FieldRenderer
                key={field.id}
                field={{
                  ...field,
                  name: field.id,
                  type: field.type
                }}
                value={currentFormData[field.id] || (field.metadata.multi ? [''] : '')}
                onChange={handleFieldChange}
                error={validationErrors[field.id]}
                tabId={activeTab}
              />
            ))}
          </div>
        </div>

        {/* T24 Action Buttons */}
        <div className="t24-action-section">
          <ActionButtons
            onBack={handleBack}
            onHold={handleHold}
            onValidate={handleValidate}
            onCommit={handleCommit}
            onAuthorize={handleAuthorize}
            onDelete={handleDelete}
            onCopy={handleCopy}
            disabled={!currentTabData}
          />
        </div>

        {/* Footer Status Bar */}
        <div className="t24-footer">
          <div className="footer-left">
            <span>Tab: {activeTab}</span>
            <span>Fields: {currentTabData.fields.length}</span>
            <span>Form: {formData.form_name}</span>
          </div>
          <div className="footer-right">
            <span className={`tab-status ${tabErrors[activeTab] ? 'error' : 'valid'}`}>
              {tabErrors[activeTab] ? 'Validation Errors' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default T24TransactExplorer;