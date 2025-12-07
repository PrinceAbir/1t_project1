// components/ActionButtons.js
import React from 'react';
import upArrow from '../assets/up_arrow.png';
import holdButton from '../assets/hold.png';
import validateButton from '../assets/validate.png';
import commitButton from '../assets/commit.png';

const ActionButtons = ({
  onBack,
  onHold,
  onValidate,
  onCommit,
  disabled = false
}) => {
  return (
    <div className="action-buttons">
      {/* Back Button - Fixed with onClick handler */}
      <button 
        className="action-btn btn-back" 
        onClick={onBack} 
        disabled={disabled}
        title="Go Back"
      >
        <img 
          className='action-back-btn'
          src={upArrow}
          alt="Back"
        />
      </button>

      {/* Hold Button */}
      <button 
        className="action-btn btn-hold" 
        onClick={onHold} 
        disabled={disabled}
        title="Hold Transaction"
      >
        <img 
          className='action-hold-btn'
          src={holdButton}
          alt="Hold"
        />
      </button>

      {/* Validate Button */}
      <button 
        className="action-btn btn-validate" 
        onClick={onValidate} 
        disabled={disabled}
        title="Validate Form"
      >
        <img 
          className='action-validate-btn'
          src={validateButton}
          alt="Validate"
        />
      </button>

      {/* Commit Button */}
      <button 
        className="action-btn btn-commit" 
        onClick={onCommit} 
        disabled={disabled}
        title="Commit Transaction"
      >
        <img 
          className='action-commit-btn'
          src={commitButton}
          alt="Commit"
        />
      </button>




    </div>
  );
};

export default ActionButtons;