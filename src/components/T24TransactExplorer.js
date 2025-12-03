import React, { useState, useEffect, useMemo } from "react";
import ActionButtons from "./ActionButtons";
import TabButton from "./TabButton";
import FieldRenderer from "./FieldRenderer";
import ValidationService from "../services/ValidationService";
import DataTransformer from "../services/DataTransformer";
import ErrorToast from "../components/ErrorToast"; // ⬅️ NEW
import formData from "../metadata/formData";
import "../App";

const T24TransactExplorer = () => {
  const [activeTab, setActiveTab] = useState("FUNDS.TRANSFER");
  const [formState, setFormState] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // NEW — for Toast Notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastButton, setToastButton] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (message, buttonText = null, buttonAction = null) => {
    setToastMessage(message);
    setToastButton(
      buttonText ? { text: buttonText, action: buttonAction } : null
    );
    setShowToast(true);
  };

  // Transform metadata to T24 format
  const t24FormData = useMemo(
    () => ({
      "FUNDS.TRANSFER": {
        title: "FUNDS.TRANSFER / FT/25105/ZGG16",
        fields: DataTransformer.metadataToT24Fields(formData), // works for new format
      },
      Audit: {
        /* ... */
      },
      Reserved: {
        /* ... */
      },
    }),
    []
  );

useEffect(() => {
  const initialState = {};
  const errors = {};

  Object.keys(t24FormData).forEach((tab) => {
    initialState[tab] = {};
    errors[tab] = {};

    const fields = t24FormData[tab].fields || []; // ✅ safeguard

    fields.forEach((field) => {
      initialState[tab][field.id] = field.value;
      errors[tab][field.id] = "";
    });
  });

  setFormState(initialState);
  setIsLoading(false);
}, [t24FormData]);

  // Field change
  const handleFieldChange = (fieldName, value) => {
    setFormState((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [fieldName]: value,
      },
    }));

    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Validation
  const handleValidate = () => {
    const currentTabData = t24FormData[activeTab];
    const currentFormData = formState[activeTab];

    const fieldConfigs = currentTabData.fields.map((f) => ({
      name: f.id,
      label: f.label,
      type: f.type === "number" || f.type === "amount" ? "number" : "string",
      required: f.metadata.required,
      multi: f.metadata.multi,
      min: f.metadata.min,
      max: f.metadata.max,
      options: f.metadata.options,
      max_multifield: f.metadata.max_multifield,
    }));

    // 2️⃣ Validate data
    const { errors, isValid } = ValidationService.validateAllFields(
      fieldConfigs,
      currentFormData
    );

    // 3️⃣ Update error states
    setValidationErrors(errors);
    setTabErrors((prev) => ({
      ...prev,
      [activeTab]: !isValid,
    }));

    // 4️⃣ If valid → show success toast
    if (isValid) {
      triggerToast(`${activeTab} validation successful!`);
      return true;
    }

    // 5️⃣ Convert errors into array list for toast UI
    const errorEntries = Object.keys(errors)
      .filter((key) => errors[key])
      .map((key) => ({
        field: `${activeTab}_${key}`, // matches DOM ID used in FieldRenderer
        message: errors[key],
      }));

    // 6️⃣ Pop toast with clickable errors
    triggerToast(errorEntries, "View Errors");

    return false;
  };

  // Delete
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setFormState((prev) => ({
        ...prev,
        [activeTab]: {},
      }));
      setValidationErrors({});

      triggerToast("Transaction deleted");
    }
  };

  // Back
  const handleBack = () => {
    triggerToast("Going back to previous screen");
  };

  // Hold
  const handleHold = () => {
    triggerToast("Transaction held");
  };

  // Authorize
  const handleAuthorize = () => {
    if (handleValidate()) {
      triggerToast("Transaction authorized successfully");
    }
  };

  // Copy
  const handleCopy = () => {
    triggerToast("Transaction copied to clipboard");
  };

  // Commit
  const handleCommit = () => {
    if (handleValidate()) {
      const t24Submission = DataTransformer.toT24Submission(
        formState[activeTab],
        { fields: t24FormData[activeTab].fields }
      );

      console.log("Committing to T24:", t24Submission);
      triggerToast(`${activeTab} committed successfully!`);
    }
  };

  if (isLoading)
    return <div className="loading">Loading T24 Transact Explorer...</div>;

  const currentTabData = t24FormData[activeTab];
  const currentFormData = formState[activeTab];

  return (
    <div className="t24-transact-explorer">
      {/* NEW Toast */}
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
        {["FUNDS.TRANSFER", "Audit", "Reserved"].map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            isActive={activeTab === tab}
            hasError={tabErrors[tab]}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {/* Main */}
      <div className="t24-main-content">
        <div className="t24-title-section">


          <div className="t24-form-title">
            {currentTabData.title}

          </div>

          {/* T24 Action Buttons */}
          <div className="t24-action-section">
            <ActionButtons
              onBack={handleBack}
              onHold={handleHold}
              onValidate={handleValidate}
              onCommit={handleCommit}
              onAuthorize={handleAuthorize}
              onDelete={handleDelete}
              onCopy={handleCopy}
              disabled={!currentTabData}
            />
          </div>



        </div>

        {/* Form Fields */}
        <div className="t24-form-container">
          <div className="t24-form-grid">
            {currentTabData.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={{ ...field, name: field.id, type: field.type }}
                value={currentFormData[field.id]}
                onChange={handleFieldChange}
                error={validationErrors[field.id]}
                tabId={activeTab}
                htmlId={field.id} // <<< REQUIRED FOR SCROLLING
              />
            ))}
          </div>
        </div>




      </div>
    </div >
  );
};

export default T24TransactExplorer;
