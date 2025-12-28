// FieldRenderer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { loadDropdownOptions } from '../services/DropdownService'; 

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

  const [dropdownOptions, setDropdownOptions] = useState([]);

  useEffect(() => {
    // Only load dropdown options for fields explicitly declared as `type: 'dropdown'`
    if (type === 'dropdown') {
      console.debug('FieldRenderer: loading dropdown for field', field.id || field.name, field);
      if (field.dropdownType === 'dynamic' && field.dropdownName) {
        loadDynamicOptions(field.dropdownName);
      } else if (field.dropdown) {
        const opts = loadDropdownOptions(field);
        console.debug('FieldRenderer: options from service', opts);
        setDropdownOptions(opts);
      } else if (options && options.length) {
        console.debug('FieldRenderer: options from field.options', options);
        setDropdownOptions(options);
      } else {
        console.debug('FieldRenderer: no dropdown options found for', field.id || field.name);
        setDropdownOptions([]);
      }
    }
  }, [type, field.dropdown, field.dropdownType, field.dropdownName, options]);



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

  // Small reusable custom dropdown that renders options as a table (ID | Description)
  const CustomDropdown = ({ options, value, onSelect, placeholder = 'Select...', readOnly = false }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }, []);

    const display = () => {
      if (!value) return '';
      // options may be array of strings or objects {value,label}
      const found = Array.isArray(options) ? options.find(o => (o.value ? o.value === value : o === value)) : null;
      if (found) return found.label || found.value || String(found);
      return String(value);
    };

    const idFor = (o) => {
      if (!o) return '';
      if (typeof o === 'string') return o;
      if (o.raw && o.raw.id !== undefined) return String(o.raw.id);
      if (o.value) return String(o.value);
      if (o.raw && o.raw.code !== undefined) return String(o.raw.code);
      if (o.raw && o.raw.userId !== undefined) return String(o.raw.userId);
      return o.label || '';
    };

    const descFor = (o) => {
      if (!o) return '';
      if (typeof o === 'string') return o;
      if (o.label) return o.label;
      if (o.raw && o.raw.description) return o.raw.description;
      if (o.raw && o.raw.name) return o.raw.name;
      if (o.raw && o.raw.firstName && o.raw.lastName) return `${o.raw.firstName} ${o.raw.lastName}`;
      return '';
    };

    return (
      <div className="custom-dropdown" ref={ref} style={{ position: 'relative', width: '100%' }}>
        <button type="button" className="t24-input" onClick={() => setOpen(!open)} disabled={readOnly} style={{ textAlign: 'left', paddingRight: 28 }}>
          <span style={{ display: 'inline-block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{display() || placeholder}</span>
          <span aria-hidden="true" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 12, color: '#555' }}>▾</span>
        </button>
        {open && (
          <div className="custom-dropdown-menu" style={{ position: 'absolute', zIndex: 40, background: '#fff', border: '1px solid #ccc', width: '100%', maxHeight: 240, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(options) && options.map((opt, idx) => (
                  <tr key={idx} onClick={() => { onSelect(opt.value || opt); setOpen(false); }} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}>{idFor(opt)}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}>{descFor(opt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

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
              {type === 'dropdown' ? (
                <div style={{ width: '100%' }}>
                  <CustomDropdown
                    options={dropdownOptions}
                    value={val}
                    onSelect={(v) => handleChange(v, idx)}
                    placeholder="Select..."
                    readOnly={readOnly}
                  />
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
          (type === 'dropdown') ? (
            <CustomDropdown
              options={dropdownOptions}
              value={value}
              onSelect={(v) => handleChange(v)}
              placeholder="Select..."
              readOnly={readOnly}
            />
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
};

export default FieldRenderer;
