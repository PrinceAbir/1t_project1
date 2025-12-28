import React, { useEffect, useState, useMemo } from "react";
import ActionButtons from "./ActionButtons";
import TabButton from "./TabButton";
import FieldRenderer from "./FieldRenderer";
import ValidationService from "../services/ValidationService";
import DataTransformer from "../services/DataTransformer";
import ErrorToast from "./ErrorToast";
import META_MAP from "../metadata"; // dynamic metadata loader
import "../App.css";

const T24TransactExplorer = ({ module }) => {
  const [activeTab, setActiveTab] = useState("MAIN");
  const [formState, setFormState] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastButton, setToastButton] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg, btnText = null, btnAction = null) => {
    setToastMessage(msg);
    setToastButton(btnText ? { text: btnText, action: btnAction } : null);
    setShowToast(true);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };


  // helper to build DOM IDs consistent with FieldRenderer
  const buildFieldId = (tab, fieldId, index = null) =>
    index === null ? `${tab}_${fieldId}` : `${tab}_${fieldId}_${index}`;

  // load metadata
  const metadata = META_MAP[module];

  const t24FormData = useMemo(() => {
    if (!metadata) return {};

    return {
      MAIN: {
        title: `${metadata.application.toUpperCase()} / ${metadata.type}`,
        fields: DataTransformer.metadataToT24Fields(metadata)
      },
      AUDIT: { fields: [], title: "AUDIT" },
      RESERVED: { fields: [], title: "RESERVED" }
    };
  }, [metadata]);

  useEffect(() => {
    const initial = {};
    const err = {};

    Object.keys(t24FormData).forEach((tab) => {
      initial[tab] = {};
      err[tab] = {};

      (t24FormData[tab].fields || []).forEach((f) => {
        // initialize single or multi values
        initial[tab][f.id] = f.multi ? (f.value || ['']) : (f.value ?? '');
        // validationErrors shape uses field.id keys; values can be string or array
        err[tab][f.id] = f.multi ? [] : '';
      });
    });

    setFormState(initial);
    setTabErrors(err);
    setIsLoading(false);
  }, [t24FormData]);

  const handleFieldChange = (fieldName, value) => {
    setFormState((p) => ({
      ...p,
      [activeTab]: { ...p[activeTab], [fieldName]: value }
    }));

    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => ({ ...prev, [fieldName]: Array.isArray(prev[fieldName]) ? [] : "" }));
    }
  };

  const handleValidate = () => {
    const fields = t24FormData[activeTab].fields;
    const data = formState[activeTab] || {};

    // build fieldConfigs expected by ValidationService
    const fieldConfigs = fields.map((f) => ({
      name: f.id,
      label: f.label,
      type: f.type,
      required: !!(f.metadata?.required || f.mandatory),
      multi: !!(f.metadata?.multi || f.multi || f.multivalued),
      min: f.metadata?.min ?? f.min,
      max: f.metadata?.max ?? f.max,
      options: f.metadata?.options ?? f.options,
      max_multifield: f.metadata?.max_multifield ?? f.max_multifield,
      decimals: f.metadata?.decimals ?? f.decimals,
      pattern: f.metadata?.pattern ?? f.pattern
    }));

    const { errors, isValid } = ValidationService.validateAllFields(
      fieldConfigs,
      data
    );

    // Set inline validation errors to show next to fields
    setValidationErrors(errors);

    // Determine tab-level error flag
    const tabHasError = !isValid;
    setTabErrors((prev) => ({ ...prev, [activeTab]: tabHasError }));

    // Build toast message array of { field: 'TAB_field(_index)', message }
    if (isValid) {
      triggerToast(`${activeTab} validation successful!`);
      return true;
    }



    const toastErrors = Object.entries(errors).flatMap(([key, val]) => {
      // val may be string '' or non-empty, or an array for multi fields
      if (Array.isArray(val)) {
        // map each non-empty entry to a toast error with index
        return val
          .map((msg, idx) => (msg && msg.toString().trim() ? { field: buildFieldId(activeTab, key, idx), message: msg } : null))
          .filter(Boolean);
      } else if (val && val.toString().trim()) {
        return [{ field: buildFieldId(activeTab, key), message: val }];
      }
      return [];
    });

    triggerToast(toastErrors, "View Errors");
    return false;
  };

  const handleDelete = () => {
    if (window.confirm("Delete transaction?")) {
      setFormState((p) => ({ ...p, [activeTab]: {} }));
      triggerToast("Transaction deleted");
    }
  };

  const handleCommit = () => {
    if (handleValidate()) {
      const result = DataTransformer.toT24Submission(
        formState[activeTab],
        { fields: t24FormData[activeTab].fields }
      );
      console.log("T24 Commit:", result);
      triggerToast("Committed successfully");
    }
  };

  const handleAuthorize = () => handleValidate() && triggerToast("Authorized");
  const handleCopy = () => triggerToast("Copied");
  const handleHold = () => triggerToast("Held");
  const handleBack = () => handleBackToHome();

  if (isLoading || !metadata) return <div className="loading">Loading...</div>;

  const currentTab = t24FormData[activeTab];
  const currentData = formState[activeTab] || {};

  return (
    <div className="t24-transact-explorer">
      {/* Toast */}
      {showToast && (
        <ErrorToast
          message={toastMessage}
          buttonText={toastButton?.text}
          onButtonClick={toastButton?.action}
          onClose={() => setShowToast(false)}
          override={Array.isArray(toastMessage)}
        />
      )}

      {/* Tab Navigation */}
      <div className="t24-tab-navigation">
        {Object.keys(t24FormData).map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            isActive={activeTab === tab}
            hasError={tabErrors[tab]}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {/* Main Form */}
      <div className="t24-main-content">
        <div className="t24-title-section">
          <div className="t24-form-title">{currentTab.title}</div>

          <ActionButtons
            onBack={handleBack}
            onHold={handleHold}
            onValidate={handleValidate}
            onCommit={handleCommit}
            onAuthorize={handleAuthorize}
            onDelete={handleDelete}
            onCopy={handleCopy}
            disabled={!currentTab}
          />
        </div>

        <div className="t24-form-container">
          <div className="t24-form-grid">
            {currentTab.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={currentData[field.id]}
                onChange={handleFieldChange}
                error={validationErrors[field.id]}
                tabId={activeTab}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default T24TransactExplorer;
