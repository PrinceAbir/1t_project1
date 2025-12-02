// services/DataTransformer.js
class DataTransformer {
  // Convert metadata to T24 field format
  static metadataToT24Fields(metadata) {
    return metadata.fields.map(field => ({
      id: field.name,
      label: field.label,
      name: field.name,
      type: this.mapFieldType(field.type, field),
      value: field.multi ? [''] : '',
      metadata: {
        required: field.required || false,
        multi: field.multi || false,
        min: field.min,
        max: field.max,
        options: field.options || [],
        inputable: field.inputable || false,
        dropdown: field.dropdown || false,
        dropdownType: field.dropdownType,
        dropdownName: field.dropdownName,
        max_multifield: field.max_multifield,
        hotfield: field.hotfield || false,
        fieldType: this.getFieldType(field),
        t24Field: field.name.toUpperCase().replace(/_/g, '.')
      },
      // Pass all original properties for complete support
      ...field
    }));
  }

  static mapFieldType(type, field) {
    if (field.dropdown) return 'select';
    if (field.options && field.options.length > 0) return 'select';
    if (type === 'file') return 'file';
    if (type === 'date') return 'date';
    if (type === 'textarea') return 'textarea';
    if (type === 'amount' || type === 'number') return 'number';
    if (type === 'email') return 'email';
    if (type === 'tel') return 'tel';
    if (type === 'reference') return 'text';
    if (type === 'account') return 'select';
    if (type === 'string') return 'text';
    return 'text';
  }

  static getFieldType(field) {
    if (field.dropdown || field.type === 'account') return 'DROPDOWN';
    if (field.type === 'amount' || field.type === 'number') return 'NUMBER';
    if (field.type === 'email') return 'EMAIL';
    if (field.type === 'tel') return 'TEL';
    if (field.type === 'date') return 'DATE';
    if (field.type === 'file') return 'FILE';
    if (field.type === 'textarea') return 'TEXTAREA';
    if (field.type === 'reference') return 'REFERENCE';
    if (field.multi) return 'MULTI_INPUT';
    if (field.options && field.options.length > 0) return 'SELECT';
    return 'INPUT';
  }

  // Convert form data to T24 submission format
  static toT24Submission(data, metadata) {
    const submission = {
      transactionId: `FT/${Date.now()}`,
      timestamp: new Date().toISOString(),
      fields: {}
    };

    metadata.fields.forEach(field => {
      const fieldId = field.id || field.name;
      const value = data[fieldId];
      if (field.multi && Array.isArray(value)) {
        submission.fields[fieldId] = value.filter(v => v && v.toString().trim());
      } else if (value && value.toString().trim()) {
        submission.fields[fieldId] = value;
      }
    });

    return submission;
  }
}

export default DataTransformer;