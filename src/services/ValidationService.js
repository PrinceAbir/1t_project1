// services/ValidationService.js
class ValidationService {
  static validateField(field, value) {
    const { label, type, required, min, max, multivalued, pattern, decimals } = field;
    
    if (multivalued) {
      return this.validateMultiField(field, value);
    }
    
    return this.validateSingleField(field, value);
  }

  static validateSingleField(field, value) {
    const { label, type, required, min, max, pattern, decimals } = field;
    const val = value ? value.toString().trim() : '';

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
      
      case 'email':
        const stringError = this.validateString(val, label, min, max);
        if (stringError) return stringError;
        return this.validateEmail(val, label);
      
      case 'tel':
        const telStringError = this.validateString(val, label, min, max);
        if (telStringError) return telStringError;
        return this.validateTel(val, label, pattern);
      
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
    const { label, type, required, min, max, max_multifield, pattern, decimals } = field;
    const vals = Array.isArray(values) ? values : [];

    // Check if at least one value is required
    if (required && vals.every(v => !v || v.toString().trim() === '')) {
      return `${label} requires at least one entry`;
    }

    // Validate each non-empty value
    for (let i = 0; i < vals.length; i++) {
      const val = vals[i];
      if (val && val.toString().trim()) {
        const error = this.validateSingleField(field, val);
        if (error) return `Entry ${i + 1}: ${error}`;
      }
    }

    // Check max_multifield limit
    if (max_multifield && vals.length > max_multifield) {
      return `${label} cannot have more than ${max_multifield} entries`;
    }

    return '';
  }

  static validateString(value, label, min, max, pattern) {
    if (min && value.length < min) {
      return `${label} must be at least ${min} characters`;
    }
    
    if (max && value.length > max) {
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
    // Basic phone validation if no pattern provided
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
      // Basic validation: contains digits
      if (!/\d/.test(value)) {
        return `${label} must contain at least one digit`;
      }
    }
    return '';
  }

  static validateNumber(value, label, min, max, decimals) {
    const num = Number(value);
    
    if (isNaN(num)) {
      return `${label} must be a valid number`;
    }
    
    if (min !== undefined && num < min) {
      return `${label} must be at least ${min}`;
    }
    
    if (max !== undefined && num > max) {
      return `${label} must be at most ${max}`;
    }

    // Validate decimal places if specified
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
    // File validation is minimal since file handling is browser-based
    if (!value) {
      return '';
    }
    return '';
  }

  static validateAllFields(fields, data) {
    const errors = {};
    let isValid = true;

    fields.forEach(field => {
      const error = this.validateField(field, data[field.name]);
      errors[field.name] = error;
      if (error) isValid = false;
    });

    return { errors, isValid };
  }
}

export default ValidationService;