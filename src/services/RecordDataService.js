// src/services/RecordDataService.js
// Service to load record data based on module and record ID

import ftRecordData from '../userData/ftrecorddata';
import customerRecordData from '../userData/customerRecordData';

const recordDataMap = {
  'funds': ftRecordData,
  'customer': customerRecordData,
  // Add more modules as needed:
  // 'account': accountRecordData,
  // 'deposit': depositRecordData,
  // 'lending': lendingRecordData,
};

const RecordDataService = {
  /**
   * Get all available records for a module
   * @param {string} module - Module name (e.g., 'funds', 'customer')
   * @returns {array} List of available records for the module
   */
  getAvailableRecords: (module) => {
    const data = recordDataMap[module];
    if (!data) return [];
    
    // If data is array, return it; otherwise wrap in array
    return Array.isArray(data) ? data : [data];
  },

  /**
   * Get a specific record by module and ID
   * @param {string} module - Module name
   * @param {string} recordId - Record ID to search for
   * @returns {object} Record data with metadata, or null if not found
   */
  getRecordById: (module, recordId) => {
    const records = RecordDataService.getAvailableRecords(module);
    
    if (records.length === 0) return null;

    // Search by exact ID match
    const foundRecord = records.find(
      (record) => record.id === recordId || record.record?.id === recordId
    );

    return foundRecord || null;
  },

  /**
   * Search records by partial match (name or ID)
   * @param {string} module - Module name
   * @param {string} searchTerm - Search term
   * @returns {array} Matching records
   */
  searchRecords: (module, searchTerm) => {
    const records = RecordDataService.getAvailableRecords(module);
    const lowerTerm = searchTerm.toLowerCase();

    return records.filter((record) => {
      const id = record.id || '';
      const name = record.name || '';
      return (
        id.toLowerCase().includes(lowerTerm) ||
        name.toLowerCase().includes(lowerTerm)
      );
    });
  }
};

export default RecordDataService;
