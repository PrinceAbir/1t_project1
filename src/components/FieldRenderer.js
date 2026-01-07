import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import "./FieldRenderer.css";
import { loadDropdownOptions } from "../services/DropdownService";

const FieldRenderer = ({
  field = {},
  value,
  onChange,
  error,
  tabId = "tab",
  readOnly = false,
}) => {
  const id = field?.id || field?.field_name || field?.fieldName || "";
  const label = field?.label || field?.label_name || field?.field_name || "";
  const rawType = field?.type || field?.metadata?.type || "string";
  const type = String(rawType).toLowerCase();
  const required =
    field?.required ?? field?.metadata?.required ?? field?.mandatory ?? false;
  const multi =
    field?.multi ?? field?.metadata?.multi ?? field?.multivalued ?? false;
  const options = useMemo(
    () => field?.options || field?.metadata?.options || [],
    [field?.options, field?.metadata?.options]
  );
  const maxMulti = field?.max_multifield ?? field?.metadata?.max_multifield;

  const groupMulti =
    field?.multivalued ?? field?.multi ?? field?.metadata?.multivalued ?? false;

  const [dropdownOptions, setDropdownOptions] = useState(options || []);
  const [fileError, setFileError] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(() =>
    Array.isArray(value) ? value.map(() => false) : []
  );

  // Extract dropdown properties from field
  const { dropdown, dropdownType, dropdownName } = field || {};

  useEffect(() => {
    // If field declares a dropdown source, prefer loading via DropdownService
    try {
      if (field && field.dropdown && field.dropdown.source) {
        const mapped = loadDropdownOptions(field);
        setDropdownOptions(mapped || []);
        return;
      }

      // legacy/dynamic inline mapping fallback
      if (dropdown && dropdownType === "dynamic" && dropdownName) {
        const dynamicData = {
          ACCOUNT: ["Checking", "Savings", "Business"],
          CURRENCY: ["USD", "EUR", "BDT"],
          COUNTRY: ["Bangladesh", "USA", "UK"],
          STATUS: ["Active", "Inactive"],
        };
        const dynamicOptions = dynamicData[dropdownName] || [];
        setDropdownOptions(
          dynamicOptions.map((opt) => ({ value: opt, label: opt }))
        );
        return;
      }

      setDropdownOptions(options || []);
    } catch (e) {
      console.debug("FieldRenderer: error loading dropdown options", e);
      setDropdownOptions(options || []);
    }
  }, [field, dropdown, dropdownType, dropdownName, options]);

  // Handle expand field events for group collapsing
  useEffect(() => {
    const handler = (ev) => {
      const targetId = ev?.detail;
      if (!targetId) return;

      const baseId = `${tabId}_${id}`;

      // If group and the target references this group's index or child, open that group instance
      if (type === "group" && targetId.startsWith(baseId + "_")) {
        const rest = targetId.slice((baseId + "_").length);
        const parts = rest.split("_");
        const firstIdx = parseInt(parts[0], 10);
        if (!Number.isNaN(firstIdx)) {
          setCollapsedGroups((prev) => {
            const n = [...(prev || [])];
            if (n[firstIdx] === true) n[firstIdx] = false;
            return n;
          });
          return;
        }
        const lastIdx = parseInt(parts[parts.length - 1], 10);
        if (!Number.isNaN(lastIdx)) {
          setCollapsedGroups((prev) => {
            const n = [...(prev || [])];
            if (n[lastIdx] === true) n[lastIdx] = false;
            return n;
          });
        }
      }
    };

    document.addEventListener("expandField", handler);
    return () => document.removeEventListener("expandField", handler);
  }, [tabId, id, type, value]);

  const rawChildren =
    field.children ||
    field.metadata?.children ||
    field.fields ||
    field.metadata?.fields ||
    [];
  const children = Array.isArray(rawChildren)
    ? rawChildren.map((c) => ({
        id:
          c.id ||
          c.field_name ||
          c.fieldName ||
          String(c.field_name || c.id || ""),
        label:
          c.label || c.label_name || c.field_name || c.fieldName || c.id || "",
        type: String(c.type || c.metadata?.type || "string").toLowerCase(),
        max_length:
          c.max_length ?? c.maxLength ?? c.metadata?.max_length ?? undefined,
        required: c.required ?? c.mandatory ?? false,
        // === NEW: Preserve multi and max_multifield ===
        multi:
          c.multi ??
          c.multivalued ??
          c.metadata?.multi ??
          c.metadata?.multivalued ??
          false,
        max_multifield:
          c.max_multifield ?? c.metadata?.max_multifield ?? undefined,
      }))
    : [];

    
  const sanitizeTel = (val, maxLen = 15) =>
    String(val || "")
      .replace(/[^0-9+]/g, "")
      .slice(0, maxLen);

  const emitChange = (newVal) => {
    if (onChange) onChange(id, newVal);
  };

  const handleSingleChange = (val) => {
    if (readOnly) return;
    emitChange(val);
  };

  const handleMultiChange = (val, idx = null) => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    if (idx === null) arr.push(val);
    else arr[idx] = val;
    emitChange(arr);
  };

  const removeMulti = (idx) => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    if (arr.length <= 1) return;
    arr.splice(idx, 1);
    emitChange(arr);
  };

  const addMulti = () => {
    if (readOnly) return;
    const arr = Array.isArray(value) ? [...value] : [];
    if (maxMulti && arr.length >= maxMulti) return;
    if (type === "group") {
      if (!groupMulti) return;
      const empty = children.reduce((acc, c) => ({ ...acc, [c.id]: "" }), {});
      emitChange([...arr, empty]);
    } else {
      emitChange([...arr, ""]);
    }
  };

  const handleGroupChildChange = (childId, childVal, groupIdx) => {
    if (readOnly) return;
    const groups = Array.isArray(value) ? [...value] : [value || {}];
    groups[groupIdx] = { ...(groups[groupIdx] || {}), [childId]: childVal };
    emitChange(groups);
  };

  const toggleCollapse = (idx) =>
    setCollapsedGroups((p) => {
      const n = [...p];
      n[idx] = !n[idx];
      return n;
    });

  // Custom Dropdown Component from 2nd code
  const CustomDropdown = ({ options, value, onSelect }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const [highlight, setHighlight] = useState(0);

    useEffect(() => {
      const close = (e) =>
        ref.current && !ref.current.contains(e.target) && setOpen(false);
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }, []);

    const display = (() => {
      if (value === undefined || value === null || value === "")
        return "Select...";
      const found = (options || []).find((o) => (o.value ?? o) === value);
      return (found && (found.label ?? found)) || value;
    })();

    const selectedOption = (options || []).find(
      (o) => (o.value ?? o) === value
    );

    return (
      <div className="custom-dropdown" ref={ref}>
        <button
          id={`${tabId}_${id}`}
          data-alt-id={`${tabId}_${id}_toggle`}
          type="button"
          className={`t24-input custom-dropdown-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen(!open)}
          disabled={readOnly}
          aria-haspopup="listbox"
          aria-expanded={open}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, (options || []).length - 1));
              setOpen(true);
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const opt = (options || [])[highlight];
              if (opt) {
                onSelect(opt.value ?? opt);
                setOpen(false);
              }
            }
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <span className="item-label">
              {selectedOption?.label ?? display}
            </span>
            {selectedOption?.detail && (
              <small className="item-detail">{selectedOption.detail}</small>
            )}
          </div>
          <span className="caret">▾</span>
        </button>
        {open && (
          <div className="custom-dropdown-menu">
            {(() => {
              const opts = options || [];
              const firstRaw = opts.length ? opts[0].raw : null;
              const isTable =
                firstRaw &&
                typeof firstRaw === "object" &&
                !Array.isArray(firstRaw);

              if (!isTable) {
                return opts.map((o, i) => (
                  <div
                    key={i}
                    className={`custom-dropdown-item ${
                      i === highlight ? "highlight" : ""
                    }`}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => {
                      onSelect(o.value ?? o);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={i === highlight}
                  >
                    <div className="item-label">{o.label ?? o}</div>
                    {o.detail && <div className="item-detail">{o.detail}</div>}
                  </div>
                ));
              }

              // render as small table: headers from keys of raw object
              const headers = Object.keys(firstRaw);
              return (
                <table className="dropdown-table">
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {opts.map((o, i) => (
                      <tr
                        key={i}
                        className={i === highlight ? "highlight" : ""}
                        onMouseEnter={() => setHighlight(i)}
                        onClick={() => {
                          onSelect(o.value ?? o);
                          setOpen(false);
                        }}
                        role="option"
                        aria-selected={i === highlight}
                      >
                        {headers.map((h) => (
                          <td key={h}>{String((o.raw && o.raw[h]) ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  const renderMulti = () => {
    const arr = Array.isArray(value) ? value : [""];
    const errs = Array.isArray(error) ? error : [];
    
    // Show add button on the first field if array is empty or has only one item
    const showAddButtonOnField = arr.length <= 1;
    
    return (
      <div className="multi-fields-container">
        {arr.map((v, i) => (
          <div key={i} className="multi-field-row">
            <input
              id={`${tabId}_${id}_${i}`}
              value={v ?? ""}
              onChange={(e) => {
                if (type === "tel" || type === "phone") {
                  const maxLen = field?.max_length ?? 15;
                  handleMultiChange(sanitizeTel(e.target.value, maxLen), i);
                } else {
                  handleMultiChange(e.target.value, i);
                }
              }}
              inputMode={type === "tel" || type === "phone" ? "tel" : undefined}
              maxLength={
                type === "tel" || type === "phone"
                  ? field?.max_length ?? 15
                  : undefined
              }
              className={`t24-input ${errs[i] ? "error" : ""}`}
              disabled={readOnly}
            />
            {errs[i] && <div className="t24-error">{errs[i]}</div>}
            
            {/* Add button on same line (for first field when empty or single) */}
            {!readOnly && showAddButtonOnField && i === 0 && (!maxMulti || arr.length < maxMulti) && (
              <button
                type="button"
                className="add-multi-field"
                title={`Add another ${label}`}
                aria-label={`Add another ${label}`}
                onClick={addMulti}
              >
                +
              </button>
            )}
            
            {/* Remove button for items beyond the first */}
            {!readOnly && arr.length > 1 && (
              <button
                type="button"
                className="remove-multi-field"
                title={`Remove ${label}`}
                aria-label={`Remove ${label}`}
                onClick={() => removeMulti(i)}
              >
                <span className="remove-icon" aria-hidden>
                  −
                </span>
                <span className="sr-only">Remove {label}</span>
              </button>
            )}
          </div>
        ))}
        
        {/* Add button at bottom for when we have multiple items */}
        {!readOnly && arr.length > 1 && (!maxMulti || arr.length < maxMulti) && (
          <button type="button" className="add-multi-field" onClick={addMulti}>
            + 
          </button>
        )}
      </div>
    );
  };

  const renderGroup = () => {
    const groups = Array.isArray(value) ? value : [value || {}];
    const errs = Array.isArray(error) ? error : [];

    return (
      <div className="group-fields-container">
        {groups.map((grp, gi) => (
          <div key={gi} className="group-instance">
            <div className="group-children">
              {children.map((ch) => {
                const childErr =
                  errs[gi] && errs[gi][ch.id] ? errs[gi][ch.id] : "";
                const childValue =
                  (grp && grp[ch.id]) || (ch.multi ? [""] : "");
                const isChildMulti = !!ch.multi;

                // Single child field inside group
                if (!isChildMulti) {
                  return (
                    <div key={ch.id} className="group-child-row">
                      <label htmlFor={`${tabId}_${id}_${gi}_${ch.id}`}>
                        {ch.label}
                        {ch.required && (
                          <span className="required-asterisk">*</span>
                        )}
                      </label>
                      <div className="t24-input-container">
                        {ch.type === "tel" || ch.type === "phone" ? (
                          <input
                            id={`${tabId}_${id}_${gi}_${ch.id}`}
                            value={childValue ?? ""}
                            onChange={(e) =>
                              handleGroupChildChange(
                                ch.id,
                                sanitizeTel(
                                  e.target.value,
                                  ch.max_length ?? field?.max_length ?? 15
                                ),
                                gi
                              )
                            }
                            className={`t24-input ${childErr ? "error" : ""}`}
                            disabled={readOnly}
                            inputMode="tel"
                            maxLength={ch.max_length ?? field?.max_length ?? 15}
                          />
                        ) : (
                          <input
                            id={`${tabId}_${id}_${gi}_${ch.id}`}
                            value={childValue ?? ""}
                            onChange={(e) =>
                              handleGroupChildChange(ch.id, e.target.value, gi)
                            }
                            className={`t24-input ${childErr ? "error" : ""}`}
                            disabled={readOnly}
                          />
                        )}
                        {childErr && <div className="t24-error">{childErr}</div>}
                      </div>
                    </div>
                  );
                }

                // === NESTED MULTI FIELD INSIDE GROUP ===
                const childArr = Array.isArray(childValue) ? childValue : [""];
                const childMax = ch.max_multifield ?? null;
                const showAddButtonOnField = childArr.length <= 1;

                return (
                  <div key={ch.id} className="group-child-multi-container">
                    <label className="t24-label">
                      {ch.label}
                      {ch.required && (
                        <span className="required-asterisk">*</span>
                      )}
                    </label>

                    <div className="multi-fields-container">
                      {childArr.map((val, ci) => (
                        <div key={ci} className="multi-field-row">
                          {ch.type === "tel" || ch.type === "phone" ? (
                            <input
                              id={`${tabId}_${id}_${gi}_${ch.id}_${ci}`}
                              value={val ?? ""}
                              onChange={(e) => {
                                const sanitized = sanitizeTel(
                                  e.target.value,
                                  ch.max_length ?? field?.max_length ?? 15
                                );
                                const newChildArr = [...childArr];
                                newChildArr[ci] = sanitized;
                                handleGroupChildChange(ch.id, newChildArr, gi);
                              }}
                              className={`t24-input ${
                                Array.isArray(childErr) && childErr[ci]
                                  ? "error"
                                  : ""
                              }`}
                              disabled={readOnly}
                              inputMode="tel"
                              maxLength={
                                ch.max_length ?? field?.max_length ?? 15
                              }
                            />
                          ) : (
                            <input
                              id={`${tabId}_${id}_${gi}_${ch.id}_${ci}`}
                              value={val ?? ""}
                              onChange={(e) => {
                                const newChildArr = [...childArr];
                                newChildArr[ci] = e.target.value;
                                handleGroupChildChange(ch.id, newChildArr, gi);
                              }}
                              className={`t24-input ${
                                Array.isArray(childErr) && childErr[ci]
                                  ? "error"
                                  : ""
                              }`}
                              disabled={readOnly}
                            />
                          )}

                          {Array.isArray(childErr) && childErr[ci] && (
                            <div className="t24-error">{childErr[ci]}</div>
                          )}

                          {/* Add button on same line for nested multi fields */}
                          {!readOnly && showAddButtonOnField && ci === 0 && (!childMax || childArr.length < childMax) && (
                            <button
                              type="button"
                              className="add-multi-field"
                              title={`Add another ${ch.label}`}
                              aria-label={`Add another ${ch.label}`}
                              onClick={() => {
                                const newChildArr = [...childArr, ""];
                                handleGroupChildChange(ch.id, newChildArr, gi);
                              }}
                            >
                              +
                            </button>
                          )}

                          {!readOnly && childArr.length > 1 && (
                            <button
                              type="button"
                              className="remove-multi-field"
                              title={`Remove ${ch.label}`}
                              aria-label={`Remove ${ch.label}`}
                              onClick={() => {
                                const newChildArr = [...childArr];
                                newChildArr.splice(ci, 1);
                                handleGroupChildChange(ch.id, newChildArr, gi);
                              }}
                            >
                              <span className="remove-icon" aria-hidden>
                                −
                              </span>
                              <span className="sr-only">Remove {ch.label}</span>
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add button at bottom for nested multi fields with multiple items */}
                      {!readOnly && childArr.length > 1 && (!childMax || childArr.length < childMax) && (
                        <button
                          type="button"
                          className="add-multi-field"
                          onClick={() => {
                            const newChildArr = [...childArr, ""];
                            handleGroupChildChange(ch.id, newChildArr, gi);
                          }}
                        >
                          + 
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Remove entire group instance */}
            {!readOnly && groupMulti && groups.length > 1 && (
              <div className="group-actions">
                <button
                  type="button"
                  className="remove-multi-field"
                  title={`Remove ${label}`}
                  aria-label={`Remove ${label}`}
                  onClick={() => {
                    const arr = [...groups];
                    arr.splice(gi, 1);
                    emitChange(arr);
                  }}
                >
                  <span className="remove-icon" aria-hidden>
                    −
                  </span>
                  <span className="sr-only">Remove {label}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add new group instance - positioned at the bottom */}
        {!readOnly && groupMulti && (!maxMulti || groups.length < maxMulti) && (
          <button type="button" className="add-multi-field" onClick={addMulti}>
            + 
          </button>
        )}
      </div>
    );
  };

  const singleError = Array.isArray(error) ? "" : error;
  const typeNorm = (type || "").toLowerCase();

  const renderSingle = () => {
    // Handle dropdown type with CustomDropdown component from 2nd code
    if (
      typeNorm === "dropdown" ||
      (dropdown && dropdownOptions && dropdownOptions.length)
    ) {
      return (
        <CustomDropdown
          options={dropdownOptions.length ? dropdownOptions : options}
          value={value}
          onSelect={handleSingleChange}
        />
      );
    }

    if (
      typeNorm === "select" ||
      typeNorm === "account" ||
      (options && options.length)
    ) {
      const opts =
        dropdownOptions && dropdownOptions.length ? dropdownOptions : options;
      return (
        <select
          id={`${tabId}_${id}`}
          value={value ?? ""}
          onChange={(e) => handleSingleChange(e.target.value)}
          required={required}
          disabled={readOnly}
          className={`t24-input ${singleError ? "error" : ""}`}
        >
          <option value="">Select...</option>
          {(opts || []).map((opt) => {
            const val =
              opt && typeof opt === "object"
                ? opt.value ?? opt.id ?? opt.key
                : opt;
            const lbl =
              opt && typeof opt === "object"
                ? opt.label ?? opt.name ?? String(val)
                : String(opt);
            return (
              <option key={String(val)} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
      );
    }

    if (typeNorm === "textarea") {
      const fieldElemId = `${tabId}_${id}`;
      if (minimized) {
        return (
          <div className="field-minimized-row">
            <div className="field-minimized-preview">
              {String(value ?? "").slice(0, 80) || "Empty"}
            </div>
            <button
              className="minimize-field-btn"
              onClick={() => setMinimized(false)}
              aria-label="Expand field"
            >
              ▴
            </button>
          </div>
        );
      }

      return (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <textarea
            id={fieldElemId}
            className={`t24-input ${singleError ? "error" : ""}`}
            value={value ?? ""}
            onChange={(e) => handleSingleChange(e.target.value)}
            disabled={readOnly}
            rows={4}
          />
          <button
            className="minimize-field-btn"
            onClick={() => setMinimized(true)}
            aria-label="Minimize field"
          >
            −
          </button>
        </div>
      );
    }

    if (
      ["int", "integer", "number", "double", "amount", "float"].includes(
        typeNorm
      )
    ) {
      const step =
        typeNorm === "int" || typeNorm === "integer"
          ? "1"
          : typeNorm === "amount"
          ? "0.01"
          : "any";
      return (
        <input
          id={`${tabId}_${id}`}
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            handleSingleChange(e.target.value === "" ? "" : e.target.value)
          }
          className={`t24-input ${singleError ? "error" : ""}`}
          disabled={readOnly}
          step={step}
        />
      );
    }

    if (typeNorm === "date") {
      return (
        <input
          id={`${tabId}_${id}`}
          type="date"
          value={value ?? ""}
          onChange={(e) => handleSingleChange(e.target.value)}
          className={`t24-input ${singleError ? "error" : ""}`}
          disabled={readOnly}
        />
      );
    }

    if (typeNorm === "email") {
      return (
        <input
          id={`${tabId}_${id}`}
          type="email"
          value={value ?? ""}
          onChange={(e) => handleSingleChange(e.target.value)}
          className={`t24-input ${singleError ? "error" : ""}`}
          disabled={readOnly}
        />
      );
    }
    if (typeNorm === "tel" || typeNorm === "phone") {
      return (
        <input
          id={`${tabId}_${id}`}
          type="tel"
          value={value ?? ""}
          onChange={(e) => handleSingleChange(e.target.value)}
          className={`t24-input ${singleError ? "error" : ""}`}
          disabled={readOnly}
        />
      );
    }

    if (typeNorm === "file") {
      const maxSize = field?.max_file_size ?? field?.maxFileSize ?? undefined;
      const handleFileInput = (e) => {
        if (readOnly) return;
        setFileError("");
        const files = Array.from(e.target.files || []);
        if (maxSize) {
          const accepted = [];
          const rejected = [];
          files.forEach((f) => {
            if (f.size > maxSize) rejected.push(f.name || f.path || "file");
            else accepted.push(f);
          });
          if (rejected.length) {
            setFileError(
              `File(s) too large: ${rejected.join(", ")} (max ${Math.round(
                maxSize / 1024
              )} KB)`
            );
          }
          emitChange(multi ? accepted : accepted[0] || null);
        } else {
          emitChange(multi ? files : files[0] || null);
        }
      };
      return (
        <div>
          <input
            id={`${tabId}_${id}`}
            type="file"
            multiple={multi}
            onChange={handleFileInput}
            className={`t24-input ${singleError || fileError ? "error" : ""}`}
            disabled={readOnly}
          />
          {fileError && <div className="t24-error">{fileError}</div>}
        </div>
      );
    }

    // Attachment type: show file input + list of attachments with remove support
    if (typeNorm === "attachment") {
      const attachments = Array.isArray(value) ? value : value ? [value] : [];
      const handleFileChange = (e) => {
        if (readOnly) return;
        setFileError("");
        const files = Array.from(e.target.files || []);
        const maxSize = field?.max_file_size ?? field?.maxFileSize ?? undefined;
        if (maxSize) {
          const accepted = [];
          const rejected = [];
          files.forEach((f) => {
            if (f.size > maxSize) rejected.push(f.name || "file");
            else accepted.push(f);
          });
          if (rejected.length) {
            setFileError(
              `File(s) too large: ${rejected.join(", ")} (max ${Math.round(
                maxSize / 1024
              )} KB)`
            );
          }
          emitChange(multi ? accepted : accepted[0] || null);
        } else {
          emitChange(multi ? files : files[0] || null);
        }
      };
      const removeAttachment = (idx) => {
        if (readOnly) return;
        const arr = Array.isArray(value) ? [...value] : [];
        arr.splice(idx, 1);
        emitChange(arr);
      };
      return (
        <div>
          <input
            id={`${tabId}_${id}`}
            type="file"
            multiple={multi}
            onChange={handleFileChange}
            className={`t24-input ${singleError || fileError ? "error" : ""}`}
            disabled={readOnly}
          />
          {fileError && <div className="t24-error">{fileError}</div>}
          <div className="attachment-list">
            {attachments.map((att, i) => {
              const name = att && att.name ? att.name : String(att);
              const url = att && att.url ? att.url : null;
              return (
                <div key={i} className="attachment-item">
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer">
                      {name}
                    </a>
                  ) : (
                    <span>{name}</span>
                  )}
                  {!readOnly && (
                    <button
                      type="button"
                      className="remove-attachment"
                      onClick={() => removeAttachment(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <input
        id={`${tabId}_${id}`}
        value={value ?? ""}
        onChange={(e) => handleSingleChange(e.target.value)}
        className={`t24-input ${singleError ? "error" : ""}`}
        disabled={readOnly}
      />
    );
  };

  return (
    <div className="t24-form-field">
      <label
        htmlFor={`${tabId}_${id}`}
        className={`t24-label ${singleError ? "error" : ""}`}
      >
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      <div className="t24-input-container">
        {typeNorm === "group"
          ? renderGroup()
          : multi
          ? renderMulti()
          : renderSingle()}
        {!multi && singleError && (
          <div className="t24-error">{singleError}</div>
        )}
      </div>
    </div>
  );
};

export default memo(FieldRenderer);