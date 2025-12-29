import React, { useState, useEffect } from 'react';
import './ETDDesigner.css';
import ebTableDefinitionMeta from './EtdFieldsMetaData';
import etdDropdownValues from './EtdDropdownFieldValues';

export default function ETDDesigner() {
  const [application, setApplication] = useState('');
  const [type] = useState('core');
  const [columns, setColumns] = useState(1);

  const [headerFields, setHeaderFields] = useState([]);
  const [fieldGroups, setFieldGroups] = useState([]);
  const [footerFields, setFooterFields] = useState([]);

  const [validationErrors, setValidationErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);

  const getRepeatingTemplate = () => {
    const template = [];
    Object.entries(ebTableDefinitionMeta.fields).forEach(([key, config]) => {
      if (key.endsWith('.1') || key === 'calculation') {
        const baseKey = key.replace('.1', '');
        template.push({
          metaKey: key,
          baseKey,
          ...config,
          value: '',
          dropdownValues: config.type === 'dropdown' && config.dropdown?.source
            ? etdDropdownValues[config.dropdown.source] || []
            : undefined
        });
      }
    });
    return template;
  };

  useEffect(() => {
    const meta = ebTableDefinitionMeta.fields;

    const header = [];
    const footer = [];

    Object.entries(meta).forEach(([key, config]) => {
      const field = {
        ...config,
        value: '',
        originalKey: key,
        dropdownValues: config.type === 'dropdown' && config.dropdown?.source
          ? etdDropdownValues[config.dropdown.source] || []
          : undefined
      };

      if (['act.desc', 'product'].includes(key)) {
        header.push(field);
      } else if (!key.endsWith('.1') && key !== 'calculation') {
        footer.push(field);
      }
    });

    setHeaderFields(header);
    setFooterFields(footer);

    const firstGroup = {
      id: 1,
      title: 'Field Definition 1',
      fields: getRepeatingTemplate().map(f => ({ ...f }))
    };

    setFieldGroups([firstGroup]);
    setLoading(false);
  }, []);

  const addFieldGroup = () => {
    const newIndex = fieldGroups.length + 1;
    const newGroup = {
      id: Date.now(),
      title: `Field Definition ${newIndex}`,
      fields: getRepeatingTemplate().map(f => ({ ...f, value: '' }))
    };
    setFieldGroups(prev => [...prev, newGroup]);
  };

  const removeFieldGroup = (id) => {
    if (fieldGroups.length === 1) return setStatus({ type: 'error', message: 'Cannot remove the only field.' });
    setFieldGroups(prev => prev.filter(g => g.id !== id));
  };

  const updateFieldValue = (groupId, metaKey, value) => {
    setFieldGroups(prev => prev.map(group =>
      group.id === groupId
        ? { ...group, fields: group.fields.map(f => f.metaKey === metaKey ? { ...f, value } : f) }
        : group
    ));
  };

  const updateSingleField = (setFields, originalKey, value) => {
    setFields(prev => prev.map(f => f.originalKey === originalKey ? { ...f, value } : f));
  };

  const handleValidate = () => {
    const errors = {};
    let hasError = false;

    if (!application.trim()) {
      errors.application = 'Application name required';
      hasError = true;
    }

    headerFields.forEach(f => {
      if (f.mandatory && !f.value?.trim()) {
        errors[`header_${f.originalKey}`] = `${f.label} required`;
        hasError = true;
      }
    });

    fieldGroups.forEach((group, idx) => {
      const nameField = group.fields.find(f => f.baseKey === 'field.name');
      if (!nameField?.value?.trim()) {
        errors[`group_${idx}_name`] = 'Field Name required';
        hasError = true;
      }
    });

    setValidationErrors(errors);
    setStatus({ type: hasError ? 'error' : 'success', message: hasError ? 'Fix errors' : 'Valid!' });
    return !hasError;
  };

  const handleCommit = () => {
    if (!handleValidate()) return;

    const metadata = {
      application: application.trim(),
      type,
      columns,
      fields: {}
    };

    // HEADER & FOOTER: fixed keys with user value
    [...headerFields, ...footerFields].forEach(field => {
      const key = field.originalKey.replace(/\./g, '_'); // act.desc → act_desc, file.type → file_type
      if (field.value !== undefined && field.value !== '') {
        metadata.fields[key] = {
          field_name: field.field_name,
          label: field.label,
          type: field.type,
          ...(field.mandatory !== undefined && { mandatory: field.mandatory }),
          ...(field.max_length && { max_length: field.max_length }),
          ...(field.dropdown && { dropdown: field.dropdown }),
          value: field.value.trim()
        };
      }
    });

    // REPEATING GROUPS: dynamic fields
    fieldGroups.forEach((group, groupIndex) => {
      const nameField = group.fields.find(f => f.baseKey === 'field.name');
      if (!nameField?.value?.trim()) return;

      const userLabel = nameField.value.trim();
      const key = userLabel.toLowerCase().replace(/\s+/g, '.');
      const upperLabel = userLabel.toUpperCase();

      metadata.fields[key] = {
        field_name: key.replace(/\./g, '_'),
        label: upperLabel,
        type: 'string', // will override if dropdown
        mandatory: true,
        prompt_text: upperLabel,
        tool_tip: upperLabel
      };

      group.fields.forEach(field => {
        if (!field.value || field.baseKey === 'field.name') return;

        const val = field.value.trim();

        if (field.baseKey === 'max.char') {
          metadata.fields[key].max_length = Number(val);
        } else if (field.baseKey === 'min.char') {
          metadata.fields[key].min_length = Number(val);
        } else if (field.baseKey === 'physical.position') {
          metadata.fields[key].physical_position = val;
        } else if (field.type === 'dropdown') {
          metadata.fields[key].type = 'dropdown';
          metadata.fields[key].dropdown = field.dropdown;
          metadata.fields[key].default_value = val;
        } else if (field.baseKey === 'personal.data') {
          metadata.fields[key].personal_data = val === 'YES' ? 'Y' : 'N';
        } else {
          // Direct mapping: activity.id.1 → activity_id, etc.
          const propKey = field.baseKey.replace(/\./g, '_');
          metadata.fields[key][propKey] = val;
        }
      });
    });

    // Generate JS file
    const varName = application.trim();
    const jsContent = `const ${varName} = ${JSON.stringify(metadata, null, 2)};\n\nexport default ${varName};`;

    const blob = new Blob([jsContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${application.trim().toLowerCase()}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatus({ type: 'success', message: 'Metadata generated and downloaded!' });
    console.log('Generated:', metadata);
  };

  const renderFieldInput = (field, onChange) => {
    const props = { className: 'field-input', value: field.value || '', onChange: e => onChange(e.target.value) };

    if (field.type === 'dropdown') {
      return (
        <select {...props}>
          <option value="">-- Select --</option>
          {(field.dropdownValues || []).map((opt, i) => (
            <option key={i} value={opt.code || opt.id || opt.value || opt}>
              {opt.description || opt.name || opt.label || opt}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === 'textarea') return <textarea {...props} rows={3} />;
    if (field.type === 'checkbox') {
      return (
        <label className="checkbox-container">
          <input type="checkbox" checked={!!field.value} onChange={e => onChange(e.target.checked ? 'YES' : 'NO')} />
          {field.value === 'YES' ? 'YES' : 'NO'}
        </label>
      );
    }
    if (field.type === 'int') return <input type="number" {...props} />;
    return <input type="text" {...props} maxLength={field.max_length} />;
  };

  if (loading) return <div className="loading">Loading ETD Designer...</div>;

  return (
    <div className="etd-root">
      <header className="etd-header"><h1>ETD Designer</h1></header>
      <main className="etd-main">
        {status.message && <div className={`status-message ${status.type}`}>{status.message}</div>}

        <div className="action-buttons">
          <button onClick={() => window.history.back()}>Back</button>
          <button onClick={handleValidate}>Validate</button>
          <button onClick={handleCommit} className="commit">Commit</button>
        </div>

        <div className="form-section">
          <div className="field-grid">
            <div className="field-row">
              <label>Application <span className="required">*</span></label>
              <input value={application} onChange={e => setApplication(e.target.value)} placeholder="cus_v3" />
            </div>
            <div className="field-row">
              <label>Columns</label>
              <select value={columns} onChange={e => setColumns(Number(e.target.value))}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Core Fields (Header & Footer)</h3>
          <div className="field-grid">
            {[...headerFields, ...footerFields].map(field => (
              <div key={field.originalKey} className="field-row">
                <label>{field.label} {field.mandatory && <span className="required">*</span>}</label>
                {renderFieldInput(field, val => updateSingleField(
                  headerFields.includes(field) ? setHeaderFields : setFooterFields,
                  field.originalKey,
                  val
                ))}
                <div className="field-info">Key: <strong>{field.originalKey.replace(/\./g, '_')}</strong></div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Custom Fields ({fieldGroups.length})</h3>
            <button onClick={addFieldGroup}>+ Add Field</button>
          </div>

          {fieldGroups.map((group, gIdx) => {
            const nameVal = group.fields.find(f => f.baseKey === 'field.name')?.value || '';
            const previewKey = nameVal.toLowerCase().replace(/\s+/g, '.');

            return (
              <div key={group.id} className="form-section group-section">
                <div className="section-header">
                  <h4>{group.title}</h4>
                  {previewKey && <div className="field-info">→ <strong>{previewKey}</strong></div>}
                  {fieldGroups.length > 1 && <button onClick={() => removeFieldGroup(group.id)}>Remove</button>}
                </div>
                <div className="field-grid">
                  {group.fields.map(field => (
                    <div key={field.metaKey} className="field-row">
                      <label>
                        {field.label}
                        {field.baseKey === 'field.name' && <span className="required">*</span>}
                      </label>
                      {renderFieldInput(field, val => updateFieldValue(group.id, field.metaKey, val))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}