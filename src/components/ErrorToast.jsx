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
    // Try several strategies to locate the field element
    let el = document.getElementById(fieldId) || document.querySelector(`[data-alt-id="${fieldId}"]`);
    if (!el) {
      // try swapping last two underscore-separated segments (handles alternate id patterns)
      const parts = fieldId.split('_');
      if (parts.length >= 3) {
        const swapped = [...parts];
        const a = swapped.length - 1;
        const b = swapped.length - 2;
        const tmp = swapped[a]; swapped[a] = swapped[b]; swapped[b] = tmp;
        const swappedId = swapped.join('_');
        el = document.getElementById(swappedId) || document.querySelector(`[data-alt-id="${swappedId}"]`);
      }
    }

    // fallback: element whose id ends with fieldId
    if (!el) el = document.querySelector(`[id$="${fieldId}"]`);
    if (!el) return;

    // Ask components to expand/un-minimize if needed
    try { document.dispatchEvent(new CustomEvent('expandField', { detail: fieldId })); } catch (e) { /* ignore */ }

    const container = document.querySelector(".t24-form-container");
    if (!container) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
      return;
    }

    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate element’s position relative to container
    const scrollPos = elRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({
      top: scrollPos - 80, // adjust for padding or header
      behavior: "smooth",
    });

    // Focus without causing extra jump
    el.focus({ preventScroll: true });
  };

  return (
    <div className="toast-container">
      <div className="toast-box">

        {/* Header */}
        {isErrorArray && (
          <div className="toast-header">
            <span className="toast-error-count">Total Errors: {totalErrors}</span>
            <span
              className="toast-minimize"
              role="button"
              tabIndex={0}
              onClick={() => setMinimized(!minimized)}
              onKeyDown={(e) => ["Enter", " "].includes(e.key) && setMinimized(!minimized)}
            >
              {minimized ? "▾" : "▴"}
            </span>
          </div>
        )}

        {/* Error List */}
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

        {/* Optional Button */}
        {/* {override && buttonText && (
          <button className="toast-button" onClick={onButtonClick}>
            {buttonText}
          </button>
        )} */}

        {/* Close */}
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
  );
};

export default React.memo(ErrorToast);