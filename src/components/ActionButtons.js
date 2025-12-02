// components/ActionButtons.js
import React from 'react';

const ActionButtons = ({ 
  onBack, 
  onHold, 
  onValidate, 
  onCommit, 
  onAuthorize,
  onDelete,
  onCopy,
  disabled = false 
}) => {
  return (
    <div className="action-buttons">
      <button className="action-btn btn-back" onClick={onBack} disabled={disabled}>
        Back
      </button>
      <button className="action-btn btn-hold" onClick={onHold} disabled={disabled}>
        Hold
      </button>
      <button className="action-btn btn-validate" onClick={onValidate} disabled={disabled}>
        Validate
      </button>
      <button className="action-btn btn-commit" onClick={onCommit} disabled={disabled}>
        Commit
      </button>
      <button className="action-btn btn-authorize" onClick={onAuthorize} disabled={disabled}>
        Authorize
      </button>
      <button className="action-btn btn-delete" onClick={onDelete} disabled={disabled}>
        Delete
      </button>
      <button className="action-btn btn-copy" onClick={onCopy} disabled={disabled}>
        Copy
      </button>
    </div>
  );
};

export default ActionButtons;