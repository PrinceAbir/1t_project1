import React, { useEffect, useMemo, useState } from 'react';
import FieldRenderer from './FieldRenderer';
import ActionButtons from './ActionButtons';
import DataTransformer from '../services/DataTransformer';
import ValidationService from '../services/ValidationService';
import customerMetaData from '../metadata/customerMetaData';

const normalizeCustomerMetadata = (meta) => {
  if (!meta) return { ...meta, fields: [] };
  const rawFields = meta.fields || [];

  // If fields already an array, return as-is
  if (Array.isArray(rawFields)) return { ...meta, fields: rawFields };

  // Convert object map -> array and normalize props to expected shape
  const arr = Object.keys(rawFields).map((k) => {
    const f = rawFields[k] || {};
    return {
      name: f.field_name || k.replace(/\./g, '_'),
      label: f.label || k,
      type: f.type || 'string',
      multi: !!f.multivalued,
      required: !!f.mandatory,
      min: f.min_length,
      max: f.max_length,
      options: f.options || f.select_options || [],
      pattern: f.pattern,
      accept: f.accept,
      defaultValue: f.defaultValue,
    };
  });

  return { ...meta, fields: arr };
};

const CustomerPage = () => {
  const [formState, setFormState] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const normalizedMeta = useMemo(() => normalizeCustomerMetadata(customerMetaData), []);

  // Convert to T24 style fields using DataTransformer helper
  const t24Fields = useMemo(() => DataTransformer.metadataToT24Fields(normalizedMeta), [normalizedMeta]);

  useEffect(() => {
    const initial = {};
    t24Fields.forEach((f) => {
      initial[f.id] = f.value;
    });
    setFormState(initial);
    setIsLoading(false);
  }, [t24Fields]);

  const handleFieldChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleValidate = () => {
    const fieldConfigs = t24Fields.map((f) => ({
      name: f.id,
      label: f.label,
      type: f.type === 'number' || f.type === 'amount' ? 'number' : 'string',
      required: f.metadata.required,
      multi: f.metadata.multi,
      min: f.metadata.min,
      max: f.metadata.max,
      pattern: f.pattern,
    }));

    const { errors, isValid } = ValidationService.validateAllFields(fieldConfigs, formState);
    setValidationErrors(errors);

    if (isValid) {
      alert('Customer form validation successful');
    } else {
      alert('Please fix validation errors in the form');
    }

    return isValid;
  };

  const handleCommit = () => {
    if (!handleValidate()) return;
    const submission = DataTransformer.toT24Submission(formState, { fields: t24Fields });
    console.log('Customer submission:', submission);
    alert('Customer record committed (see console)');
  };

  const handleBack = () => setFormState({});
  const handleDelete = () => {
    if (window.confirm('Delete customer record?')) {
      setFormState({});
      setValidationErrors({});
      alert('Customer deleted');
    }
  };

  if (isLoading) return <div className="loading">Loading customer form...</div>;

  return (
    <div className="customer-page">
      <div className="page-header">
        <h2>Customer Management</h2>
        <div className="page-actions">
          <ActionButtons
            onBack={handleBack}
            onHold={() => alert('Hold')}
            onValidate={handleValidate}
            onCommit={handleCommit}
            onAuthorize={() => alert('Authorize')}
            onDelete={handleDelete}
            onCopy={() => alert('Copy')}
          />
        </div>
      </div>

      <div className="t24-form-grid">
        {t24Fields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={{ ...field, name: field.id, type: field.type }}
            value={formState[field.id]}
            onChange={handleFieldChange}
            error={validationErrors[field.id]}
            tabId={"CUSTOMER"}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomerPage;
