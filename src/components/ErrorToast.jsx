// src/components/ErrorToast.js (updated: handle empty message edge case, memoized)
import React, { useState } from "react";
import "./ErrorToast.css";

const ErrorToast = ({ message, buttonText, onButtonClick, onClose, override = false }) => {
  const [minimized, setMinimized] = useState(false);

  if (!message || (Array.isArray(message) && message.length === 0)) return null; // Edge: no message

  const isErrorArray = Array.isArray(message);
  const totalErrors = isErrorArray ? message.length : 0;

  /** -----------------------------------------
   * Scroll to field inside .t24-form-container
   * Accurate scroll using boundingRect
   ----------------------------------------- **/
  const scrollToField = (fieldId) => {
    const el = document.getElementById(fieldId);
    if (!el) return;

    const container = document.querySelector(".t24-form-container");
    if (!container) return;

    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate element’s position relative to container
    const scrollPos = elRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({
      top: scrollPos - 80,   // adjust for padding or header
      behavior: "smooth",
    });

    // Prevent default browser scroll
    el.focus({ preventScroll: true });
  };

  return (
  <div className="toast-container">
    <div className="toast-box">
      {/* Header with Close Button */}
      <div className="toast-header">
        <span className="toast-error-count">
          {isErrorArray ? `Total Errors: ${totalErrors}` : "Validation Message"}
        </span>
        <div className="toast-header-actions">
          {isErrorArray && (
            <span
              className="toast-minimize"
              role="button"
              tabIndex={0}
              onClick={() => setMinimized(!minimized)}
              onKeyDown={(e) => ["Enter", " "].includes(e.key) && setMinimized(!minimized)}
            >
              {minimized ? "▾" : "▴"}
            </span>
          )}
          <span
            className="toast-close"
            role="button"
            tabIndex={0}
            onClick={onClose}
            onKeyDown={(e) => e.key === "Enter" && onClose()}
          >
            ×
          </span>
        </div>
      </div>

      {/* Message Content - Only show when not minimized */}
      {!minimized && (
        <div className="toast-message">
          {isErrorArray ? (
            <div>
              {message.map((err, index) => (
                <div
                  key={index}
                  className="toast-error-item"
                  onClick={() => scrollToField(err.field)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => ["Enter", " "].includes(e.key) && scrollToField(err.field)}
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
    </div>
  </div>
);
};

export default React.memo(ErrorToast);