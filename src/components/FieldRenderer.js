// src/components/FieldRenderer.jsx (updated: added readOnly prop handling based on mode, dynamic options edge, memoized)
import React, { useState, useEffect, memo } from 'react';

const FieldRenderer = ({ field, value, onChange, error, tabId, readOnly = false }) => {
  const id = field?.id;
  const label = field?.label || '';
  const type = field?.type || 'text';
  const required = field?.required ?? field?.metadata?.required ?? field?.mandatory ?? false;
  const multi = field?.multi ?? field?.metadata?.multi ?? false;
  const options = field?.options || field?.metadata?.options || [];
  const maxMulti = field?.max_multifield ?? field?.metadata?.max_multifield;

  const [dropdownOptions, setDropdownOptions] = useState(options);

  useEffect(() => {
    if (field?.dropdown && field?.dropdownType === 'dynamic') {
      setDropdownOptions((o) => o);
    }
  }, [field?.dropdown, field?.dropdownType]);

  const emitChange = (newVal) => onChange && onChange(id, newVal);

  const handleSingleChange = (val) => {
    if (readOnly) return;
    emitChange(val);
  };

  const handleMultiChange = (val, idx = null) => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    if (idx === null) arr.push(val); else arr[idx] = val;
    emitChange(arr);
  };

  const removeMulti = (idx) => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    if (arr.length <= 1) return;
    arr.splice(idx, 1);
    emitChange(arr);
  };

  const addMulti = () => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    if (maxMulti && arr.length >= maxMulti) return;
    if (type === 'group') {
      const children = field.children || field.metadata?.children || [];
      const empty = children.reduce((acc, c) => ({ ...acc, [c.id]: '' }), {});
      emitChange([...arr, empty]);
    } else {
      emitChange([...arr, '']);
    }
  };

  const handleGroupChildChange = (childId, childVal, groupIdx) => {
    if (readOnly) return;
    const groups = Array.isArray(value) ? [...value] : [value || {}];
    groups[groupIdx] = { ...(groups[groupIdx] || {}), [childId]: childVal };
    emitChange(groups);
  };

  const renderMulti = () => {
    const arr = Array.isArray(value) ? value : [''];
    const errs = Array.isArray(error) ? error : [];
    return (
      <div className="multi-fields-container">
        {arr.map((v, i) => (
          <div key={i} className="multi-field-row">
            <input
              id={`${tabId}_${id}_${i}`}
              value={v ?? ''}
              onChange={(e) => handleMultiChange(e.target.value, i)}
              className={`t24-input ${errs[i] ? 'error' : ''}`}
              disabled={readOnly}
            />
            {errs[i] && <div className="t24-error">{errs[i]}</div>}
            {!readOnly && arr.length > 1 && (
              <button type="button" className="remove-multi-field" onClick={() => removeMulti(i)}>✕</button>
            )}
          </div>
        ))}
        {!readOnly && (!maxMulti || arr.length < maxMulti) && (
          <button type="button" className="add-multi-field" onClick={addMulti}>+ Add {label}</button>
        )}
      </div>
    );
  };

  const renderGroup = () => {
    const groups = Array.isArray(value) ? value : [value || {}];
    const errs = Array.isArray(error) ? error : [];
    const children = field.children || field.metadata?.children || [];
    return (
      <div className="group-fields-container">
        {groups.map((grp, gi) => (
          <div key={gi} className="group-instance">
            <div className="group-children">
              {children.map((ch) => {
                const childErr = errs[gi] && errs[gi][ch.id] ? errs[gi][ch.id] : '';
                return (
                  <div key={ch.id} className="group-child-row">
                    <label htmlFor={`${tabId}_${id}_${gi}_${ch.id}`}>{ch.label}{(ch.required || ch.mandatory) && <span className="required-asterisk">*</span>}</label>
                    <input
                      id={`${tabId}_${id}_${gi}_${ch.id}`}
                      value={(grp && grp[ch.id]) || ''}
                      onChange={(e) => handleGroupChildChange(ch.id, e.target.value, gi)}
                      className={`t24-input ${childErr ? 'error' : ''}`}
                      disabled={readOnly}
                    />
                    {childErr && <div className="t24-error">{childErr}</div>}
                  </div>
                );
              })}
            </div>
            {!readOnly && groups.length > 1 && (
              <div className="group-actions"><button type="button" className="remove-multi-field" onClick={() => {
                const arr = [...groups]; arr.splice(gi, 1); emitChange(arr);
              }}>Remove</button></div>
            )}
          </div>
        ))}
        {!readOnly && (!maxMulti || groups.length < maxMulti) && (
          <button type="button" className="add-multi-field" onClick={addMulti}>+ Add {label}</button>
        )}
      </div>
    );
  };

  const singleError = Array.isArray(error) ? '' : error;

  return (
    <div className="t24-form-field">
      <label htmlFor={`${tabId}_${id}`} className={`t24-label ${singleError ? 'error' : ''}`}>
        {label}{required && <span className="required-asterisk">*</span>}
      </label>
      <div className="t24-input-container">
        {type === 'group' ? renderGroup() : (multi ? renderMulti() : (
          (field.options || type === 'account') ? (
            <select
              id={`${tabId}_${id}`}
              value={value ?? ''}
              onChange={(e) => handleSingleChange(e.target.value)}
              required={required}
              disabled={readOnly}
              className={`t24-input ${singleError ? 'error' : ''}`}>
              <option value="">Select...</option>
              {(dropdownOptions || options || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              id={`${tabId}_${id}`}
              value={value ?? ''}
              onChange={(e) => handleSingleChange(e.target.value)}
              className={`t24-input ${singleError ? 'error' : ''}`}
              disabled={readOnly}
            />
          )
        ))}
        {!multi && singleError && <div className="t24-error">{singleError}</div>}
      </div>
    </div>
  );
};

export default memo(FieldRenderer);