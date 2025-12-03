import React, { useState, useEffect } from 'react';

const FieldRenderer = ({ field, value, onChange, error, tabId }) => {
  const {
    id,
    label,
    type,
    required,
    multi,
    options,
    min,
    max,
    max_multifield,
    decimals,
    readOnly,
    accept,
    pattern
  } = field;

  const [dropdownOptions, setDropdownOptions] = useState(options || []);

  useEffect(() => {
    if (field.dropdown && field.dropdownType === 'dynamic' && field.dropdownName) {
      loadDynamicOptions(field.dropdownName);
    }
  }, [field.dropdown, field.dropdownType, field.dropdownName]);

  const loadDynamicOptions = (source) => {
    const dynamicData = {
      'ACCOUNT': ['Checking', 'Savings', 'Business', 'Money Market'],
      'CURRENCY': ['USD', 'EUR', 'GBP', 'JPY', 'CAD'],
      'COUNTRY': ['United States', 'United Kingdom', 'Canada', 'Australia'],
      'DEPARTMENT': ['HR', 'Finance', 'IT', 'Marketing', 'Operations'],
      'STATUS': ['Active', 'Inactive', 'Pending', 'Closed']
    };
    setDropdownOptions(dynamicData[source] || []);
  };

  // Determine input type and attributes dynamically
  const getInputProps = () => {
    switch (type) {
      case 'int':
        return {
          type: 'text',
          inputMode: 'numeric',
          pattern: '[0-9]*',
          title: 'Enter integers only',
          min,
          max,
          required,
          readOnly
        };

      case 'amount':
        return {
          type: 'number',
          step: decimals ? Math.pow(10, -decimals) : 0.01,
          min: min ?? 0,
          max,
          placeholder: '0.00',
          required,
          readOnly
        };

      case 'tel':
        return {
          type: 'tel',
          pattern: pattern || '01[3-9][0-9]{8}',
          title: 'Enter a valid 11-digit Bangladeshi mobile number',
          maxLength: 11,
          inputMode: 'numeric',
          placeholder: '01**********',
          required,
          readOnly
        };

      case 'email':
        return {
          type: 'email',
          placeholder: `Enter ${label.toLowerCase()}`,
          required,
          readOnly
        };

      case 'date':
        return { type: 'date', required, readOnly };

      case 'file':
        return { type: 'file', accept, required, readOnly };

      case 'textarea':
        return { as: 'textarea', maxLength: max, placeholder: `Enter ${label.toLowerCase()}`, required, readOnly };

      default:
        // default text input
        return { type: 'text', minLength: min, maxLength: max, pattern, placeholder: `Enter ${label.toLowerCase()}`, required, readOnly };
    }
  };

  const handleChange = (newValue, index = null) => {
    if (multi) {
      const currentValues = Array.isArray(value) ? [...value] : [''];
      if (index !== null) {
        currentValues[index] = newValue;
      } else {
        currentValues.push(newValue);
      }
      onChange(id, currentValues);
    } else {
      onChange(id, newValue);
    }
  };

  const addMultiField = () => {
    const currentValues = Array.isArray(value) ? [...value] : [''];
    if (!max_multifield || currentValues.length < max_multifield) {
      handleChange('', currentValues.length);
    }
  };

  const removeMultiField = (index) => {
    const currentValues = Array.isArray(value) ? [...value] : [''];
    if (currentValues.length > 1) {
      const newValues = currentValues.filter((_, i) => i !== index);
      onChange(id, newValues);
    }
  };

  const inputProps = getInputProps();

  const renderMultiFields = () => {
    const values = Array.isArray(value) ? value : [''];
    return (
      <div className="multi-fields-container">
        {values.map((val, idx) => (
          <div key={idx} className="multi-field-row">
            {field.options || type === 'account' ? (
              <select
                id={`${tabId}_${id}_${idx}`}
                value={val || ''}
                onChange={(e) => handleChange(e.target.value, idx)}
                required={required && idx === 0}
                disabled={readOnly}
                className={`t24-input ${error ? 'error' : ''}`}
              >
                <option value="">Select...</option>
                {(dropdownOptions.length ? dropdownOptions : options || []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : inputProps.as === 'textarea' ? (
              <textarea
                id={`${tabId}_${id}_${idx}`}
                value={val || ''}
                onChange={(e) => handleChange(e.target.value, idx)}
                {...inputProps}
                className={`t24-input ${error ? 'error' : ''}`}
              />
            ) : (
              <input
                id={`${tabId}_${id}_${idx}`}
                value={val || ''}
                onChange={(e) => handleChange(e.target.value, idx)}
                {...inputProps}
                className={`t24-input ${error ? 'error' : ''}`}
              />
            )}

            {values.length > 1 && !readOnly && (
              <button type="button" className="remove-multi-field" onClick={() => removeMultiField(idx)}>✕</button>
            )}
          </div>
        ))}
        {(!max_multifield || values.length < max_multifield) && !readOnly && (
          <button type="button" className="add-multi-field" onClick={addMultiField}>
            + Add {label}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`t24-form-field`}>
      <label htmlFor={`${tabId}_${id}`} className={`t24-label ${error ? 'error' : ''}`}>
        {label}{required && <span className="required-asterisk">*</span>}
      </label>

      <div className="t24-input-container">
        {multi ? renderMultiFields() : (
          field.options || type === 'account' ? (
            <select
              id={`${tabId}_${id}`}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              required={required}
              disabled={readOnly}
              className={`t24-input ${error ? 'error' : ''}`}
            >
              <option value="">Select...</option>
              {(dropdownOptions.length ? dropdownOptions : options || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : inputProps.as === 'textarea' ? (
            <textarea
              id={`${tabId}_${id}`}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              {...inputProps}
              className={`t24-input ${error ? 'error' : ''}`}
            />
          ) : (
            <input
              id={`${tabId}_${id}`}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              {...inputProps}
              className={`t24-input ${error ? 'error' : ''}`}
            />
          )
        )}
        {error && <div className="t24-error">{error}</div>}
      </div>
    </div>
  );
};

export default FieldRenderer;
