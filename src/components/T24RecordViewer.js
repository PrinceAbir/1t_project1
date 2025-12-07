import React from "react";
import formData from "../metadata/paymentMeta";      
import recordData from "../userData/ftrecorddata";      
import "../style/ViewMode.css";

const T24RecordViewer = () => {
  const metadata = formData.fields;
  const record = recordData.record;

  if (!metadata) return <div>No metadata found</div>;
  if (!record) return <div>No record found</div>;

  return (
    <div className="t24-view-container">
      <h2 className="t24-view-header">PAYMENT — VIEW MODE</h2>

      <div className="t24-view-grid">
        {Object.keys(metadata).map((key) => {
          const field = metadata[key];
          const value = record[key];

          const isMulti = Array.isArray(value);

          return (
            <div key={key} className="t24-view-field">
              <label className="t24-view-label">{field.label}</label>

              {/* Multi-value fields */}
              {isMulti ? (
                <div className="t24-multi-block">
                  {value && value.length > 0 ? (
                    value.map((v, idx) => (
                      <input
                        key={idx}
                        className="t24-view-input multi"
                        type="text"
                        value={v}
                        readOnly
                      />
                    ))
                  ) : (
                    <input
                      className="t24-view-input"
                      type="text"
                      readOnly
                      value=""
                    />
                  )}
                </div>
              ) : (
                <input
                  className="t24-view-input"
                  type="text"
                  readOnly
                  value={value ?? ""}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default T24RecordViewer;
