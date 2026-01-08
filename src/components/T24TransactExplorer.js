// src/components/T24TransactExplorer.js
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react"; // ← Added useRef
import ActionButtons from "./ActionButtons";
import TabButton from "./TabButton";
import FieldRenderer from "./FieldRenderer";
import ValidationService from "../services/ValidationService";
import DataTransformer from "../services/DataTransformer";
import ErrorToast from "./ErrorToast";
import "../style/T24TransactExplorer.css";

const API_BASE = "http://localhost:5000/api/metadata";

const getApiEndpoint = (module) => {
  const map = {
    customer: "customer",
    funds: "fundtransfer",
    account: "account",
    deposit: "deposit",
    lending: "lending",
  };
  return map[module] || module;
};

const T24TransactExplorer = ({ module, mode = "create" }) => {
  // All hooks at the top
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("MAIN");
  const [formState, setFormState] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({});

  const [toastMessage, setToastMessage] = useState("");
  const [toastButton, setToastButton] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const [columns, setColumns] = useState(1);

  const isFetching = useRef(false); // Prevents double fetch in Strict Mode

  const isViewMode = mode === "view";

  // Fetch metadata from API
  // Remove the entire getApiEndpoint function and replace the fetch line with:

  useEffect(() => {
    const fetchMetadata = async () => {
      if (isFetching.current) return;
      isFetching.current = true;

      // Use raw module name directly for dynamic/custom apps
      const endpoint = module;
   
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/${endpoint}`);
        if (!response.ok) {
          throw new Error(`Failed to load metadata (${response.status})`);
        }

        const data = await response.json();
        
        setMetadata(data);
        setColumns(data?.columns ? Number(data.columns) || 1 : 1);
      } catch (err) {
        console.error("Metadata fetch error:", err);
        setError(err.message || "Unable to connect to metadata server");
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchMetadata();
  }, [module]);

  const t24FormData = useMemo(() => {
    if (!metadata) {
      return {
        MAIN: { fields: [], title: "" },
        AUDIT: { fields: [], title: "AUDIT" },
        RESERVED: { fields: [], title: "RESERVED" },
      };
    }

    return {
      MAIN: {
        title: `${
          metadata.application?.toUpperCase() || module.toUpperCase()
        } / ${metadata.type || ""}`,
        fields: DataTransformer.metadataToT24Fields(metadata),
      },
      AUDIT: { fields: [], title: "AUDIT" },
      RESERVED: { fields: [], title: "RESERVED" },
    };
  }, [metadata, module]);

  // Initialize form state
  useEffect(() => {
    const initial = {};
    const err = {};

    Object.keys(t24FormData).forEach((tab) => {
      initial[tab] = {};
      err[tab] = {};

      (t24FormData[tab].fields || []).forEach((f) => {
        initial[tab][f.id] = f.multi ? f.value || [""] : f.value ?? "";
        err[tab][f.id] = f.multi ? [] : "";
      });
    });

    setFormState(initial);
    setTabErrors(err);
  }, [t24FormData]);

  const triggerToast = useCallback((msg, btnText = null, btnAction = null) => {
    setToastMessage(msg);
    setToastButton(btnText ? { text: btnText, action: btnAction } : null);
    setShowToast(true);
  }, []);
  // update columns if metadata changes (keeps dynamic behavior)
  useEffect(() => {
    if (metadata && metadata.columns) {
      const c = Number(metadata.columns) || 1;
      if (c > 0 && c !== columns) setColumns(c);
    }
  }, [metadata, columns]);

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const handleFieldChange = useCallback(
    (fieldName, value) => {
      setFormState((p) => ({
        ...p,
        [activeTab]: { ...p[activeTab], [fieldName]: value },
      }));

      if (validationErrors[fieldName]) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldName]: Array.isArray(prev[fieldName]) ? [] : "",
        }));
      }
    },
    [activeTab, validationErrors]
  );

  const handleValidate = useCallback(() => {
    if (isViewMode) return true;

    const fields = t24FormData[activeTab].fields;
    const data = formState[activeTab] || {};

    const fieldConfigs = fields.map((f) => ({
      name: f.id,
      label: f.label,
      type: f.type,
      required: !!(f.metadata?.required || f.mandatory),
      multi: !!(f.metadata?.multi || f.multi || f.multivalued),
      children: f.children || f.metadata?.children || null,
      min: f.metadata?.min ?? f.min,
      max: f.metadata?.max ?? f.max,
      options: f.metadata?.options ?? f.options,
      max_multifield: f.metadata?.max_multifield ?? f.max_multifield,
      decimals: f.metadata?.decimals ?? f.decimals,
      pattern: f.metadata?.pattern ?? f.pattern,
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

    // === RESTORE ORIGINAL ERROR ARRAY TOAST ===
    const buildFieldId = (tab, fieldId, index = null) =>
      index === null ? `${tab}_${fieldId}` : `${tab}_${fieldId}_${index}`;

    const toastErrors = Object.entries(errors)
      .flatMap(([key, val]) => {
        if (Array.isArray(val)) {
          return val.flatMap((msg, idx) => {
            if (!msg) return [];
            if (typeof msg === "string" && msg.trim()) {
              return [
                { field: buildFieldId(activeTab, key, idx), message: msg },
              ];
            }
            if (typeof msg === "object") {
              return Object.entries(msg).flatMap(([childId, m]) =>
                m
                  ? [
                      {
                        field: `${buildFieldId(
                          activeTab,
                          key,
                          idx
                        )}_${childId}`,
                        message: m,
                      },
                    ]
                  : []
              );
            }
            return [];
          });
        } else if (val && typeof val === "object") {
          return Object.entries(val).flatMap(([childId, childErr]) => {
            if (!childErr) return [];
            if (Array.isArray(childErr)) {
              return childErr.flatMap((ce, idx) =>
                ce
                  ? [
                      {
                        field: `${buildFieldId(
                          activeTab,
                          key
                        )}_${childId}_${idx}`,
                        message: ce,
                      },
                    ]
                  : []
              );
            }
            return [
              {
                field: `${buildFieldId(activeTab, key)}_${childId}`,
                message: childErr,
              },
            ];
          });
        } else if (val && val.toString().trim()) {
          return [{ field: buildFieldId(activeTab, key), message: val }];
        }
        return [];
      })
      .filter(Boolean);

    triggerToast(toastErrors, "View Errors");
    return false;
  }, [activeTab, formState, t24FormData, triggerToast, isViewMode]);

  const handleCommit = () => {
    if (isViewMode) return;
    if (handleValidate()) {
      const result = DataTransformer.toT24Submission(formState[activeTab], {
        fields: t24FormData[activeTab].fields,
      });
      console.log("T24 Commit Payload:", result);
      triggerToast("Transaction committed successfully");
    }
  };

  const handleHold = () => triggerToast("Transaction held");
  const handleBack = () => handleBackToHome();

  // Conditional rendering after hooks
  if (loading) {
    return (
      <div
        style={{
          padding: "60px",
          textAlign: "center",
          fontSize: "16px",
          color: "#666",
        }}
      >
        Loading {module.toUpperCase()} metadata from server...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#e53e3e" }}>
        <h3>Metadata Load Failed</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            background: "#4299e1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metadata) return <div>No metadata for module: {module}</div>;

  const currentTab = t24FormData[activeTab];
  const currentData = formState[activeTab] || {};

  return (
    <div className="t24-transact-explorer">
      {showToast && (
        <ErrorToast
          message={toastMessage}
          buttonText={toastButton?.text}
          onButtonClick={toastButton?.action}
          onClose={() => setShowToast(false)}
          override={Array.isArray(toastMessage)}
        />
      )}

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

      <div className="t24-main-content">
        <div className="t24-title-section">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="t24-form-title">{currentTab.title}</div>
            
          </div>

          <ActionButtons
            onBack={handleBack}
            onHold={handleHold}
            onValidate={handleValidate}
            onCommit={handleCommit}
            disabled={!currentTab || isViewMode}
          />
        </div>

        <div className="t24-form-container">
          <div
            className="t24-form-grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {currentTab.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={currentData[field.id]}
                onChange={handleFieldChange}
                error={validationErrors[field.id]}
                tabId={activeTab}
                readOnly={isViewMode}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(T24TransactExplorer);
