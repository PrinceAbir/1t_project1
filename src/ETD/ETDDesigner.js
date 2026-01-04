import React, { useState, useEffect, useCallback } from 'react';
import './ETDDesigner.css';

import ActionButtons from '../components/ActionButtons';
import "../components/ActionButtons.css";

import ErrorToast from '../components/ErrorToast';

/* =========================
   COMPONENT IMPORTS
========================= */
import ebTableDefinitionMeta from './EtdFieldsMetaData';
import etdDropdownValues from './EtdDropdownFieldValues';

/* =========================
   CONSTANTS & UTILITIES
========================= */
const FIELD_TYPES = [
  'string', 'text', 'textarea', 'int', 'number', 'float', 'amount', 'currency',
  'date', 'datetime', 'time', 'email', 'tel', 'phone', 'url', 'password',
  'dropdown', 'select', 'radio', 'checkbox', 'multiselect',
  'file', 'image', 'color', 'range', 'hidden',
  'alpha', 'alphanumeric', 'numeric', 'reference', 'account'
];

const COLUMN_OPTIONS = [1, 2, 3];
const DEFAULT_COLUMNS = 2;
const BASE_URL = 'http://localhost:5000/api/applications/etd';

const normalizeDropdownValues = (values = []) =>
  values
    .map(v => {
      if (typeof v === 'string') {
        return { code: v, description: v };
      }
      if (typeof v === 'object' && v !== null) {
        return {
          code: v.code ?? v.id ?? v.value ?? '',
          description: v.description ?? v.name ?? v.label ?? v.code ?? ''
        };
      }
      return null;
    })
    .filter(v => v && v.code);

/* =========================
   CUSTOM HOOKS
========================= */
const useFormData = () => {
  const [formData, setFormData] = useState({
    application: '',
    type: 'core',
    columns: 1,
    applicationId: null,
    isEditing: false
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return { formData, updateFormData };
};

/* =========================
   SUB-COMPONENTS
========================= */
const ColumnLayoutControl = ({ columns, onChange }) => (
  <div className="column-layout-control">
    <label>Layout:</label>
    <div className="column-options">
      {COLUMN_OPTIONS.map(num => (
        <button
          key={num}
          type="button"
          className={`column-btn ${columns === num ? 'active' : ''}`}
          onClick={() => onChange(num)}
          title={`${num} column${num > 1 ? 's' : ''}`}
        >
          {num}
        </button>
      ))}
    </div>
  </div>
);

const FieldInput = ({ field, onChange }) => {
  const { originalKey, label, type, value, dropdownValues, mandatory, field_name } = field;

  const handleChange = (newValue) => {
    onChange(originalKey, newValue);
  };

  const inputId = field_name || originalKey.replace(/\./g, '_');

  const renderInput = () => {
    // Special handling for field.type fields - show FIELD_TYPES dropdown
    if (originalKey.includes('field.type')) {
      return (
        <select
          id={inputId}
          className="dropdown-select"
          value={String(value ?? '')}
          onChange={e => handleChange(e.target.value)}
          aria-label={label}
        >
          <option value="">-- Select Field Type --</option>
          {FIELD_TYPES.map(fieldType => (
            <option key={fieldType} value={fieldType}>
              {fieldType}
            </option>
          ))}
        </select>
      );
    }

    switch (type) {
      case 'dropdown':
        const options = normalizeDropdownValues(dropdownValues);
        return (
          <select
            id={inputId}
            className="dropdown-select"
            value={String(value ?? '')}
            onChange={e => handleChange(e.target.value)}
            aria-label={label}
          >
            <option value="">-- Select --</option>
            {options.map(opt => (
              <option key={`${originalKey}-${opt.code}`} value={opt.code}>
                {opt.description}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={inputId}
            className="textarea-input"
            value={value}
            onChange={e => handleChange(e.target.value)}
            rows={2}
            aria-label={label}
          />
        );

      case 'int':
      case 'number':
        return (
          <input
            id={inputId}
            type="number"
            className="number-input"
            value={value}
            onChange={e => handleChange(e.target.value)}
            aria-label={label}
          />
        );

      case 'checkbox':
        return (
          <input
            id={inputId}
            type="checkbox"
            className="checkbox-input"
            checked={value === 'YES' || value === 'true' || value === true}
            onChange={e => handleChange(e.target.checked ? 'YES' : 'NO')}
            aria-label={label}
          />
        );

      default:
        return (
          <input
            id={inputId}
            type="text"
            className="text-input"
            value={value}
            onChange={e => handleChange(e.target.value)}
            aria-label={label}
          />
        );
    }
  };

  return (
    <div className="field-item">
      <label className="field-label">
        {label}
        {mandatory && <span className="required">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};

const FieldGroup = ({ 
  group, 
  onFieldChange,
  onRemove,
  layoutColumns // Add this prop
}) => (
  <div className="field-group">
    <div className="group-header">
      <h4>{group.title}</h4>
      <div className="group-actions">
        <button 
          type="button" 
          className="btn-danger"
          onClick={onRemove}
        >
          Remove Group
        </button>
      </div>
    </div>
    
    <div className={`field-grid columns-${layoutColumns}`}> {/* Use layoutColumns here */}
      {group.fields.map(field => (
        <FieldInput
          key={field.originalKey}
          field={field}
          onChange={(key, value) => onFieldChange(group.id, key, value)}
        />
      ))}
    </div>
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */
export default function ETDDesigner() {
  const { formData, updateFormData } = useFormData();
  const [layoutColumns, setLayoutColumns] = useState(DEFAULT_COLUMNS);
  const [headerFields, setHeaderFields] = useState([]);
  const [footerFields, setFooterFields] = useState([]);
  const [fieldGroups, setFieldGroups] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [toastError, setToastError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     TOAST HANDLERS
  ========================= */
  const showToastError = (message) => {
    setToastError({ message });
  };

  const closeToast = () => {
    setToastError(null);
  };

  /* =========================
     GET REPEATING TEMPLATE FOR CUSTOM FIELDS
  ========================= */
  const getRepeatingTemplate = useCallback(() => {
    // These are the field definition fields from the JSON
    const fieldDefinitionKeys = Object.keys(ebTableDefinitionMeta.fields)
      .filter(key => key.includes('.1') && 
        !['add.special.fields.1', 'rule.name.1', 'rule.1'].includes(key));
    
    const template = [];
    
    // Add field.type field first (missing from your metadata)
    template.push({
      originalKey: 'field.type.1',
      label: 'Field Type',
      type: 'dropdown',
      value: '',
      dropdownValues: FIELD_TYPES.map(type => ({ code: type, description: type })),
      mandatory: true,
      field_name: 'field_type_1'
    });
    
    // Add field.name field
    template.push({
      originalKey: 'field.name.1',
      label: 'Field Name',
      type: 'string',
      value: '',
      mandatory: true,
      field_name: 'field_name_1'
    });
    
    fieldDefinitionKeys.forEach(key => {
      const config = ebTableDefinitionMeta.fields[key];
      let dropdownValues = [];
      
      if (config.type === 'dropdown' && config.dropdown?.source) {
        dropdownValues = normalizeDropdownValues(
          etdDropdownValues[config.dropdown.source]
        );
      }

      // Create field object without dropdown config
      const fieldObj = {
        originalKey: key,
        label: config.label,
        type: config.type,
        value: '',
        dropdownValues,
        mandatory: config.mandatory || false,
        field_name: config.field_name || key.replace(/\./g, '_'),
        // Copy all other properties from config except dropdown
        ...Object.keys(config).reduce((acc, propKey) => {
          if (propKey !== 'dropdown' && propKey !== 'field_name' && propKey !== 'label' && propKey !== 'type') {
            acc[propKey] = config[propKey];
          }
          return acc;
        }, {})
      };

      template.push(fieldObj);
    });

    return template;
  }, []);

  /* =========================
     INITIALIZATION - ORGANIZE FIELDS PROPERLY
  ========================= */
  useEffect(() => {
    const initializeFields = () => {
      const header = [];
      const footer = [];
      const fieldDefinitionKeys = [];

      // Add Application Name field as the first header field
      header.push({
        originalKey: 'application.name',
        field_name: 'application_name',
        label: 'Application Name',
        type: 'string',
        value: '',
        mandatory: true,
        max_length: 100
      });

      // Organize other fields based on the JSON structure
      Object.entries(ebTableDefinitionMeta.fields).forEach(([key, config]) => {
        let dropdownValues = [];
        if (config.type === 'dropdown' && config.dropdown?.source) {
          dropdownValues = normalizeDropdownValues(
            etdDropdownValues[config.dropdown.source]
          );
        }

        // Create field object without dropdown config in the main object
        const field = {
          ...Object.keys(config).reduce((acc, propKey) => {
            if (propKey !== 'dropdown') {
              acc[propKey] = config[propKey];
            }
            return acc;
          }, {}),
          value: '',
          originalKey: key,
          dropdownValues,
          field_name: config.field_name || key.replace(/\./g, '_')
        };

        // Header fields
        if (['act.desc', 'product'].includes(key)) {
          header.push(field);
        }
        // Footer fields (all others except field definition fields with .1)
        else if (!key.includes('.1') || 
                 key === 'add.special.fields.1' || 
                 key === 'rule.name.1' || 
                 key === 'rule.1') {
          footer.push(field);
        }
        // Field definition fields (will be in custom field groups)
        else if (key.includes('.1')) {
          fieldDefinitionKeys.push(key);
        }
      });

      setHeaderFields(header);
      setFooterFields(footer);
      
      // Initialize first custom field group with template fields
      const firstGroupFields = getRepeatingTemplate();
      setFieldGroups([
        {
          id: Date.now(),
          title: 'Field Definition 1',
          fields: firstGroupFields
        }
      ]);

      setLoading(false);
    };

    initializeFields();
  }, [getRepeatingTemplate]);

  /* =========================
     FIELD HANDLERS
  ========================= */
  const updateGroupFieldValue = (groupId, key, value) => {
    setFieldGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? {
              ...g,
              fields: g.fields.map(f =>
                f.originalKey === key ? { ...f, value: String(value) } : f
              )
            }
          : g
      )
    );
  };

  const updateHeaderField = (key, value) => {
    setHeaderFields(prev =>
      prev.map(f =>
        f.originalKey === key ? { ...f, value: String(value) } : f
      )
    );
    
    // Update formData when Application Name changes
    if (key === 'application.name') {
      updateFormData('application', value);
    }
  };

  const updateFooterField = (key, value) => {
    setFooterFields(prev =>
      prev.map(f =>
        f.originalKey === key ? { ...f, value: String(value) } : f
      )
    );
  };

  const addFieldGroup = () => {
    const templateFields = getRepeatingTemplate();
    const groupNumber = fieldGroups.length + 1;
    
    const newGroupFields = templateFields.map(f => {
      // Get base key (remove .1 or .number suffix)
      let baseKey = f.originalKey;
      if (baseKey.includes('.1')) {
        baseKey = baseKey.replace(/\.\d+$/, '');
      }
      
      const newOriginalKey = `${baseKey}.${groupNumber}`;
      
      // Update field_name with correct suffix
      let newFieldName = '';
      if (f.field_name) {
        if (f.field_name.includes('_1')) {
          newFieldName = f.field_name.replace(/_1$/, `_${groupNumber}`);
        } else {
          newFieldName = `${f.field_name}_${groupNumber}`;
        }
      } else {
        newFieldName = `${baseKey.replace(/\./g, '_')}_${groupNumber}`;
      }
      
      // Update label to show group number for some fields
      let newLabel = f.label;
      if (!f.originalKey.includes('field.type') && !f.originalKey.includes('field.name')) {
        newLabel = `${f.label} ${groupNumber}`;
      }
      
      return { 
        ...f, 
        value: '',
        originalKey: newOriginalKey,
        field_name: newFieldName,
        label: newLabel
      };
    });
    
    const newGroup = {
      id: Date.now(),
      title: `Field Definition ${groupNumber}`,
      fields: newGroupFields
    };
    setFieldGroups(prev => [...prev, newGroup]);
  };

  const removeFieldGroup = (groupId) => {
    if (fieldGroups.length > 1) {
      setFieldGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  /* =========================
     LOAD EXISTING DATA
  ========================= */
  const fetchApplicationData = useCallback(async (appName) => {
    if (!appName.trim()) return;
    
    try {
      const response = await fetch(`${BASE_URL}?application=${encodeURIComponent(appName.trim())}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.application) {
          populateFormWithData(data);
          updateFormData('applicationId', data.id || data._id);
          updateFormData('isEditing', true);
          setStatus({ type: 'info', message: `Loaded existing application: ${appName}` });
        } else {
          updateFormData('isEditing', false);
          updateFormData('applicationId', null);
        }
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      showToastError('Failed to load application data');
    }
  }, [updateFormData]);

  const populateFormWithData = useCallback((data) => {
    // Set application name
    const appNameField = headerFields.find(f => f.originalKey === 'application.name');
    if (appNameField && data.application) {
      updateHeaderField('application.name', data.application);
    }

    // Populate top-level header fields (act_desc, product)
    headerFields.forEach(field => {
      if (field.originalKey === 'act.desc' && data.act_desc !== undefined) {
        updateHeaderField('act.desc', data.act_desc);
      }
      if (field.originalKey === 'product' && data.product !== undefined) {
        updateHeaderField('product', data.product);
      }
    });

    // Populate top-level footer fields
    const topLevelFooterFields = [
      'file.type', 'calculation', 'link.to.wfl', 'ns.operation', 'key.field', 
      'insert.layout', 'add.special.fields.1', 'class.type', 'rule.name.1', 
      'rule.1', 'pgm.type', 'table.owner', 'tabletest'
    ];
    
    footerFields.forEach(field => {
      const key = field.originalKey.replace(/\./g, '_');
      if (topLevelFooterFields.includes(field.originalKey) && data[key] !== undefined) {
        updateFooterField(field.originalKey, data[key]);
      }
    });

    // Populate custom fields from the fields object
    if (data.fields) {
      const newFieldGroups = [];
      let groupIndex = 1;
      
      Object.entries(data.fields).forEach(([fieldName, fieldData]) => {
        const templateFields = getRepeatingTemplate();
        const groupFields = templateFields.map(templateField => {
          const newField = { ...templateField };
          const baseKey = templateField.originalKey.replace(/\.\d+$/, '');
          const newOriginalKey = `${baseKey}.${groupIndex}`;
          
          // Update field_name with correct suffix
          let newFieldName = '';
          if (templateField.field_name) {
            if (templateField.field_name.includes('_1')) {
              newFieldName = templateField.field_name.replace(/_1$/, `_${groupIndex}`);
            } else {
              newFieldName = `${templateField.field_name}_${groupIndex}`;
            }
          }
          
          // Set field name
          if (baseKey === 'field.name') {
            newField.value = fieldName;
          } else if (baseKey === 'field.type') {
            // Set field type from fieldData.type
            if (fieldData.type) {
              newField.value = fieldData.type;
            }
          } else {
            // Find the property in the fieldData
            const propertyName = `${baseKey}.${groupIndex}`;
            if (fieldData[propertyName] !== undefined) {
              newField.value = fieldData[propertyName];
            }
            
            // Special handling for personal.data
            if (baseKey === 'personal.data' && fieldData[propertyName] !== undefined) {
              newField.value = fieldData[propertyName] === 'Y' ? 'YES' : 'NO';
            }
          }
          
          return {
            ...newField,
            originalKey: newOriginalKey,
            field_name: newFieldName || newOriginalKey.replace(/\./g, '_'),
            label: templateField.label
          };
        });
        
        newFieldGroups.push({
          id: Date.now() + groupIndex,
          title: `Field Definition ${groupIndex}`,
          fields: groupFields
        });
        
        groupIndex++;
      });
      
      if (newFieldGroups.length > 0) {
        setFieldGroups(newFieldGroups);
      }
    }
  }, [headerFields, footerFields, getRepeatingTemplate, updateHeaderField, updateFooterField]);

  // Monitor application name changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.application && formData.application.trim()) {
        fetchApplicationData(formData.application);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.application, fetchApplicationData]);

  /* =========================
     ACTION BUTTON HANDLERS
  ========================= */
  const handleBack = () => {
    if (window.confirm('Are you sure? Unsaved changes will be lost.')) {
      window.history.back();
    }
  };

  const handleHold = () => {
    // Save as draft locally
    const draftData = {
      headerFields: headerFields.map(f => ({ key: f.originalKey, value: f.value })),
      footerFields: footerFields.map(f => ({ key: f.originalKey, value: f.value })),
      fieldGroups: fieldGroups.map(g => ({
        title: g.title,
        fields: g.fields.map(f => ({ key: f.originalKey, value: f.value }))
      }))
    };
    localStorage.setItem('etdDesignerDraft', JSON.stringify(draftData));
    setStatus({ type: 'info', message: 'Design saved as draft.' });
  };

  const handleValidate = () => {
    setStatus({ type: '', message: '' });
    const errors = {};
    const toastErrors = [];

    // Validate mandatory header fields
    headerFields.forEach(field => {
      if (field.mandatory && !field.value.trim()) {
        const errMsg = `${field.label} is required`;
        errors[field.originalKey] = errMsg;
        toastErrors.push({ field: field.field_name || field.originalKey.replace(/\./g, '_'), message: errMsg });
      }
    });

    // Validate mandatory footer fields
    footerFields.forEach(field => {
      if (field.mandatory && !field.value.trim()) {
        const errMsg = `${field.label} is required`;
        errors[field.originalKey] = errMsg;
        toastErrors.push({ field: field.field_name || field.originalKey.replace(/\./g, '_'), message: errMsg });
      }
    });

    // Validate field groups
    fieldGroups.forEach((group, groupIndex) => {
      group.fields.forEach(field => {
        if (field.mandatory && !field.value.trim()) {
          const errMsg = `${field.label} in ${group.title} is required`;
          errors[`${group.id}-${field.originalKey}`] = errMsg;
          toastErrors.push({ field: field.field_name || field.originalKey.replace(/\./g, '_'), message: errMsg });
        }
      });
    });

    if (toastErrors.length > 0) {
      setToastError({ message: toastErrors });
      // setValidationErrors(errors);
      // setStatus({ 
      //   type: 'error', 
      //   message: `Validation failed with ${toastErrors.length} error(s)` 
      // });
      return false;
    } else {
      setValidationErrors({});
      setStatus({ 
        type: 'success', 
        message: 'Validation passed!' 
      });
      return true;
    }
  };

  const handleDelete = async () => {
    if (!formData.applicationId || !formData.application.trim()) {
      showToastError('No application to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete application "${formData.application}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/${formData.applicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Application deleted successfully' });
        // Reset form
        updateFormData('applicationId', null);
        updateFormData('isEditing', false);
        
        // Reset all fields to empty
        headerFields.forEach(field => updateHeaderField(field.originalKey, ''));
        footerFields.forEach(field => updateFooterField(field.originalKey, ''));
        
        // Reset field groups to default
        const templateFields = getRepeatingTemplate();
        const defaultGroupFields = templateFields.map(f => ({ ...f, value: '' }));
        
        setFieldGroups([
          {
            id: Date.now(),
            title: 'Field Definition 1',
            fields: defaultGroupFields
          }
        ]);
        
      } else {
        const error = await response.json();
        showToastError(error.message || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      showToastError('Error deleting application');
    }
  };

  const handleCommit = async () => {
    setSaving(true);
    
    // First validate
    const isValid = handleValidate();
    if (!isValid) {
      setSaving(false);
      return;
    }

    // Get application name from header fields
    const applicationNameField = headerFields.find(f => f.originalKey === 'application.name');
    const applicationName = applicationNameField?.value?.trim() || "new_application";
    
    if (!applicationNameField?.value?.trim()) {
      showToastError('Application Name is required');
      setSaving(false);
      return;
    }

    // Prepare JSON data structure matching the desired format
    const jsonToSave = {
      application: applicationName,
      type: formData.type,
      columns: formData.columns,
      createdAt: new Date().toISOString()
    };

    // Add header fields as top-level properties (except application.name)
    headerFields.forEach(field => {
      if (field.originalKey !== 'application.name' && field.value !== undefined && field.value !== '') {
        const key = field.originalKey.replace(/\./g, '_');
        jsonToSave[key] = field.value;
      }
    });

    // Add specific footer fields as top-level properties
    const topLevelFooterFields = [
      'file.type', 'calculation', 'link.to.wfl', 'ns.operation', 'key.field', 
      'insert.layout', 'add.special.fields.1', 'class.type', 'rule.name.1', 
      'rule.1', 'pgm.type', 'table.owner', 'tabletest'
    ];
    
    footerFields.forEach(field => {
      if (topLevelFooterFields.includes(field.originalKey) && field.value !== undefined && field.value !== '') {
        const key = field.originalKey.replace(/\./g, '_');
        jsonToSave[key] = field.value;
      }
    });

    // Prepare fields object for custom field groups
    jsonToSave.fields = {};

    // Process field groups - each group creates one entry in the fields object
    fieldGroups.forEach((group, groupIndex) => {
      // Find the field name for this group
      const fieldNameField = group.fields.find(f => f.originalKey.includes('field.name.'));
      if (!fieldNameField || !fieldNameField.value.trim()) return;

      const fieldName = fieldNameField.value.trim(); // e.g., "NAME.1", "SHORT.NAME"
      const fieldNum = groupIndex + 1; // 1-based index for suffix
      
      // Initialize the field object
      const fieldObj = {
        type: 'string', // Default type, will be overridden
        label: fieldName.toUpperCase()
      };

      // Get field type from field.type field
      const fieldTypeField = group.fields.find(f => f.originalKey.includes('field.type.'));
      if (fieldTypeField && fieldTypeField.value.trim()) {
        fieldObj.type = fieldTypeField.value.trim();
      }

      // Process all fields in this group
      group.fields.forEach(field => {
        if (!field.value || field.originalKey.includes('field.name.') || field.originalKey.includes('field.type.')) return;

        const value = field.value.trim();
        const baseKey = field.originalKey.replace(/\.\d+$/, ''); // Remove any existing number suffix
        
        // Determine the property name with correct suffix
        let propertyName;
        
        // Map field.originalKey to property name with group number
        if (baseKey === 'description') {
          propertyName = `description.${fieldNum}`;
        } else if (baseKey === 'prompt.text') {
          propertyName = `prompt.text.${fieldNum}`;
        } else if (baseKey === 'tool.tip') {
          propertyName = `tool.tip.${fieldNum}`;
        } else if (baseKey === 'availability.1') {
          propertyName = `availability.1.${fieldNum}`;
        } else if (baseKey === 'activity.id') {
          propertyName = `activity.id.${fieldNum}`;
        } else if (baseKey === 'activity.fld') {
          propertyName = `activity.fld.${fieldNum}`;
        } else if (baseKey === 'max.char') {
          propertyName = `max.char.${fieldNum}`;
        } else if (baseKey === 'min.char') {
          propertyName = `min.char.${fieldNum}`;
        } else if (baseKey === 'ccy.activity') {
          propertyName = `ccy.activity.${fieldNum}`;
        } else if (baseKey === 'ccy.act.fld') {
          propertyName = `ccy.act.fld.${fieldNum}`;
        } else if (baseKey === 'vetting.table.1') {
          propertyName = `vetting.table.1.${fieldNum}`;
        } else if (baseKey === 'appl.vet') {
          propertyName = `appl.vet.${fieldNum}`;
        } else if (baseKey === 'appl.enrich.fld') {
          propertyName = `appl.enrich.fld.${fieldNum}`;
        } else if (baseKey === 'def.value') {
          propertyName = `def.value.${fieldNum}`;
        } else if (baseKey === 'fld.property') {
          propertyName = `fld.property.${fieldNum}`;
        } else if (baseKey === 'masking.fmt') {
          propertyName = `masking.fmt.${fieldNum}`;
        } else if (baseKey === 'virtual.table') {
          propertyName = `virtual.table.${fieldNum}`;
        } else if (baseKey === 'sub.assoc.code') {
          propertyName = `sub.assoc.code.${fieldNum}`;
        } else if (baseKey === 'rel.date.field') {
          propertyName = `rel.date.field.${fieldNum}`;
        } else if (baseKey === 'rel.currency.field') {
          propertyName = `rel.currency.field.${fieldNum}`;
        } else if (baseKey === 'fld.product') {
          propertyName = `fld.product.${fieldNum}`;
        } else if (baseKey === 'physical.position') {
          propertyName = `physical.position.${fieldNum}`;
        } else if (baseKey === 'field.owner') {
          propertyName = `field.owner.${fieldNum}`;
        } else if (baseKey === 'personal.data') {
          propertyName = `personal.data.${fieldNum}`;
          fieldObj[propertyName] = value === 'YES' ? 'Y' : 'N';
          return; // Skip to next field
        } else if (baseKey === 'attributes') {
          propertyName = `attributes.${fieldNum}`;
        } else if (baseKey === 'purpose') {
          propertyName = `purpose.${fieldNum}`;
        } else if (baseKey === 'erase.option') {
          propertyName = `erase.option.${fieldNum}`;
        } else if (baseKey === 'accessibility') {
          propertyName = `accessibility.${fieldNum}`;
        } else {
          // For any other field, use the base key with suffix
          propertyName = `${baseKey}.${fieldNum}`;
        }
        
        // Set the property value
        fieldObj[propertyName] = value;
      });

      // Only add the field if it has properties
      if (Object.keys(fieldObj).length > 0) {
        jsonToSave.fields[fieldName] = fieldObj;
      }
    });

    try {
      console.log('Saving JSON:', JSON.stringify(jsonToSave, null, 2));
      
      let url = BASE_URL;
      let method = 'POST';
      
      // If editing existing, use PUT with ID
      if (formData.isEditing && formData.applicationId) {
        url = `${BASE_URL}/${formData.applicationId}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonToSave)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check if it's a duplicate error
        if (response.status === 409 || errorText.includes('already exists') || errorText.includes('duplicate')) {
          throw new Error(`ETD with name "${applicationName}" already exists. Please use a different Application Name.`);
        }
        
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Save response:', result);
      
      if (result.id) {
        updateFormData('applicationId', result.id);
        updateFormData('isEditing', true);
      }
      
      setStatus({ 
        type: 'success', 
        message: `Design "${applicationName}" ${formData.isEditing ? 'updated' : 'saved'} successfully!` 
      });

    } catch (error) {
      console.error('Error saving design:', error);
      showToastError(error.message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     STATUS DISPLAY
  ========================= */
  const renderStatus = () => {
    if (!status.message) return null;
    
    return (
      <div className={`status-message ${status.type}`}>
        {status.message}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading ETD Designer...</div>
      </div>
    );
  }

  return (
    <div className="etd-designer">
      {/* ERROR TOAST */}
      {toastError && (
        <ErrorToast
          message={toastError.message}
          onClose={closeToast}
        />
      )}

      {/* HEADER */}
      <div className="designer-header">
        <h1>ETD Designer</h1>
      </div>

      {/* ACTION BUTTONS */}
      <ActionButtons 
        onBack={handleBack}
        onHold={handleHold}
        onValidate={handleValidate}
        onCommit={handleCommit}
      />

      {renderStatus()}

      {/* CORE FIELDS SECTION */}
      <section className="form-section">
        <div className="section-header">
          <h3>Core Fields</h3>
        </div>
        
        {/* Header Fields */}
        {headerFields.length > 0 && (
          <div className="field-subsection">
            <h4>Header</h4>
            <div className={`field-grid columns-${layoutColumns}`}>
              {headerFields.map(field => (
                <FieldInput
                  key={field.originalKey}
                  field={field}
                  onChange={updateHeaderField}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer Fields (includes add.special.fields.1) */}
        {footerFields.length > 0 && (
          <div className="field-subsection">
            <h4>Footer</h4>
            <div className={`field-grid columns-${layoutColumns}`}>
              {footerFields.map(field => (
                <FieldInput
                  key={field.originalKey}
                  field={field}
                  onChange={updateFooterField}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FIELDS SECTION */}
      <section className="form-section">
        <div className="section-header-with-button">
          <h3>Fields</h3>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={addFieldGroup}
          >
            Add Custom Field
          </button>
        </div>
        
        <div className="field-groups-container">
          {fieldGroups.map((group) => (
            <FieldGroup
              key={group.id}
              group={group}
              onFieldChange={updateGroupFieldValue}
              onRemove={fieldGroups.length > 1 ? () => removeFieldGroup(group.id) : null}
              layoutColumns={layoutColumns} 
            />
          ))}
        </div>
      </section>

      {/* VALIDATION ERRORS */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="validation-errors">
          <h4>Validation Errors:</h4>
          <ul>
            {Object.entries(validationErrors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}