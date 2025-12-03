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

  useEffect(() => {
    if (dropdown && dropdownType === 'dynamic' && dropdownName) {
      loadDynamicOptions(dropdownName);
    }
  }, [dropdown, dropdownType, dropdownName]);

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

  const handleSingleChange = (newValue) => {
    onChange(name, newValue);
  };

  const handleMultiChange = (index, newValue) => {
    const currentValues = Array.isArray(value) ? [...value] : [''];
    currentValues[index] = newValue;
    onChange(name, currentValues);
  };

  const addMultiField = () => {
    const currentValues = Array.isArray(value) ? [...value] : [''];
    if (!max_multifield || currentValues.length < max_multifield) {
      onChange(name, [...currentValues, '']);
    }
  };

  const removeMultiField = (index) => {
    const currentValues = Array.isArray(value) ? [...value] : [''];
    if (currentValues.length > 1) {
      const newValues = currentValues.filter((_, i) => i !== index);
      onChange(name, newValues);
    }
  };

  const renderSingleField = () => {
    const commonProps = {
      id: `${tabId}_${name}`, // ✅ correct id used for toast scroll
      value: value || '',
      onChange: (e) => handleSingleChange(e.target.value),
      className: `t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`,
      required,
      readOnly,
      disabled: readOnly
    };

    switch (fieldType) {
      case 'select':
        return (
          <select {...commonProps} disabled={readOnly}>
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
            onChange={(e) => handleSingleChange(e.target.files?.[0]?.name || '')}
          />
        );
      case 'date':
        return <input type="date" {...commonProps} />;
      case 'textarea':
        return <textarea {...commonProps} maxLength={max} placeholder={`Enter ${label.toLowerCase()}`} />;
      case 'number':
        return <input type="number" step={decimals ? Math.pow(10, -decimals) : 1} min={min} max={max} {...commonProps} />;
      case 'email':
        return <input type="email" {...commonProps} placeholder={`Enter ${label.toLowerCase()}`} />;
      case 'tel':
        return <input type="tel" {...commonProps} placeholder={`Enter ${label.toLowerCase()}`} pattern={pattern} />;
      default:
        return <input type="text" {...commonProps} minLength={min} maxLength={max} pattern={pattern} placeholder={`Enter ${label.toLowerCase()}`} />;
    }
  };

  const renderMultiFields = () => {
    const values = Array.isArray(value) ? value : [''];

    return (
      <div className="multi-fields-container">
        {values.map((val, index) => (
          <div key={index} className="multi-field-row">
            <div className="multi-field-input">
              {fieldType === 'select' ? (
                <select
                  id={`${tabId}_${name}_${index}`} // optional: unique id per multi-input
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
              ) : (
                <input
                  id={`${tabId}_${name}_${index}`} // optional: unique id per multi-input
                  type={fieldType === 'number' ? 'number' : 'text'}
                  value={val || ''}
                  onChange={(e) => handleMultiChange(index, e.target.value)}
                  className={`t24-input ${error ? 'error' : ''} ${isHotfield ? 'hotfield' : ''}`}
                  placeholder={`Enter ${label.toLowerCase()}`}
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

        {error && <div className="t24-error">{error}</div>}
      </div>
    </div>
  );
};

export default FieldRenderer;
