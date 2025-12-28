import React, { useState, useEffect, memo, useMemo } from 'react';
import './FieldRenderer.css';


const FieldRenderer = ({ field = {}, value, onChange, error, tabId = 'tab', readOnly = false }) => {
  const id = field?.id || field?.field_name || field?.fieldName || '';
  const label = field?.label || field?.label_name || field?.field_name || '';
  const rawType = field?.type || field?.metadata?.type || 'string';
  const type = String(rawType).toLowerCase();
  const required = field?.required ?? field?.metadata?.required ?? field?.mandatory ?? false;
  const multi = field?.multi ?? field?.metadata?.multi ?? field?.multivalued ?? false;
  const options = useMemo(() => (field?.options || field?.metadata?.options || []), [field?.options, field?.metadata?.options]);
  const maxMulti = field?.max_multifield ?? field?.metadata?.max_multifield;

  const [dropdownOptions, setDropdownOptions] = useState(options || []);

  useEffect(() => {
    if (field?.dropdown && field?.dropdownType === 'dynamic') {
      setDropdownOptions((o) => o);
    } else {
      setDropdownOptions(options || []);
    }
  }, [field?.dropdown, field?.dropdownType, options]);

  const rawChildren = field.children || field.metadata?.children || field.fields || field.metadata?.fields || [];
  const children = Array.isArray(rawChildren)
    ? rawChildren.map((c) => ({ id: c.id || c.field_name || c.fieldName || String(c.field_name || c.id || ''), label: c.label || c.label_name || c.field_name || c.fieldName || c.id || '' }))
    : [];

  const emitChange = (newVal) => { if (onChange) onChange(id, newVal); };

  const handleSingleChange = (val) => { if (readOnly) return; emitChange(val); };

  const handleMultiChange = (val, idx = null) => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    if (idx === null) arr.push(val); else arr[idx] = val;
    emitChange(arr);
  };

  const removeMulti = (idx) => { if (readOnly) return; const arr = Array.isArray(value) ? [...value] : []; if (arr.length <= 1) return; arr.splice(idx, 1); emitChange(arr); };

  const addMulti = () => { if (readOnly) return; const arr = Array.isArray(value) ? [...value] : []; if (maxMulti && arr.length >= maxMulti) return; if (type === 'group') { const empty = children.reduce((acc, c) => ({ ...acc, [c.id]: '' }), {}); emitChange([...arr, empty]); } else { emitChange([...arr, '']); } };

  const handleGroupChildChange = (childId, childVal, groupIdx) => { if (readOnly) return; const groups = Array.isArray(value) ? [...value] : [value || {}]; groups[groupIdx] = { ...(groups[groupIdx] || {}), [childId]: childVal }; emitChange(groups); };

  const renderMulti = () => {
    const arr = Array.isArray(value) ? value : [''];
    const errs = Array.isArray(error) ? error : [];
    return (
      <div className="multi-fields-container">
        {arr.map((v, i) => (
          <div key={i} className="multi-field-row">
            <input id={`${tabId}_${id}_${i}`} value={v ?? ''} onChange={(e) => handleMultiChange(e.target.value, i)} className={`t24-input ${errs[i] ? 'error' : ''}`} disabled={readOnly} />
            {errs[i] && <div className="t24-error">{errs[i]}</div>}
            {!readOnly && arr.length > 1 && (
              <button
                type="button"
                className="remove-multi-field"
                title={`Remove ${label}`}
                aria-label={`Remove ${label}`}
                onClick={() => removeMulti(i)}
              >
                <span className="remove-icon" aria-hidden>−</span>
                <span className="sr-only">Remove {label}</span>
              </button>
            )}
          </div>
        ))}
        {!readOnly && (!maxMulti || arr.length < maxMulti) && (<button type="button" className="add-multi-field" onClick={addMulti}>+ Add {label}</button>)}
      </div>
    );
  };

  const renderGroup = () => {
    const groups = Array.isArray(value) ? value : [value || {}];
    const errs = Array.isArray(error) ? error : [];
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
                    <input id={`${tabId}_${id}_${gi}_${ch.id}`} value={(grp && grp[ch.id]) || ''} onChange={(e) => handleGroupChildChange(ch.id, e.target.value, gi)} className={`t24-input ${childErr ? 'error' : ''}`} disabled={readOnly} />
                    {childErr && <div className="t24-error">{childErr}</div>}
                  </div>
                );
              })}
            </div>
            {!readOnly && groups.length > 1 && (
              <div className="group-actions">
                <button
                  type="button"
                  className="remove-multi-field"
                  title={`Remove ${label}`}
                  aria-label={`Remove ${label}`}
                  onClick={() => { const arr = [...groups]; arr.splice(gi, 1); emitChange(arr); }}
                >
                  <span className="remove-icon" aria-hidden>−</span>
                  <span className="sr-only">Remove {label}</span>
                </button>
              </div>
            )}
          </div>
        ))}
        {!readOnly && (!maxMulti || groups.length < maxMulti) && (<button type="button" className="add-multi-field" onClick={addMulti}>+ Add {label}</button>)}
      </div>
    );
  };

  const singleError = Array.isArray(error) ? '' : error;
  const typeNorm = (type || '').toLowerCase();

  const renderSingle = () => {
    if (typeNorm === 'select' || typeNorm === 'account' || (dropdownOptions && dropdownOptions.length)) {
      const opts = dropdownOptions && dropdownOptions.length ? dropdownOptions : options;
      return (
        <select id={`${tabId}_${id}`} value={value ?? ''} onChange={(e) => handleSingleChange(e.target.value)} required={required} disabled={readOnly} className={`t24-input ${singleError ? 'error' : ''}`}>
          <option value="">Select...</option>
          {(opts || []).map((opt) => { const val = opt && typeof opt === 'object' ? (opt.value ?? opt.id ?? opt.key) : opt; const lbl = opt && typeof opt === 'object' ? (opt.label ?? opt.name ?? String(val)) : String(opt); return <option key={String(val)} value={val}>{lbl}</option>; })}
        </select>
      );
    }

    if (typeNorm === 'textarea') {
      return (<textarea id={`${tabId}_${id}`} value={value ?? ''} onChange={(e) => handleSingleChange(e.target.value)} className={`t24-input ${singleError ? 'error' : ''}`} disabled={readOnly} rows={4} />);
    }

    if (['int', 'integer', 'number', 'double', 'amount', 'float'].includes(typeNorm)) {
      const step = typeNorm === 'int' || typeNorm === 'integer' ? '1' : (typeNorm === 'amount' ? '0.01' : 'any');
      return (<input id={`${tabId}_${id}`} type="number" value={value ?? ''} onChange={(e) => handleSingleChange(e.target.value === '' ? '' : e.target.value)} className={`t24-input ${singleError ? 'error' : ''}`} disabled={readOnly} step={step} />);
    }

    if (typeNorm === 'date') { return (<input id={`${tabId}_${id}`} type="date" value={value ?? ''} onChange={(e) => handleSingleChange(e.target.value)} className={`t24-input ${singleError ? 'error' : ''}`} disabled={readOnly} />); }

    if (typeNorm === 'email') { return (<input id={`${tabId}_${id}`} type="email" value={value ?? ''} onChange={(e) => handleSingleChange(e.target.value)} className={`t24-input ${singleError ? 'error' : ''}`} disabled={readOnly} />); }
    if (typeNorm === 'tel' || typeNorm === 'phone') { return (<input id={`${tabId}_${id}`} type="tel" value={value ?? ''} onChange={(e) => handleSingleChange(e.target.value)} className={`t24-input ${singleError ? 'error' : ''}`} disabled={readOnly} />); }

    if (typeNorm === 'file') {
      return (<input id={`${tabId}_${id}`} type="file" multiple={multi} onChange={(e) => { if (readOnly) return; const files = Array.from(e.target.files || []); emitChange(multi ? files : (files[0] || null)); }} className={`t24-input ${singleError ? 'error' : ''}`} disabled={readOnly} />);
    }

    // Attachment type: show file input + list of attachments with remove support
    if (typeNorm === 'attachment') {
      const attachments = Array.isArray(value) ? value : (value ? [value] : []);
      const handleFileChange = (e) => {
        if (readOnly) return;
        const files = Array.from(e.target.files || []);
        emitChange(multi ? files : (files[0] || null));
      };
      const removeAttachment = (idx) => {
        if (readOnly) return;
        const arr = Array.isArray(value) ? [...value] : [];
        arr.splice(idx, 1);
        emitChange(arr);
      };
      return (
        <div>
          <input id={`${tabId}_${id}`} type="file" multiple={multi} onChange={handleFileChange} className={`t24-input ${singleError ? 'error' : ''}`} disabled={readOnly} />
          <div className="attachment-list">
            {attachments.map((att, i) => {
              const name = att && att.name ? att.name : String(att);
              const url = att && att.url ? att.url : null;
              return (
                <div key={i} className="attachment-item">
                  {url ? <a href={url} target="_blank" rel="noreferrer">{name}</a> : <span>{name}</span>}
                  {!readOnly && (
                    <button type="button" className="remove-attachment" onClick={() => removeAttachment(i)}>Remove</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (<input id={`${tabId}_${id}`} value={value ?? ''} onChange={(e) => handleSingleChange(e.target.value)} className={`t24-input ${singleError ? 'error' : ''}`} disabled={readOnly} />);
  };

  return (
    <div className="t24-form-field">
      <label htmlFor={`${tabId}_${id}`} className={`t24-label ${singleError ? 'error' : ''}`}>{label}{required && <span className="required-asterisk">*</span>}</label>
      <div className="t24-input-container">
        {typeNorm === 'group' ? renderGroup() : (multi ? renderMulti() : renderSingle())}
        {!multi && singleError && <div className="t24-error">{singleError}</div>}
      </div>
    </div>
  );
};

export default memo(FieldRenderer);
