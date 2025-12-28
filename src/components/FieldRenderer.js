// FieldRenderer.jsx
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import './FieldRenderer.css';
import { loadDropdownOptions } from '../services/DropdownService';

const FieldRenderer = ({ field = {}, value, onChange, error, tabId = 'tab', readOnly = false }) => {
  /* ---------------- Field normalization ---------------- */
  const id = field?.id || field?.field_name || field?.fieldName || '';
  const label = field?.label || field?.label_name || field?.field_name || '';
  const rawType = field?.type || field?.metadata?.type || 'string';
  const type = String(rawType).toLowerCase();
  const required = field?.required ?? field?.metadata?.required ?? field?.mandatory ?? false;
  const multi = field?.multi ?? field?.metadata?.multi ?? field?.multivalued ?? false;
  const min = field?.min ?? field?.metadata?.min;
  const max = field?.max ?? field?.metadata?.max;
  const accept = field?.accept ?? field?.metadata?.accept;
  const pattern = field?.pattern ?? field?.metadata?.pattern;
  const maxMulti = field?.max_multifield ?? field?.metadata?.max_multifield;

  const options = useMemo(
    () => field?.options || field?.metadata?.options || [],
    [field?.options, field?.metadata?.options]
  );

  /* ---------------- Dropdown options ---------------- */
  const [dropdownOptions, setDropdownOptions] = useState([]);

  const { dropdown, dropdownType, dropdownName } = field || {};

  useEffect(() => {
    if (type === 'dropdown') {
      if (dropdownType === 'dynamic' && dropdownName) {
        loadDynamicOptions(dropdownName);
      } else if (dropdown) {
        setDropdownOptions(loadDropdownOptions(field) || []);
      } else {
        setDropdownOptions(options || []);
      }
    }
  }, [type, dropdown, dropdownType, dropdownName, options, field]);

  const loadDynamicOptions = (source) => {
    const dynamicData = {
      ACCOUNT: ['Checking', 'Savings', 'Business'],
      CURRENCY: ['USD', 'EUR', 'BDT'],
      COUNTRY: ['Bangladesh', 'USA', 'UK'],
      STATUS: ['Active', 'Inactive']
    };
    setDropdownOptions(dynamicData[source] || []);
  };

  /* ---------------- Children (group fields) ---------------- */
  const rawChildren = field.children || field.metadata?.children || field.fields || [];
  const children = Array.isArray(rawChildren)
    ? rawChildren.map(c => ({
        id: c.id || c.field_name || c.fieldName,
        label: c.label || c.label_name || c.field_name
      }))
    : [];

  /* ---------------- Change handlers ---------------- */
  const emitChange = (val) => onChange && onChange(id, val);

  const handleSingleChange = (val) => {
    if (!readOnly) emitChange(val);
  };

  const handleMultiChange = (val, idx) => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    arr[idx] = val;
    emitChange(arr);
  };

  const addMulti = () => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    if (maxMulti && arr.length >= maxMulti) return;
    emitChange([...arr, type === 'group' ? {} : '']);
  };

  const removeMulti = (idx) => {
    if (readOnly) return;
    const arr = [...(Array.isArray(value) ? value : [])];
    if (arr.length <= 1) return;
    arr.splice(idx, 1);
    emitChange(arr);
  };

  const handleGroupChildChange = (childId, childVal, groupIdx) => {
    if (readOnly) return;
    const groups = Array.isArray(value) ? [...value] : [{}];
    groups[groupIdx] = { ...(groups[groupIdx] || {}), [childId]: childVal };
    emitChange(groups);
  };

  /* ---------------- Custom Dropdown ---------------- */
  const CustomDropdown = ({ options, value, onSelect }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }, []);

    return (
      <div className="custom-dropdown" ref={ref}>
        <button type="button" className="t24-input" onClick={() => setOpen(!open)} disabled={readOnly}>
          {value || 'Select...'}
        </button>
        {open && (
          <div className="custom-dropdown-menu">
            {(options || []).map((o, i) => (
              <div key={i} onClick={() => { onSelect(o.value ?? o); setOpen(false); }}>
                {o.label ?? o}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ---------------- Render helpers ---------------- */
  const singleError = Array.isArray(error) ? '' : error;
  const arr = Array.isArray(value) ? value : [''];
  const errs = Array.isArray(error) ? error : [];

  const renderSingle = () => {
    if (type === 'dropdown') {
      return (
        <CustomDropdown
          options={dropdownOptions.length ? dropdownOptions : options}
          value={value}
          onSelect={handleSingleChange}
        />
      );
    }

    if (type === 'textarea') {
      return <textarea value={value ?? ''} onChange={e => handleSingleChange(e.target.value)} disabled={readOnly} />;
    }

    if (type === 'file') {
      return <input type="file" accept={accept} disabled={readOnly} onChange={e => handleSingleChange(e.target.files[0])} />;
    }

    return (
      <input
        value={value ?? ''}
        onChange={e => handleSingleChange(e.target.value)}
        disabled={readOnly}
        min={min}
        max={max}
        pattern={pattern}
      />
    );
  };

  const renderMulti = () => (
    <div>
      {arr.map((v, i) => (
        <div key={i}>
          <input value={v ?? ''} onChange={e => handleMultiChange(e.target.value, i)} disabled={readOnly} />
          {errs[i] && <div className="t24-error">{errs[i]}</div>}
          {!readOnly && arr.length > 1 && <button onClick={() => removeMulti(i)}>✕</button>}
        </div>
      ))}
      {!readOnly && (!maxMulti || arr.length < maxMulti) && <button onClick={addMulti}>+ Add {label}</button>}
    </div>
  );

  const renderGroup = () => (
    <div>
      {(Array.isArray(value) ? value : [{}]).map((grp, gi) => (
        <div key={gi}>
          {children.map(ch => (
            <input
              key={ch.id}
              value={grp[ch.id] ?? ''}
              onChange={e => handleGroupChildChange(ch.id, e.target.value, gi)}
              disabled={readOnly}
            />
          ))}
        </div>
      ))}
      {!readOnly && <button onClick={addMulti}>+ Add {label}</button>}
    </div>
  );

  /* ---------------- Render ---------------- */
  return (
    <div className="t24-form-field">
      <label>{label}{required && '*'}</label>
      <div>
        {type === 'group' ? renderGroup() : (multi ? renderMulti() : renderSingle())}
        {!multi && singleError && <div className="t24-error">{singleError}</div>}
      </div>
    </div>
  );
};

export default memo(FieldRenderer);
