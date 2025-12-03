// components/ActionButtons.js
import React from 'react';

import upArrow from '../assets/up_arrow.png';
import holdButton from '../assets/hold.png';
import validateButton from '../assets/validate.png';
import commitButton from '../assets/commit.png';
import authorizeButton from '../assets/authorize.png';



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


        <img className='action-back-btn'
          src={upArrow}
          alt="Back"
          />

      </button>
      <button className="action-btn btn-hold" onClick={onHold} disabled={disabled}>
         <img className='action-hold-btn'
          src={holdButton}
          alt="Hold"
          />
      </button>
      <button className="action-btn btn-validate" onClick={onValidate} disabled={disabled}>
         <img className='action-validate-btn'
          src={validateButton}
          alt="Validate"
          />
      </button>
      <button className="action-btn btn-commit" onClick={onCommit} disabled={disabled}>
         <img className='action-commit-btn'
          src={commitButton}
          alt="Commit"
          />
      </button>
      {/* <button className="action-btn btn-authorize" onClick={onAuthorize} disabled={disabled}>
        Authorize
      </button>
      <button className="action-btn btn-delete" onClick={onDelete} disabled={disabled}>
        Delete
      </button>
      <button className="action-btn btn-copy" onClick={onCopy} disabled={disabled}>
        Copy
      </button> */}
    </div>
  );
};

export default ActionButtons;