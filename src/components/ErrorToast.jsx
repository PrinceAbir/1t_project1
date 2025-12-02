import React, { useEffect } from "react";
import "./ErrorToast.css";

const ErrorToast = ({ message, buttonText, onButtonClick, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="toast-container">
      <div className="toast-box">
        <span className="toast-message">{message}</span>

        {buttonText && (
          <button className="toast-button" onClick={onButtonClick}>
            {buttonText}
          </button>
        )}

        <span className="toast-close" onClick={onClose}>×</span>
      </div>
    </div>
  );
};

export default ErrorToast;
