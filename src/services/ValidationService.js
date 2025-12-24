// src/services/ValidationService.js (updated: added more edge cases like empty arrays for multi, NaN checks)
class ValidationService {
  static validateField(field, value) {
    // normalize common metadata names so callers can use either
    const normalizedField = Object.assign({}, field, {
      required: field.required ?? field.mandatory,
      multivalued: field.multivalued ?? field.multi,
    });

    const isMulti = !!normalizedField.multivalued;
    if (isMulti) {
      return this.validateMultiField(normalizedField, value);
    }
    return this.validateSingleField(normalizedField, value);
  }

  static validateSingleField(field, value) {
    const { label, type, min, max, pattern, decimals } = field;
    const required = field.required ?? field.mandatory;
    const val = value !== undefined && value !== null ? value.toString().trim() : '';

    // Required validation
    if (required && !val) {
      return `${label} is required`;
    }

    // Skip further validation if not required and empty
    if (!required && !val) {
      return '';
    }

    // Type-specific validation
    switch (type) {
      case 'string':
      case 'textarea':
      case 'reference':
        return this.validateString(val, label, min, max, pattern);

      case 'account':
        return this.validateString(val, label, min, max);

      case 'email': {
        const stringError = this.validateString(val, label, min, max);
        if (stringError) return stringError;
        return this.validateEmail(val, label);
      }

      case 'tel': {
        const telStringError = this.validateString(val, label, min, max);
        if (telStringError) return telStringError;
        return this.validateTel(val, label, pattern);
      }

      case 'amount':
      case 'number':
        return this.validateNumber(val, label, min, max, decimals);

      case 'date':
        return this.validateDate(val, label);

      case 'file':
        return this.validateFile(val, label);

      default:
        return this.validateString(val, label, min, max, pattern);
    }
  }

  static validateMultiField(field, values) {
    const { label } = field;
    const required = field.required ?? field.mandatory;
    const max_multifield = field.max_multifield ?? field.maxMultifield;
    const vals = Array.isArray(values) ? values : [];

    // If there are no values:
    if (vals.length === 0) {
      if (required) {
        // return single array entry pointing to index 0
        return [`${label} requires at least one entry`];
      }
      return [];
    }

    // Build per-index error array ('' means no error)
    const errors = new Array(vals.length).fill('');

    // Determine if all entries are empty
    const allEmpty = vals.length > 0 && vals.every(v => !v || v.toString().trim() === '');
    if (required && allEmpty) {
      for (let i = 0; i < vals.length; i++) {
        errors[i] = `Entry ${i + 1}: ${label} is required`;
      }
      // we still continue to allow type-specific checks to overwrite more specific messages
    }

    // Validate each entry using single-field rules; for empty entries if required, mark error per-index
    for (let i = 0; i < vals.length; i++) {
      const val = vals[i];
      const isEmpty = val === undefined || val === null || val.toString().trim() === '';
      if (isEmpty) {
        if (required) {
          errors[i] = errors[i] || `Entry ${i + 1}: ${label} is required`;
        }
        continue;
      }

      const err = this.validateSingleField(field, val);
      if (err) {
        errors[i] = `Entry ${i + 1}: ${err}`;
      }
    }

    // Check max_multifield limit
    if (max_multifield && vals.length > max_multifield) {
      // add general error at index 0 (or push to errors[0])
      errors[0] = `${label} cannot have more than ${max_multifield} entries`;
    }

    return errors;
  }

  static validateString(value, label, min, max, pattern) {
    if (min !== undefined && value.length < min) {
      return `${label} must be at least ${min} characters`;
    }

    if (max !== undefined && value.length > max) {
      return `${label} must be at most ${max} characters`;
    }

    if (pattern) {
      try {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return `${label} format is invalid`;
        }
      } catch (e) {
        console.error(`Invalid regex pattern for ${label}:`, pattern);
      }
    }

    return '';
  }

  static validateEmail(value, label) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${label} must be a valid email address`;
    }
    return '';
  }

  static validateTel(value, label, pattern) {
    if (pattern) {
      try {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return `${label} format is invalid`;
        }
      } catch (e) {
        console.error(`Invalid regex pattern for ${label}:`, pattern);
      }
    } else {
      if (!/\d/.test(value)) {
        return `${label} must contain at least one digit`;
      }
    }
    return '';
  }

  static validateNumber(value, label, min, max, decimals) {
    const num = Number(value);

    if (isNaN(num)) { // Edge: NaN check
      return `${label} must be a valid number`;
    }

    if (min !== undefined && num < min) {
      return `${label} must be at least ${min}`;
    }

    if (max !== undefined && num > max) {
      return `${label} must be at most ${max}`;
    }

    if (decimals !== undefined) {
      const decimalPattern = new RegExp(`^-?\\d+(\\.\\d{1,${decimals}})?$`);
      if (!decimalPattern.test(value)) {
        return `${label} can have at most ${decimals} decimal places`;
      }
    }

    return '';
  }

  static validateDate(value, label) {
    if (!value) {
      return `${label} is required`;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return `${label} must be in valid date format`;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${label} must be a valid date`;
    }

    return '';
  }

  static validateFile(value, label) {
    // Minimal file validation; extend as needed
    if (!value) {
      return '';
    }
    return '';
  }

  static validateAllFields(fields, data) {
    // returns an errors object where:
    // - for single fields: errors[field.name] = '' or 'message'
    // - for multi fields: errors[field.name] = [] (array of per-index messages) OR [] empty if none
    const errors = {};
    let isValid = true;

    fields.forEach(field => {
      const name = field.name;
      const val = data ? data[name] : undefined;
      const error = this.validateField(field, val);

      // normalize: if validateMultiField returned undefined -> set [] (no errors)
      if (Array.isArray(error)) {
        // check if any non-empty in array
        const hasAny = error.some(e => e && e.toString().trim() !== '');
        if (hasAny) isValid = false;
        errors[name] = error;
      } else {
        // string
        if (error && error.toString().trim() !== '') isValid = false;
        errors[name] = error || '';
      }
    });

    return { errors, isValid };
  }
}

export default ValidationService;