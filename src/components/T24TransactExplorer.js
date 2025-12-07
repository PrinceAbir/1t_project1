import React, { useState, useEffect, useMemo } from "react";
import ActionButtons from "./ActionButtons";
import TabButton from "./TabButton";
import FieldRenderer from "./FieldRenderer";
import ValidationService from "../services/ValidationService";
import DataTransformer from "../services/DataTransformer";
import ErrorToast from "./ErrorToast";
import META_MAP from "../metadata"; // 🔥 Dynamic metadata loader
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

  // 🔥 Load correct module metadata dynamically
  const metadata = META_MAP[module];

  // 🔥 Convert metadata → T24 UI format
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
        initial[tab][f.id] = f.value;
        err[tab][f.id] = "";
      });
    });

    setFormState(initial);
    setTabErrors(err);
    setIsLoading(false);
  }, [t24FormData]);

  /** ------------------ FIELD CHANGE ------------------ **/
  const handleFieldChange = (fieldName, value) => {
    setFormState((p) => ({
      ...p,
      [activeTab]: { ...p[activeTab], [fieldName]: value }
    }));

    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  /** ------------------ VALIDATION ------------------ **/
  const handleValidate = () => {
    const fields = t24FormData[activeTab].fields;
    const data = formState[activeTab];

    const fieldConfigs = fields.map((f) => ({
      name: f.id,
      label: f.label,
      type: f.type,
      required: f.metadata.required,
      multi: f.metadata.multi,
      min: f.metadata.min,
      max: f.metadata.max,
      options: f.metadata.options,
      max_multifield: f.metadata.max_multifield
    }));

    const { errors, isValid } = ValidationService.validateAllFields(
      fieldConfigs,
      data
    );

    setValidationErrors(errors);
    setTabErrors((prev) => ({ ...prev, [activeTab]: !isValid }));

    if (isValid) {
      triggerToast(`${activeTab} validation successful!`);
      return true;
    }

 triggerToast(
  Object.entries(errors)
    .filter(([_, msg]) => msg)
    .map(([key, msg]) => ({
      field: `${activeTab}_${key}`,  // FIX: include tab name
      message: msg
    })),
  "View Errors"
);


    return false;
  };

  
  /** ------------------ ACTION HANDLERS ------------------ **/
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
  const handleBack = () => triggerToast("Back pressed");

  /** ------------------ RENDER ------------------ **/
  if (isLoading || !metadata)
    return <div className="loading">Loading...</div>;

  const currentTab = t24FormData[activeTab];
  const currentData = formState[activeTab];

  return (
    <div className="t24-transact-explorer">

      {/* Toast */}
      {showToast && (
        <ErrorToast
          message={toastMessage}
          buttonText={toastButton?.text}
          onButtonClick={toastButton?.action}
          onClose={() => setShowToast(false)}
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
                htmlId={field.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default T24TransactExplorer;
