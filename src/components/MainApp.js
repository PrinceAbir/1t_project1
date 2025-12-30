import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import T24TransactExplorer from "./T24TransactExplorer";
import T24RecordViewer from "./T24RecordViewer";
import RecordDataService from "../services/RecordDataService";
import "./MainApp.css";

const MainApp = () => {
  const { module: moduleParam } = useParams();
  const navigate = useNavigate();

  const [recordId, setRecordId] = useState("");
  const [activeRecord, setActiveRecord] = useState(null);
  const [appMode, setAppMode] = useState("create");
  const [recentRecords, setRecentRecords] = useState([]);
  const [currentModule, setCurrentModule] = useState("customer");
  const [recordData, setRecordData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Handle module validation and load recent records
  useEffect(() => {
    if (
      moduleParam &&
      ["customer", "funds", "account", "deposit", "lending"].includes(
        moduleParam
      )
    ) {
      setCurrentModule(moduleParam);
    } else {
      alert("Invalid module. Redirecting to home.");
      navigate("/");
    }

    try {
      const savedRecords = JSON.parse(
        localStorage.getItem("t24_recent_records") || "[]"
      );
      setRecentRecords(savedRecords.length > 0 ? savedRecords : []);
    } catch (error) {
      console.error("Error parsing recent records:", error);
      setRecentRecords([]);
    }
  }, [moduleParam, navigate]);

  const handleCreate = () => {
    if (!recordId.trim()) {
      alert("Please enter a record ID");
      return;
    }

    const newRecord = {
      id: recordId,
      name: `New ${getModuleName()} Record`,
      type: getModuleName(),
      date: new Date().toISOString().split("T")[0],
      isNew: true,
    };

    const updatedRecords = [
      newRecord,
      ...recentRecords.filter((r) => r.id !== newRecord.id),
    ].slice(0, 5);

    setRecentRecords(updatedRecords);
    try {
      localStorage.setItem(
        "t24_recent_records",
        JSON.stringify(updatedRecords)
      );
    } catch (error) {
      console.error("Error saving recent records:", error);
    }

    setActiveRecord(newRecord);
    setAppMode("create");
    setRecordId("");
  };

  const handleEdit = () => {
    if (!recordId.trim()) {
      alert("Please enter a record ID to edit");
      return;
    }

    const existingRecord = recentRecords.find(
      (record) =>
        record.id === recordId ||
        record.name.toLowerCase().includes(recordId.toLowerCase())
    );

    if (existingRecord) {
      setActiveRecord(existingRecord);
      setAppMode("edit");
    } else {
      const newRecord = {
        id: recordId,
        name: `${getModuleName()} Record`,
        type: getModuleName(),
        date: new Date().toISOString().split("T")[0],
        isNew: false,
      };
      setActiveRecord(newRecord);
      setAppMode("edit");
    }
    setRecordId("");
  };

  const handleView = () => {
    if (!recordId.trim()) {
      alert("Please enter a record ID to view");
      return;
    }

    const foundRecordData = RecordDataService.getRecordById(
      currentModule,
      recordId
    );

    if (foundRecordData) {
      const normalizedId =
        foundRecordData.id || foundRecordData.record?.id || recordId;
      const normalizedRecordData = { ...foundRecordData, id: normalizedId };

      setRecordData(normalizedRecordData);
      setActiveRecord({
        id: normalizedId,
        name: `${getModuleName()} - ${normalizedId}`,
        type: getModuleName(),
        date: new Date().toISOString().split("T")[0],
      });
      setAppMode("view");
      setRecordId("");
    } else {
      alert(
        `Record "${recordId}" not found for ${getModuleName()} module. Available records: ${
          RecordDataService.getAvailableRecords(currentModule)
            .map((r) => r.id)
            .join(", ") || "None"
        }`
      );
    }
  };

  const handleClear = () => {
    setRecordId("");
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const getModuleName = () => {
    const modules = {
      customer: "Customer",
      funds: "Fund Transfer",
      account: "Account",
      deposit: "Deposit",
      lending: "Lending",
    };
    return modules[currentModule] || "Application";
  };

  const getModuleIcon = () => {
    const icons = {
      customer: "👤",
      funds: "💸",
      account: "🏦",
      deposit: "💰",
      lending: "📈",
    };
    return icons[currentModule] || "📋";
  };

  const getPlaceholder = () => {
    const placeholders = {
      customer: "e.g., CUST00123, CUST00456...",
      funds: "e.g., FT2024001, FT2024002...",
      account: "e.g., ACCT45678, ACCT45679...",
      deposit: "e.g., DEP78901, DEP78902...",
      lending: "e.g., LN234567, LN234568...",
    };
    return placeholders[currentModule] || "Enter a record ID...";
  };

  return (
    <div className="main-app">
      {/* Header */}
      <header className="ma-header">
        <div className="ma-header-left">
          <button className="back-home-btn" onClick={() => navigate("/")}>
            ← Home
          </button>
          <div className="app-info">
            <span className="app-icon">{getModuleIcon()}</span>
            <span className="app-name">
              {getModuleName().toUpperCase()} APPLICATION
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ma-main">
        {!activeRecord ? (
          <>
            <div className="record-input-section">
              <div className="input-container">
                <div className="input-group">
                  <div className="input-label-row">
                    <label htmlFor="recordInput">
                      {getModuleName().toUpperCase()}
                    </label>
                  </div>
                  <div className="input-field">
                    <input
                      id="recordInput"
                      type="text"
                      value={recordId}
                      onChange={(e) => setRecordId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreate();
                        }
                      }}
                      placeholder={getPlaceholder()}
                      className="record-input"
                      autoComplete="off"
                    />

                    <div className="input-actions">
                      <button
                        className="action-btn create-btn"
                        onClick={handleCreate}
                        disabled={!recordId.trim()}
                      >
                        <span className="btn-icon">+</span>
                        <span className="btn-text">Create New</span>
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={handleEdit}
                        disabled={!recordId.trim()}
                      >
                        <span className="btn-icon">✎</span>
                        <span className="btn-text">Edit</span>
                      </button>
                      <button
                        className="action-btn view-btn"
                        onClick={handleView}
                        disabled={!recordId.trim()}
                      >
                        <span className="btn-icon">👁️</span>
                        <span className="btn-text">View</span>
                      </button>
                      <button
                        className="action-btn clear-btn"
                        onClick={handleClear}
                      >
                        <span className="btn-icon">×</span>
                        <span className="btn-text">Clear</span>
                      </button>
                      <button
                        className="action-btn settings-btn"
                        onClick={handleSettings}
                      >
                        <span className="btn-icon">⚙️</span>
                        <span className="btn-text">Settings</span>
                      </button>

                      {/* New: Navigate to Full Metadata Editor Page */}
                      <button
                        className="action-btn metadata-btn"
                        onClick={() => navigate(`/metadata/${currentModule}`)}
                        title="Open Full-Screen Metadata Editor"
                      >
                        <span className="btn-icon">📋</span>
                        <span className="btn-text">Metadata Editor</span>
                      </button>


                       <button
                        className="action-btn metadata-btn"
                        onClick={() => navigate(`/metadata-add/${currentModule}`)}
                        title="Open Full-Screen Metadata Add-Only Page"
                      >
                        <span className="btn-icon">*</span>
                        <span className="btn-text">Core-Metadta</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="explorer-view">
            <div className="explorer-header">
              <button
                className="back-to-main"
                onClick={() => {
                  setActiveRecord(null);
                  setRecordData(null);
                }}
              >
                ← Back to Records
              </button>
              <div className="explorer-info">
                <h2>
                  {activeRecord.name}
                  <span className="record-mode">[{appMode.toUpperCase()}]</span>
                </h2>
                <div className="record-details">
                  <span className="detail-item">
                    <strong>ID:</strong> {activeRecord.id}
                  </span>
                  <span className="detail-item">
                    <strong>Type:</strong> {activeRecord.type}
                  </span>
                  <span className="detail-item">
                    <strong>Date:</strong> {activeRecord.date}
                  </span>
                </div>
              </div>
            </div>
            <div className="explorer-content">
              {appMode === "view" ? (
                <T24RecordViewer
                  module={currentModule}
                  recordId={activeRecord.id}
                  recordData={recordData}
                />
              ) : (
                <T24TransactExplorer
                  module={currentModule}
                  recordId={activeRecord.id}
                  appMode={appMode}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default React.memo(MainApp);
