// src/services/DataTransformer.js (updated: handle edge cases like empty fields, better type mapping)
class DataTransformer {
  // Convert metadata to T24 field array for UI
  static metadataToT24Fields(metadata) {
    if (!metadata?.fields) return []; // Edge: no fields

    if (Array.isArray(metadata.fields)) {
      return metadata.fields.map((field) => this.transformField(field));
    }

    // Object structure
    return Object.keys(metadata.fields).map((key) => {
      const field = metadata.fields[key];
      return this.transformField({
        ...field,
        t24_field: key, // Keep original T24 field name
        id: field.field_name,
        name: field.field_name,
      });
    });
  }

  static transformField(field) {
    // handle group-type fields (nested children) specially
    const isGroup = field.type === 'group' || field.group === true || Array.isArray(field.fields);

    if (isGroup) {
      const childrenSource = field.fields || field.children || [];
      const children = childrenSource.map((ch) => ({
        id: ch.field_name || ch.name,
        name: ch.field_name || ch.name,
        label: ch.label,
        type: this.mapFieldType(ch.type, ch),
        metadata: {
          required: ch.mandatory || false,
          min: ch.min_length,
          max: ch.max_length,
          options: ch.options || [],
        },
        ...ch,
      }));

      // default value for a single group entry
      const defaultEntry = children.reduce((acc, c) => ({ ...acc, [c.id]: '' }), {});

      return {
        id: field.name,
        label: field.label,
        name: field.name,
        type: 'group',
        multi: field.multivalued || field.multi || false,
        value: field.multivalued ? [defaultEntry] : defaultEntry,
        metadata: {
          required: field.mandatory || false,
          multi: field.multivalued || false,
          min: field.min_length,
          max: field.max_length,
          options: field.options || [],
          max_multifield: field.max_multifield,
          children,
          fieldType: 'GROUP',
          t24Field: field.t24_field || field.name.toUpperCase().replace(/_/g, "."),
        },
        children,
        ...field,
      };
    }

    const isMulti = !!(field.multivalued || field.multi);
    const fieldId = field.id || field.field_name || field.name;
    const value = isMulti ? (field.value || [""]) : (field.value ?? "");

    return {
      // preserve original raw data first
      ...field,
      // normalized properties (override spread if present)
      id: fieldId,
      name: fieldId,
      required: field.mandatory || false,
      label: field.label,
      type: this.mapFieldType(field.type, field),
      value,
      multi: isMulti,
      metadata: {
        required: field.mandatory || false,
        multi: isMulti,
        min: field.min_length,
        max: field.max_length,
        options: field.options || [],
        max_multifield: field.max_multifield,
        fieldType: this.getFieldType(field),
        t24Field:
          field.t24_field || (fieldId ? fieldId.toUpperCase().replace(/_/g, ".") : undefined),
      },
    };
  }

  static mapFieldType(type, field) {
    if (type === "dropdown") return "dropdown";
    if (type === "select" || field.options?.length > 0) return "select";
    if (type === "file") return "file";
    if (type === "date") return "date";
    if (type === "textarea") return "textarea";
    if (type === "amount" || type === "number") return "number";
    if (type === "email") return "email";
    if (type === "tel") return "tel";
    if (type === "reference") return "text";
    if (type === "account") return "select";
    if (type === "string") return "text";
    if (type === "int") return "number";
    
    return "text"; // Default edge case
  }

  static getFieldType(field) {
    if (field.options?.length > 0 || field.type === "account" || field.type === "dropdown")
      return "DROPDOWN";
    if (field.type === "amount" || field.type === "number") return "NUMBER";
    if (field.type === "email") return "EMAIL";
    if (field.type === "tel") return "TEL";
    if (field.type === "date") return "DATE";
    if (field.type === "file") return "FILE";
    if (field.type === "textarea") return "TEXTAREA";
    if (field.type === "reference") return "REFERENCE";
    if (field.multivalued) return "MULTI_INPUT";
    return "INPUT";
  }

  static toT24Submission(data, metadata) {
    const submission = {
      transactionId: `FT/${Date.now()}`,
      timestamp: new Date().toISOString(),
      fields: {},
    };

    const fieldsArray = Array.isArray(metadata.fields)
      ? metadata.fields
      : Object.keys(metadata.fields || {}).map((key) => ({ // Edge: empty fields
          ...metadata.fields[key],
          id: metadata.fields[key].field_name,
        }));

    fieldsArray.forEach((field) => {
      const fieldId = field.id;
      const value = data[fieldId];
      if (field.multivalued && Array.isArray(value)) {
        submission.fields[field.t24_field || fieldId.toUpperCase()] =
          value.filter((v) => v && v.toString().trim());
      } else if (value && value.toString().trim()) {
        submission.fields[field.t24_field || fieldId.toUpperCase()] = value;
      }
    });

    return submission;
  }
}

export default DataTransformer;