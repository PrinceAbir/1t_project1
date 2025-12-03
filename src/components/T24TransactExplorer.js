import React, { useState, useEffect } from 'react';
import ActionButtons from './ActionButtons';
import TabButton from './TabButton';
import FieldRenderer from './FieldRenderer';
import ValidationService from '../services/ValidationService';
import DataTransformer from '../services/DataTransformer';
import ErrorToast from "../components/ErrorToast";   // ⬅️ NEW
import formData from '../metadata/formData';
import '../App';

const T24TransactExplorer = () => {
  const [activeTab, setActiveTab] = useState('FUNDS.TRANSFER');
  const [formState, setFormState] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // NEW — for Toast Notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastButton, setToastButton] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (message, buttonText = null, buttonAction = null) => {
    setToastMessage(message);
    setToastButton(buttonText ? { text: buttonText, action: buttonAction } : null);
    setShowToast(true);
  };

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
          metadata: { required: true, readOnly: true, fieldType: 'DISPLAY' }
        },
        {
          id: 'auditTimestamp',
          label: 'Timestamp',
          value: new Date().toLocaleString(),
          type: 'display',
          metadata: { required: false, fieldType: 'DISPLAY' }
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
          metadata: { required: false, maxLength: 200, fieldType: 'TEXTAREA' }
        }
      ]
    }
  };

  // Initialize form
  useEffect(() => {
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
  }, []);

  // Field change
  const handleFieldChange = (fieldName, value) => {
    setFormState(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [fieldName]: value
      }
    }));

    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Validation
const handleValidate = () => {
  const currentTabData = t24FormData[activeTab];
  const currentFormData = formState[activeTab];

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
    triggerToast(`${activeTab} validation successful!`);
    return true;
  }

  // 🔥 Build readable error list for toast
  const errorList = Object.keys(errors)
    .filter(key => errors[key])
    .map(key => `• ${key}: ${errors[key]}`)
    .join("\n");

  triggerToast(
    `${Object.keys(errors).length} fields have errors:\n${errorList}`,
    "View Errors",
    () => console.log("Jump to first error field")
  );

  return false;
};

  // Commit
  const handleCommit = () => {
    if (handleValidate()) {
      const t24Submission = DataTransformer.toT24Submission(
        formState[activeTab],
        { fields: t24FormData[activeTab].fields }
      );

      console.log("Committing to T24:", t24Submission);
      triggerToast(`${activeTab} committed successfully!`);
    }
  };

  // Delete
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setFormState(prev => ({
        ...prev,
        [activeTab]: {}
      }));
      setValidationErrors({});

      triggerToast("Transaction deleted");
    }
  };

  if (isLoading)
    return <div className="loading">Loading T24 Transact Explorer...</div>;

  const currentTabData = t24FormData[activeTab];
  const currentFormData = formState[activeTab];

  return (
    <div className="t24-transact-explorer">

      {/* NEW Toast */}
      {showToast && (
        <ErrorToast
          message={toastMessage}
          buttonText={toastButton?.text}
          onButtonClick={toastButton?.action}
          onClose={() => setShowToast(false)}
        />
      )}

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

<<<<<<< HEAD
      {/* Tabs */}
=======
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

      {/* Tab Navigation */}
>>>>>>> origin/main
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

      {/* Main */}
      <div className="t24-main-content">
        <div className="t24-form-title">{currentTabData.title}</div>

<<<<<<< HEAD
=======
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

        {/* Form Fields */}
>>>>>>> origin/main
        <div className="t24-form-container">
          <div className="t24-form-grid">
            {currentTabData.fields.map(field => (
              <FieldRenderer
                key={field.id}
                field={{ ...field, name: field.id, type: field.type }}
                value={currentFormData[field.id]}
                onChange={handleFieldChange}
                error={validationErrors[field.id]}
                tabId={activeTab}
              />
            ))}
          </div>
        </div>

<<<<<<< HEAD
        <div className="t24-action-section">
          <ActionButtons
            onBack={() => console.log("Back")}
            onHold={() => console.log("Held")}
            onValidate={handleValidate}
            onCommit={handleCommit}
            onAuthorize={() => console.log("Authorize")}
            onDelete={handleDelete}
            onCopy={() => console.log("Copy")}
            disabled={!currentTabData}
          />
        </div>

        <div className="t24-footer">
          <div className="footer-left">
            <span>Tab: {activeTab}</span>
            <span>Fields: {currentTabData.fields.length}</span>
            <span>Form: {formData.form_name}</span>
          </div>

          <div className="footer-right">
            <span className={`tab-status ${tabErrors[activeTab] ? "error" : "valid"}`}>
              {tabErrors[activeTab] ? "Validation Errors" : "Ready"}
            </span>
          </div>
        </div>
=======
       

    
>>>>>>> origin/main
      </div>
    </div>
  );
};

export default T24TransactExplorer;
