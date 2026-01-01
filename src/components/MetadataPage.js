import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MetadataPage.css";

const API_BASE = "http://localhost:5000/api/metadata";

const MetadataPage = () => {
  const { module } = useParams();
  const navigate = useNavigate();

  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [formData, setFormData] = useState({});

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [currentGroupKey, setCurrentGroupKey] = useState(null);
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

  const confirmDelete = (key, onConfirm) => {
    const id = Date.now();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message: `Delete field "${key}" permanently?`,
        type: "warning",
        actions: (
          <>
            <button
              className="toast-btn yes"
              onClick={() => {
                onConfirm();
                removeToast(id);
                addToast(`Field "${key}" deleted`, "success");
              }}
            >
              Yes
            </button>
            <button className="toast-btn no" onClick={() => removeToast(id)}>
              No
            </button>
          </>
        ),
        duration: 0,
      },
    ]);
  };

  useEffect(() => {
    const endpoint = module === "funds" ? "fundtransfer" : module;

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/${endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load metadata`);
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message || "Failed to connect to metadata server");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [module]);

  const fields = metadata?.fields ? Object.entries(metadata.fields) : [];

  const markChanged = () => setHasChanges(true);

  const openModal = (key = null) => {
    if (key && metadata?.fields[key]) {
      const field = metadata.fields[key];

      if (field.type === "group") {
        setCurrentGroupKey(key);
        setGroupChildren(field.fields || []);
        setGroupModalOpen(true);
        return;
      }

      setEditingKey(key);
      setFormData({ ...field });
      setModalOpen(true);
    } else {
      setEditingKey(null);
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
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingKey(null);
    setFormData({});
  };

  const closeGroupModal = () => {
    setGroupModalOpen(false);
    setCurrentGroupKey(null);
    setGroupChildren([]);
  };

  // Conditional field visibility helpers
  const isSelectType = formData.type === "select";
  const isMultiValue = formData.multi;
  const isGroupType = formData.type === "group";
  const isFileType = formData.type === "file";

  const saveField = async () => {
    if (!formData.field_name?.trim()) {
      addToast("Field name is required", "error");
      return;
    }

    const key =
      editingKey ||
      formData.field_name.trim().toLowerCase().replace(/\s+/g, "_");

    if (!editingKey && metadata?.fields[key]) {
      addToast(`Field "${key}" already exists`, "error");
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
    };

    Object.keys(cleaned).forEach(
      (k) => cleaned[k] === undefined && delete cleaned[k]
    );

    const endpoint = module === "funds" ? "fundtransfer" : module;
    const url = `${API_BASE}/${endpoint}/field${editingKey ? `/${key}` : ""}`;

    try {
      const response = await fetch(url, {
        method: editingKey ? "PATCH" : "POST", // ← POST for new, PATCH for edit
        headers: { "Content-Type": "application/json" },
        body: editingKey
          ? JSON.stringify(cleaned) // PATCH: send definition directly
          : JSON.stringify({ key, definition: cleaned }), // POST: wrap in { key, definition }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Save failed (${response.status}): ${errText}`);
      }

      // Update local state
      const newFields = { ...metadata.fields, [key]: cleaned };
      setMetadata({ ...metadata, fields: newFields });
      markChanged();
      addToast(
        editingKey ? "Field updated on server" : "New field created on server",
        "success"
      );
      closeModal();
    } catch (err) {
      console.error("Save error:", err);
      addToast("Failed to save field to server", "error");
    }
  };

  const saveGroupField = async () => {
    if (!currentGroupKey || groupChildren.length === 0) {
      addToast("Group must have at least one child field", "error");
      return;
    }

    const updatedGroup = {
      ...metadata.fields[currentGroupKey],
      fields: groupChildren,
    };

    const endpoint = module === "funds" ? "fundtransfer" : module;

    try {
      const response = await fetch(
        `${API_BASE}/${endpoint}/field/${currentGroupKey}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedGroup),
        }
      );

      if (!response.ok) throw new Error("Failed to update group");

      const newFields = { ...metadata.fields, [currentGroupKey]: updatedGroup };
      setMetadata({ ...metadata, fields: newFields });
      markChanged();
      addToast("Group field updated", "success");
      closeGroupModal();
    } catch (err) {
      addToast("Failed to save group", "error");
    }
  };

  const addGroupChild = () => {
    setGroupChildren([
      ...groupChildren,
      {
        field_name: "",
        label: "",
        type: "string",
        mandatory: false,
      },
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

  const deleteField = (key) => {
    confirmDelete(key, async () => {
      const endpoint = module === "funds" ? "fundtransfer" : module;

      try {
        const response = await fetch(`${API_BASE}/${endpoint}/field/${key}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Delete failed");

        const { [key]: _, ...rest } = metadata.fields || {};
        setMetadata({ ...metadata, fields: rest });
        markChanged();
        addToast(`Field "${key}" deleted`, "success");
      } catch (err) {
        addToast("Failed to delete field", "error");
      }
    });
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

  if (loading) return <div>Loading metadata...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="metadata-page">
      <header className="metadata-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{getModuleDisplayName()} - Metadata Editor</h1>
        <div className="action-button-group">
          <button className="add-field-btn" onClick={() => openModal()}>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan="12" className="empty-message">
                  No fields defined
                </td>
              </tr>
            ) : (
              fields.map(([key, f]) => (
                <tr key={key}>
                  <td>
                    <strong>{key}</strong>
                  </td>
                  <td>{f.label || "-"}</td>
                  <td>{f.type === "group" ? "Group" : f.type || "string"}</td>
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
                    <div className="action-icons">
                      <button
                        className="icon-btn edit-icon"
                        onClick={() => openModal(key)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn delete-icon"
                        onClick={() => deleteField(key)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
                {toast.type === "warning" && "⚠ "}
                {toast.type === "info" && "ℹ "}
              </strong>
              {toast.message}
            </div>
            {toast.actions && (
              <div className="toast-actions">{toast.actions}</div>
            )}
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

      {/* Main Field Modal - FULL FORM */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingKey ? "Edit Field" : "Add New Field"}</h2>
            <div
              className="modal-content"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <div className="modal-form">
                <div className="form-row">
                  <label>
                    Key / Field Name
                    <input
                      type="text"
                      value={formData.field_name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, field_name: e.target.value })
                      }
                      disabled={!!editingKey}
                      placeholder="e.g. transaction_type"
                    />
                  </label>

                  <label>
                    Label
                    <input
                      type="text"
                      value={formData.label || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      placeholder="Transaction Type"
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Type
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
                      <option value="reference">reference</option>
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
                    Mandatory
                  </div>
                </div>

                <div className="form-row">
                  <div className="checkbox-group">
                    <span
                      className={`checkbox-icon ${
                        formData.multi ? "yes" : "no"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, multi: !formData.multi })
                      }
                    >
                      {formData.multi ? "✓" : "−"}
                    </span>
                    Multi-valued
                  </div>

                  <label style={{ display: formData.multi ? "block" : "none" }}>
                    Max Multi-field Count
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
                </div>

                {formData.type === "file" && (
                  <div className="form-row">
                    <label>
                      Max File Size (bytes)
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
                        placeholder="e.g. 5242880 for 5MB"
                      />
                    </label>
                  </div>
                )}

                {formData.type === "select" && (
                  <div className="form-row">
                    <label>
                      Options (comma separated)
                      <input
                        type="text"
                        placeholder="e.g. Internal Transfer, External Transfer"
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
                      />
                    </label>
                  </div>
                )}

                {formData.type === "group" && (
                  <div className="form-row">
                    <div className="group-info">
                      <p>
                        <strong>Note:</strong> Group fields are edited
                        separately. Click "Edit" to manage child fields.
                      </p>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <label>
                    Position (Row, Col)
                    <div style={{ display: "flex", gap: "8px" }}>
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
                    Min Length
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
                    Max Length
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
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closeModal}>Cancel</button>
              <button className="save-btn" onClick={saveField}>
                {editingKey ? "Update Field" : "Add Field"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Field Editor - Fixed */}
      {groupModalOpen && (
        <div className="modal-overlay" onClick={closeGroupModal}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Group: {currentGroupKey}</h2>
            <div
              className="group-editor"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <div className="children-header">
                <span>Child Fields ({groupChildren.length})</span>
                <button className="add-child-btn" onClick={addGroupChild}>
                  + Add Child Field
                </button>
              </div>

              {groupChildren.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  No child fields. Add one above.
                </div>
              ) : (
                groupChildren.map((child, idx) => (
                  <div key={idx} className="group-child-row">
                    <input
                      placeholder="Field Name"
                      value={child.field_name || ""}
                      onChange={(e) =>
                        updateGroupChild(idx, "field_name", e.target.value)
                      }
                      style={{ minWidth: "120px" }}
                    />
                    <input
                      placeholder="Label"
                      value={child.label || ""}
                      onChange={(e) =>
                        updateGroupChild(idx, "label", e.target.value)
                      }
                      style={{ minWidth: "140px" }}
                    />
                    <select
                      value={child.type || "string"}
                      onChange={(e) =>
                        updateGroupChild(idx, "type", e.target.value)
                      }
                      style={{ minWidth: "100px" }}
                    >
                      <option value="string">string</option>
                      <option value="int">int</option>
                      <option value="amount">amount</option>
                      <option value="date">date</option>
                      <option value="tel">tel</option>
                      <option value="email">email</option>
                    </select>
                    <div className="checkbox-group">
                      <span
                        className={`checkbox-icon ${
                          child.mandatory ? "yes" : "no"
                        }`}
                        onClick={() =>
                          updateGroupChild(idx, "mandatory", !child.mandatory)
                        }
                      >
                        {child.mandatory ? "✓" : "−"}
                      </span>
                      <span>Mandatory</span>
                    </div>
                    <button
                      className="icon-btn delete-icon"
                      onClick={() => deleteGroupChild(idx)}
                      title="Delete Child Field"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button onClick={closeGroupModal}>Cancel</button>
              <button
                className="save-btn"
                onClick={saveGroupField}
                disabled={groupChildren.length === 0}
              >
                Save Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataPage;
