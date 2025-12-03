import React, { useEffect, useState } from "react";
import "./ErrorToast.css";

const ErrorToast = ({ message, buttonText, onButtonClick, onClose, override = false }) => {
  const [minimized, setMinimized] = useState(false);

 

  const isErrorArray = Array.isArray(message);
  const totalErrors = isErrorArray ? message.length : 0;

  return (
    <div className="toast-container">
      <div className="toast-box">

        {/* Header: Total Errors + Minimize Toggle */}
        {isErrorArray && (
          <div className="toast-header">
            <span className="toast-error-count">Total Errors: {totalErrors}</span>
            <span
              className="toast-minimize"
              role="button"
              tabIndex={0}
              onClick={() => setMinimized(!minimized)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setMinimized(!minimized);
              }}
              title={minimized ? "Expand" : "Minimize"}
            >
              {minimized ? "▾" : "▴"}
            </span>
          </div>
        )}

        {/* Error Messages */}
        {!minimized && (
          <div className="toast-message">
            {isErrorArray ? (
              <div>
                {message.map((err, index) => (
                  <div
                    key={index}
                    className="toast-error-item"
                    onClick={() => {
                      const el = document.getElementById(err.field);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        el.focus();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        const el = document.getElementById(err.field);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                          el.focus();
                        }
                      }
                    }}
                  >
                    • <strong>{err.field}</strong>: {err.message}
                  </div>
                ))}
              </div>
            ) : (
              <span>{message}</span>
            )}
          </div>
        )}

        {/* Show override button only */}
        {override && buttonText && (
          <button className="toast-button" onClick={onButtonClick}>
            {buttonText}
          </button>
        )}

        {/* Close */}
        <span
          className="toast-close"
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onClose()}
        >
          ×
        </span>
      </div>
    </div>
  );
};

export default ErrorToast;
