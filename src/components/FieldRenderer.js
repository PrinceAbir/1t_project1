// src/components/FieldRenderer.jsx (updated: added readOnly prop handling based on mode, dynamic options edge, memoized)
import React, { useState, useEffect, memo } from 'react';

const FieldRenderer = memo(({ field, value, onChange, error, tabId, readOnly = false }) => {
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
    setDropdownOptions(dynamicData[source] || []); // Edge: empty if no source
  };

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
        return { type: 'text', minLength: min, maxLength: max, pattern, placeholder: `Enter ${label.toLowerCase()}`, required, readOnly };
    }
  };

  const handleChange = (newValue, index = null) => {
    if (readOnly) return; // Edge: no change if readOnly
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
    if (readOnly) return;
    const currentValues = Array.isArray(value) ? [...value] : [''];
    if (!max_multifield || currentValues.length < max_multifield) {
      handleChange('', currentValues.length);
    }
  };

  const removeMultiField = (index) => {
    if (readOnly) return;
    const currentValues = Array.isArray(value) ? [...value] : [''];
    if (currentValues.length > 1) {
      const newValues = currentValues.filter((_, i) => i !== index);
      onChange(id, newValues);
    }
  };

  const inputProps = getInputProps();

  const renderMultiFields = () => {
    const values = Array.isArray(value) ? value : [''];
    // error may be string '' or array of messages
    const errArray = Array.isArray(error) ? error : [];

    return (
      <div className="multi-fields-container">
        {values.map((val, idx) => {
          const perError = errArray[idx] || '';
          return (
            <div key={idx} className="multi-field-row">
              {field.options || type === 'account' ? (
                <div style={{ width: '100%' }}>
                  <select
                    id={`${tabId}_${id}_${idx}`}
                    value={val || ''}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    required={required && idx === 0}
                    disabled={readOnly}
                    className={`t24-input ${perError ? 'error' : ''}`}
                  >
                    <option value="">Select...</option>
                    {(dropdownOptions.length ? dropdownOptions : options || []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {perError && <div className="t24-error">{perError}</div>}
                </div>
              ) : inputProps.as === 'textarea' ? (
                <div style={{ width: '100%' }}>
                  <textarea
                    id={`${tabId}_${id}_${idx}`}
                    value={val || ''}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    {...inputProps}
                    className={`t24-input ${perError ? 'error' : ''}`}
                  />
                  {perError && <div className="t24-error">{perError}</div>}
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <input
                    id={`${tabId}_${id}_${idx}`}
                    value={val || ''}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    {...inputProps}
                    className={`t24-input ${perError ? 'error' : ''}`}
                  />
                  {perError && <div className="t24-error">{perError}</div>}
                </div>
              )}

              {values.length > 1 && !readOnly && (
                <button type="button" className="remove-multi-field" onClick={() => removeMultiField(idx)}>✕</button>
              )}
            </div>
          );
        })}
        {(!max_multifield || values.length < max_multifield) && !readOnly && (
          <button type="button" className="add-multi-field" onClick={addMultiField}>
            + Add {label}
          </button>
        )}
      </div>
    );
  };

  const singleError = !Array.isArray(error) ? error : '';

  return (
    <div className={`t24-form-field`}>
      <label htmlFor={`${tabId}_${id}`} className={`t24-label ${singleError ? 'error' : ''}`}>
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
              className={`t24-input ${singleError ? 'error' : ''}`}
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
              className={`t24-input ${singleError ? 'error' : ''}`}
            />
          ) : (
            <input
              id={`${tabId}_${id}`}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              {...inputProps}
              className={`t24-input ${singleError ? 'error' : ''}`}
            />
          )
        )}
        {!multi && singleError && <div className="t24-error">{singleError}</div>}
      </div>
    </div>
  );
});

export default FieldRenderer;