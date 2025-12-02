// components/FieldRenderer.js
import React, { useState, useEffect } from 'react';

const FieldRenderer = ({ field, value, onChange, error, tabId }) => {
  const {
    name,
    label,
    type,
    required,
    multi,
    options,
    min,
    max,
    inputable,
    dropdown,
    dropdownType,
    dropdownName,
    max_multifield,
    hotfield,
    decimals,
    pattern,
    readOnly,
    accept,
    defaultValue
  } = field;

  const [dropdownOptions, setDropdownOptions] = useState(options || []);
  const [isHotfield, setIsHotfield] = useState(hotfield || false);
  const [displayValue, setDisplayValue] = useState(value || defaultValue || '');

  // Load dynamic dropdown options
  useEffect(() => {
    if (dropdown && dropdownType === 'dynamic' && dropdownName) {
      loadDynamicOptions(dropdownName);
    }
  }, [dropdown, dropdownType, dropdownName]);

  // Simulate loading dynamic dropdown data
  const loadDynamicOptions = (source) => {
    // In a real application, this would fetch from an API or data source
    // For now, we'll simulate with predefined data based on dropdownName
    const dynamicData = {
      'ACCOUNT': ['Checking', 'Savings', 'Business', 'Money Market'],
      'CURRENCY': ['USD', 'EUR', 'GBP', 'JPY', 'CAD'],
      'COUNTRY': ['United States', 'United Kingdom', 'Canada', 'Australia'],
      'DEPARTMENT': ['HR', 'Finance', 'IT', 'Marketing', 'Operations'],
      'STATUS': ['Active', 'Inactive', 'Pending', 'Closed']
    };
    
    setDropdownOptions(dynamicData[source] || []);
  };

  // Determine T24 field type based on metadata
  const getT24FieldType = () => {
    if (dropdown) return 'select';
    if (type === 'file') return 'file';
    if (type === 'date') return 'date';
    if (type === 'textarea') return 'textarea';
    if (type === 'amount' || type === 'number') return 'number';
    if (type === 'email') return 'email';
    if (type === 'tel') return 'tel';
    if (type === 'reference') return 'text';
    if (type === 'account') return 'select';
    if (options && options.length > 0) return 'select';
    return 'text';
  };

  const fieldType = getT24FieldType();

  // Handle single field change
  const handleSingleChange = (newValue) => {
    onChange(name, newValue);
  };

  // Handle multi-field change
  const handleMultiChange = (index, newValue) => {
    const currentValues = Array.isArray(value) ? [...value] : [''];
    currentValues[index] = newValue;
    onChange(name, currentValues);
  };

  // Add new multi-field
  const addMultiField = () => {
    const currentValues = Array.isArray(value) ? [...value] : [''];
    if (!max_multifield || currentValues.length < max_multifield) {
      onChange(name, [...currentValues, '']);
    }
  };

  // Remove multi-field
  const removeMultiField = (index) => {
    const currentValues = Array.isArray(value) ? [...value] : [''];
    if (currentValues.length > 1) {
      const newValues = currentValues.filter((_, i) => i !== index);
      onChange(name, newValues);
    }
  };

  // Render single input field
  const renderSingleField = () => {
    const commonProps = {
      id: `${tabId}_${name}`,
      value: value || '',
      onChange: (e) => handleSingleChange(e.target.value),
      className: `t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`,
      required: required,
      readOnly: readOnly,
      disabled: readOnly
    };

    switch (fieldType) {
      case 'select':
        return (
          <select {...commonProps} readOnly={undefined} disabled={readOnly}>
            <option value="">Select...</option>
            {(dropdownOptions.length > 0 ? dropdownOptions : options || []).map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'file':
        return (
          <input
            type="file"
            accept={accept}
            {...commonProps}
            readOnly={undefined}
            disabled={readOnly}
            onChange={(e) => handleSingleChange(e.target.files?.[0]?.name || '')}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            {...commonProps}
            readOnly={undefined}
            disabled={readOnly}
          />
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            maxLength={max}
            placeholder={`Enter ${label.toLowerCase()}`}
            readOnly={readOnly}
            disabled={readOnly}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            step={decimals ? Math.pow(10, -decimals) : 1}
            min={min}
            max={max}
            {...commonProps}
            readOnly={undefined}
            disabled={readOnly}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            {...commonProps}
            placeholder={`Enter ${label.toLowerCase()}`}
            readOnly={undefined}
            disabled={readOnly}
          />
        );

      case 'tel':
        return (
          <input
            type="tel"
            {...commonProps}
            placeholder={`Enter ${label.toLowerCase()}`}
            pattern={pattern}
            readOnly={undefined}
            disabled={readOnly}
          />
        );

      default:
        return (
          <input
            type="text"
            minLength={min}
            maxLength={max}
            pattern={pattern}
            {...commonProps}
            placeholder={`Enter ${label.toLowerCase()}`}
            readOnly={undefined}
            disabled={readOnly}
          />
        );
    }
  };

  // Render multi-input fields
  const renderMultiFields = () => {
    const values = Array.isArray(value) ? value : [''];

    return (
      <div className="multi-fields-container">
        {values.map((val, index) => (
          <div key={index} className="multi-field-row">
            <div className="multi-field-input">
              {fieldType === 'select' ? (
                <select
                  value={val || ''}
                  onChange={(e) => handleMultiChange(index, e.target.value)}
                  className={`t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`}
                  required={required && index === 0}
                  disabled={readOnly}
                >
                  <option value="">Select...</option>
                  {(dropdownOptions.length > 0 ? dropdownOptions : options || []).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : fieldType === 'textarea' ? (
                <textarea
                  value={val || ''}
                  onChange={(e) => handleMultiChange(index, e.target.value)}
                  className={`t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  maxLength={max}
                  required={required && index === 0}
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              ) : fieldType === 'date' ? (
                <input
                  type="date"
                  value={val || ''}
                  onChange={(e) => handleMultiChange(index, e.target.value)}
                  className={`t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`}
                  required={required && index === 0}
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              ) : fieldType === 'email' ? (
                <input
                  type="email"
                  value={val || ''}
                  onChange={(e) => handleMultiChange(index, e.target.value)}
                  className={`t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  minLength={min}
                  maxLength={max}
                  required={required && index === 0}
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              ) : fieldType === 'tel' ? (
                <input
                  type="tel"
                  value={val || ''}
                  onChange={(e) => handleMultiChange(index, e.target.value)}
                  className={`t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  pattern={pattern}
                  required={required && index === 0}
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              ) : (
                <input
                  type={fieldType === 'number' ? 'number' : 'text'}
                  value={val || ''}
                  onChange={(e) => handleMultiChange(index, e.target.value)}
                  className={`t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  step={fieldType === 'number' && decimals ? Math.pow(10, -decimals) : undefined}
                  min={fieldType === 'number' ? min : undefined}
                  max={fieldType === 'number' ? max : undefined}
                  minLength={fieldType === 'text' ? min : undefined}
                  maxLength={fieldType === 'text' ? max : undefined}
                  pattern={fieldType === 'text' ? pattern : undefined}
                  required={required && index === 0}
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              )}
              
              {values.length > 1 && (
                <button
                  type="button"
                  className="remove-multi-field"
                  onClick={() => removeMultiField(index)}
                  title="Remove"
                  disabled={readOnly}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        
        {(!max_multifield || values.length < max_multifield) && !readOnly && (
          <button
            type="button"
            className="add-multi-field"
            onClick={addMultiField}
          >
            + Add {label}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`t24-form-field ${isHotfield ? 'hotfield-container' : ''}`}>
      <label 
        htmlFor={`${tabId}_${name}`} 
        className={`t24-label ${error ? 'error' : ''} ${isHotfield ? 'hotfield-label' : ''}`}
      >
        {label}
        {required && <span className="required-asterisk">*</span>}
        {isHotfield && <span className="hotfield-indicator" title="Important field">●</span>}
      </label>
      
      <div className="t24-input-container">
        {multi ? renderMultiFields() : renderSingleField()}
        
        {error && (
          <div className="t24-error">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldRenderer;