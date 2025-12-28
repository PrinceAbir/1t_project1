// src/components/T24RecordViewer.jsx
import React from "react";
import "../style/ViewMode.css";

const T24RecordViewer = ({ module, recordId, recordData }) => {
  // Import metadata dynamically based on module
  const getMetadata = () => {
    try {
      const metaMap = require("../metadata/").default;
      return metaMap[module];
    } catch (err) {
      console.error(`Error loading metadata for module ${module}:`, err);
      return null;
    }
  };

  const metadata = getMetadata();

  if (!metadata) {
    return (
      <div className="t24-view-container">
        <div className="t24-view-error">Metadata not found for module: {module}</div>
      </div>
    );
  }

  if (!recordData) {
    return (
      <div className="t24-view-container">
        <div className="t24-view-error">Record not found for ID: {recordId}</div>
      </div>
    );
  }

  const fields = metadata.fields || {};
  // Get record data from the recordData prop (passed from MainApp)
  const record = recordData.record || recordData;

  return (
    <div className="t24-view-container">
      {/* T24-style header */}
      <div className="t24-view-header-section">
        <h2 className="t24-view-title">
          {(metadata.application || module).toUpperCase()} - VIEW RECORD
        </h2>
        <div className="t24-view-record-id">
          <strong>Record ID:</strong> {recordId || "N/A"}
        </div>
      </div>

      <div className="t24-view-grid">
        {Object.entries(fields).map(([fieldKey, fieldConfig]) => {
          const fieldName = fieldConfig.field_name || fieldKey;
          const value = record[fieldName] || record[fieldKey];
          const isMulti = fieldConfig.multi || fieldConfig.multivalued;
          const displayValues = isMulti
            ? (Array.isArray(value) ? value : (value ? [value] : []))
            : (value ? [value] : []);

          // Show empty input for missing values (real T24 behavior)
          const valuesToRender = displayValues.length > 0 ? displayValues : [""];

          return (
            <div key={fieldKey} className="t24-view-field">
              <label className="t24-view-label">
                {fieldConfig.label}
                {fieldConfig.mandatory && <span className="required-asterisk"> *</span>}
              </label>

              <div className="t24-multi-block">
                {valuesToRender.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    className={`t24-view-input ${idx > 0 ? "multi" : ""}`}
                    value={val ?? ""}
                    readOnly
                    tabIndex="-1"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* T24-style footer */}
      <div className="t24-view-footer">
        <small>
          Application: <strong>{metadata.application || module}</strong> • Type: <strong>{metadata.type || "N/A"}</strong> • Status: VIEW ONLY
        </small>
      </div>
    </div>
  );
};

export default React.memo(T24RecordViewer);