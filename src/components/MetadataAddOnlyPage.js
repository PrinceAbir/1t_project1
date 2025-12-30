// src/components/MetadataAddOnlyPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../style/MetadataAddOnlyPage.css"; // Use this new CSS below

const API_BASE = "http://localhost:5000/api/metadata";

const MetadataAddOnlyPage = () => {
  const { module } = useParams();
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState({});
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const [groupChildren, setGroupChildren] = useState([]);

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const endpoint = module === "funds" ? "fundtransfer" : module;

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [module]);

  const fields = metadata?.fields ? Object.entries(metadata.fields) : [];

  const openModal = () => {
    setFormData({
      field_name: "",
      label: "",
      type: "string",
      multi: false,
      mandatory: false,
      min_length: "",
      max_length: "",
      position: [1, 1],
      options: [],
      max_multifield: "",
      max_file_size: "",
    });
    setGroupChildren([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({});
    setGroupChildren([]);
  };

  const isSelectType = formData.type === "select";
  const isMultiValue = formData.multi;
  const isGroupType = formData.type === "group";
  const isFileType = formData.type === "file";

  const saveField = async () => {
    if (!formData.field_name?.trim()) {
      addToast("Field name is required", "error");
      return;
    }

    const key = formData.field_name.trim().toLowerCase().replace(/\s+/g, "_");

    if (metadata?.fields[key]) {
      addToast(`Field "${key}" already exists`, "error");
      return;
    }

    if (isGroupType && groupChildren.length === 0) {
      addToast("Group must have at least one child field", "error");
      return;
    }

    const cleaned = {
      field_name: formData.field_name.trim(),
      label: formData.label || formData.field_name.trim(),
      type: formData.type,
      multi: formData.multi || false,
      multivalued: formData.multi || false,
      mandatory: formData.mandatory || false,
      min_length: formData.min_length ? Number(formData.min_length) : undefined,
      max_length: formData.max_length ? Number(formData.max_length) : undefined,
      position:
        formData.position?.[0] && formData.position?.[1]
          ? [Number(formData.position[0]), Number(formData.position[1])]
          : undefined,
      options:
        isSelectType && formData.options?.filter((o) => o.trim()).length > 0
          ? formData.options.filter((o) => o.trim())
          : undefined,
      max_multifield:
        isMultiValue && formData.max_multifield
          ? Number(formData.max_multifield)
          : undefined,
      max_file_size:
        isFileType && formData.max_file_size
          ? Number(formData.max_file_size)
          : undefined,
      fields: isGroupType
        ? groupChildren.filter((child) => child.field_name.trim())
        : undefined,
    };

    Object.keys(cleaned).forEach(
      (k) => cleaned[k] === undefined && delete cleaned[k]
    );

    const endpoint = module === "funds" ? "fundtransfer" : module;

    try {
      const response = await fetch(`${API_BASE}/${endpoint}/field`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, definition: cleaned }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Add failed");
      }

      // Refresh
      const refresh = await fetch(`${API_BASE}/${endpoint}`);
      if (refresh.ok) setMetadata(await refresh.json());

      addToast("New field added successfully", "success");
      closeModal();
    } catch (err) {
      addToast("Failed to add field: " + err.message, "error");
    }
  };

  const addGroupChild = () => {
    setGroupChildren([
      ...groupChildren,
      { field_name: "", label: "", type: "string", mandatory: false },
    ]);
  };

  const updateGroupChild = (index, field, value) => {
    const updated = [...groupChildren];
    updated[index][field] = value;
    setGroupChildren(updated);
  };

  const deleteGroupChild = (index) => {
    setGroupChildren(groupChildren.filter((_, i) => i !== index));
  };

  const getModuleDisplayName = () => {
    const names = {
      customer: "Customer",
      funds: "Fund Transfer",
      account: "Account",
      deposit: "Deposit",
      lending: "Lending",
    };
    return names[module] || module.toUpperCase();
  };

  if (loading) return <div className="loading">Loading metadata...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="metadata-page">
      <header className="metadata-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{getModuleDisplayName()} - Metadata Viewer (Add Only)</h1>
        <div className="action-button-group">
          <button className="add-field-btn" onClick={openModal}>
            <span className="action-icon">+</span>
            <span className="action-text">Add New Field</span>
          </button>
        </div>
      </header>

      <div className="metadata-table-wrapper">
        <table className="metadata-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Label</th>
              <th>Type</th>
              <th>Mandatory</th>
              <th>Multi</th>
              <th>Max Multi</th>
              <th>Position</th>
              <th>Min Len</th>
              <th>Max Len</th>
              <th>Max File Size</th>
              <th>Options</th>
              <th>Children</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan="12" className="empty-message">
                  No fields defined yet. Click "+ Add New Field" to begin.
                </td>
              </tr>
            ) : (
              fields.map(([key, f]) => {
                const isGroup = f.type === "group";

                return (
                  <React.Fragment key={key}>
                    <tr>
                      <td>
                        <strong>{key}</strong>
                        {isGroup && (
                          <button
                            className="expand-toggle-btn"
                            onClick={() => {
                              setExpandedGroups((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                              }));
                            }}
                            aria-label={
                              expandedGroups[key]
                                ? "Collapse group"
                                : "Expand group"
                            }
                            title={expandedGroups[key] ? "Collapse" : "Expand"}
                          >
                            {expandedGroups[key] ? "−" : "+"}
                          </button>
                        )}
                      </td>
                      <td>{f.label || "-"}</td>
                      <td>
                        {f.type === "group" ? "Group" : f.type || "string"}
                      </td>
                      <td className="yes-no-icon">
                        {f.mandatory ? (
                          <span className="yes-icon">✓</span>
                        ) : (
                          <span className="no-icon">−</span>
                        )}
                      </td>
                      <td className="yes-no-icon">
                        {f.multi || f.multivalued ? (
                          <span className="yes-icon">✓</span>
                        ) : (
                          <span className="no-icon">−</span>
                        )}
                      </td>
                      <td>{f.max_multifield || "-"}</td>
                      <td>{f.position ? `[${f.position.join(", ")}]` : "-"}</td>
                      <td>{f.min_length || "-"}</td>
                      <td>{f.max_length || "-"}</td>
                      <td>
                        {f.max_file_size
                          ? `${(f.max_file_size / 1024 / 1024).toFixed(1)} MB`
                          : "-"}
                      </td>
                      <td>
                        {Array.isArray(f.options) ? f.options.join(", ") : "-"}
                      </td>
                      <td>
                        {isGroup
                          ? `${f.fields?.length || 0} child field${
                              (f.fields?.length || 0) !== 1 ? "s" : ""
                            }`
                          : "-"}
                      </td>
                    </tr>

                    {/* Expanded Child Fields */}
                    {isGroup &&
                      expandedGroups[key] &&
                      f.fields &&
                      f.fields.length > 0 && (
                        <tr>
                          <td colSpan="12" style={{ padding: "0" }}>
                            <div className="group-children-expanded">
                              <div className="children-header">
                                <strong>Child Fields</strong>
                              </div>
                              <table className="child-table">
                                <thead>
                                  <tr>
                                    <th>Key</th>
                                    <th>Label</th>
                                    <th>Type</th>
                                    <th>Mandatory</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {f.fields.map((child, idx) => (
                                    <tr key={idx}>
                                      <td>
                                        <code>{child.field_name || "-"}</code>
                                      </td>
                                      <td>{child.label || "-"}</td>
                                      <td>{child.type || "string"}</td>
                                      <td className="yes-no-icon">
                                        {child.mandatory ? (
                                          <span className="yes-icon">✓</span>
                                        ) : (
                                          <span className="no-icon">−</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-message">
              <strong>
                {toast.type === "success" && "✓ "}
                {toast.type === "error" && "⚠ "}
                {toast.type === "info" && "ℹ "}
              </strong>
              {toast.message}
            </div>
            {toast.duration > 0 && (
              <button
                className="toast-close"
                onClick={() => removeToast(toast.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Field Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Field</h2>
            <div className="modal-form">
              <div className="form-grid">
                <label>
                  <span className="label-text">Key / Field Name</span>
                  <input
                    type="text"
                    value={formData.field_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, field_name: e.target.value })
                    }
                    placeholder="e.g. beneficiary_contact"
                  />
                </label>

                <label>
                  <span className="label-text">Label</span>
                  <input
                    type="text"
                    value={formData.label || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder="Beneficiary Contact"
                  />
                </label>

                <label>
                  <span className="label-text">Type</span>
                  <select
                    value={formData.type || "string"}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="string">string</option>
                    <option value="int">int</option>
                    <option value="amount">amount</option>
                    <option value="date">date</option>
                    <option value="select">select</option>
                    <option value="tel">tel</option>
                    <option value="email">email</option>
                    <option value="textarea">textarea</option>
                    <option value="file">file</option>
                    <option value="group">group</option>
                  </select>
                </label>

                <div className="checkbox-group">
                  <span
                    className={`checkbox-icon ${
                      formData.mandatory ? "yes" : "no"
                    }`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        mandatory: !formData.mandatory,
                      })
                    }
                  >
                    {formData.mandatory ? "✓" : "−"}
                  </span>
                  <span className="label-text">Mandatory</span>
                </div>

                <div className="checkbox-group">
                  <span
                    className={`checkbox-icon ${formData.multi ? "yes" : "no"}`}
                    onClick={() =>
                      setFormData({ ...formData, multi: !formData.multi })
                    }
                  >
                    {formData.multi ? "✓" : "−"}
                  </span>
                  <span className="label-text">Multi-valued</span>
                </div>

                {formData.multi && (
                  <label>
                    <span className="label-text">Max Multi-field Count</span>
                    <input
                      type="number"
                      value={formData.max_multifield || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_multifield: e.target.value
                            ? Number(e.target.value)
                            : "",
                        })
                      }
                      min="1"
                    />
                  </label>
                )}

                {formData.type === "file" && (
                  <label>
                    <span className="label-text">Max File Size (bytes)</span>
                    <input
                      type="number"
                      value={formData.max_file_size || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_file_size: e.target.value
                            ? Number(e.target.value)
                            : "",
                        })
                      }
                      placeholder="5242880 = 5MB"
                    />
                  </label>
                )}

                {formData.type === "select" && (
                  <label>
                    <span className="label-text">
                      Options (comma separated)
                    </span>
                    <input
                      type="text"
                      value={(formData.options || []).join(", ")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter((o) => o),
                        })
                      }
                      placeholder="Cash, Cheque, Transfer"
                    />
                  </label>
                )}

                <label>
                  <span className="label-text">Position (Row, Col)</span>
                  <div className="position-inputs">
                    <input
                      type="number"
                      placeholder="Row"
                      value={formData.position?.[0] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          position: [
                            Number(e.target.value) || 1,
                            formData.position?.[1] || 1,
                          ],
                        })
                      }
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Col"
                      value={formData.position?.[1] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          position: [
                            formData.position?.[0] || 1,
                            Number(e.target.value) || 1,
                          ],
                        })
                      }
                      min="1"
                    />
                  </div>
                </label>

                <label>
                  <span className="label-text">Min Length</span>
                  <input
                    type="number"
                    value={formData.min_length || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_length: e.target.value
                          ? Number(e.target.value)
                          : "",
                      })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Max Length</span>
                  <input
                    type="number"
                    value={formData.max_length || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_length: e.target.value
                          ? Number(e.target.value)
                          : "",
                      })
                    }
                  />
                </label>
              </div>

              {/* Group Children Editor - Clean Card Style */}
              {isGroupType && (
                <div className="group-section">
                  <div className="group-header">
                    <h3>Child Fields ({groupChildren.length})</h3>
                    <button className="add-child-btn" onClick={addGroupChild}>
                      + Add Child Field
                    </button>
                  </div>

                  {groupChildren.length === 0 ? (
                    <div className="empty-group">
                      No child fields yet. Add one above.
                    </div>
                  ) : (
                    <div className="group-children">
                      {groupChildren.map((child, idx) => (
                        <div key={idx} className="child-card">
                          <div className="child-row">
                            <input
                              placeholder="Field Name"
                              value={child.field_name || ""}
                              onChange={(e) =>
                                updateGroupChild(
                                  idx,
                                  "field_name",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              placeholder="Label"
                              value={child.label || ""}
                              onChange={(e) =>
                                updateGroupChild(idx, "label", e.target.value)
                              }
                            />
                          </div>
                          <div className="child-row">
                            <select
                              value={child.type || "string"}
                              onChange={(e) =>
                                updateGroupChild(idx, "type", e.target.value)
                              }
                            >
                              <option value="string">string</option>
                              <option value="int">int</option>
                              <option value="tel">tel</option>
                              <option value="email">email</option>
                              <option value="date">date</option>
                            </select>
                            <div className="checkbox-group">
                              <span
                                className={`checkbox-icon ${
                                  child.mandatory ? "yes" : "no"
                                }`}
                                onClick={() =>
                                  updateGroupChild(
                                    idx,
                                    "mandatory",
                                    !child.mandatory
                                  )
                                }
                              >
                                {child.mandatory ? "✓" : "−"}
                              </span>
                              <span>Mandatory</span>
                            </div>
                            <button
                              className="delete-child-btn"
                              onClick={() => deleteGroupChild(idx)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={closeModal}>Cancel</button>
              <button className="save-btn" onClick={saveField}>
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataAddOnlyPage;
