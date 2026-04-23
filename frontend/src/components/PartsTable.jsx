import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../api.js';

// "ALL" means no filter; the rest match the backend's stage values.
const STAGE_FILTERS = ['ALL', 'SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];
// Stages used by the inline edit dropdown (no "ALL" here).
const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];

/**
 * PartsTable
 *
 * Fetches all parts from GET /api/parts and renders them in a table.
 * Rows are coloured red when stock is low (< 10) and green otherwise.
 * Each row has a Delete button that calls DELETE /api/parts/{id}.
 *
 * Props:
 *   - refreshKey: changes whenever the parent wants us to re-fetch
 *   - onPartDeleted: callback fired after a successful delete
 *   - onPartChanged: callback fired after advancing a part's stage
 */
export default function PartsTable({ refreshKey, onPartDeleted, onPartChanged }) {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  // Id of the row currently being edited (null = nothing being edited).
  const [editingId, setEditingId] = useState(null);
  // Working copy of the row's fields while editing.
  const [editForm, setEditForm] = useState(null);

  // Apply both the stage dropdown and the search box to the fetched list.
  // useMemo avoids re-filtering on every render.
  const visibleParts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return parts.filter((p) => {
      const matchesStage = stageFilter === 'ALL' || p.stage === stageFilter;
      const matchesSearch =
        term === '' ||
        p.partName.toLowerCase().includes(term) ||
        p.supplierName.toLowerCase().includes(term);
      return matchesStage && matchesSearch;
    });
  }, [parts, stageFilter, search]);

  // Re-fetch every time refreshKey changes (e.g., after add/delete).
  useEffect(() => {
    setLoading(true);
    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) => {
        setParts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load parts:', err);
        setLoading(false);
      });
  }, [refreshKey]);

  const handleDelete = (id) => {
    fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      .then(() => {
        if (onPartDeleted) onPartDeleted();
      })
      .catch((err) => console.error('Failed to delete part:', err));
  };

  // Calls PUT /api/parts/{id}/advance to move the part to the next stage.
  const handleAdvance = (id) => {
    fetch(`${API_BASE}/${id}/advance`, { method: 'PUT' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to advance part');
        if (onPartChanged) onPartChanged();
      })
      .catch((err) => console.error(err));
  };

  // Begin editing a row -- copy its current fields into editForm.
  const startEdit = (part) => {
    setEditingId(part.id);
    setEditForm({ ...part });
  };

  // Cancel without saving.
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Update one field of the in-progress edit form.
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'stockQuantity' ? Number(value) : value,
    }));
  };

  // Persist the edit via PUT /api/parts/{id}.
  const saveEdit = () => {
    fetch(`${API_BASE}/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update part');
        cancelEdit();
        if (onPartChanged) onPartChanged();
      })
      .catch((err) => console.error(err));
  };

  if (loading) return <p>Loading parts...</p>;

  return (
    <section className="card">
      <div className="table-header">
        <h2>All Parts</h2>
        <div className="table-controls">
          <label className="filter-label">
            Search:
            <input
              type="text"
              value={search}
              placeholder="Part or supplier..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="filter-label">
            Stage:
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              {STAGE_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <table className="parts-table">
        <thead>
          <tr>
            <th>Part Name</th>
            <th>Supplier</th>
            <th>Machine Model</th>
            <th>Stage</th>
            <th>Stock</th>
            <th>Advance</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {visibleParts.map((p) => {
            // Tag the row based on stock level so CSS can colour it.
            const rowClass = p.stockQuantity < 10 ? 'row-low' : 'row-ok';
            // DEPLOYED is the final stage -- no further advance possible.
            const isFinalStage = p.stage === 'DEPLOYED';
            const isEditing = editingId === p.id;

            // ---- Edit-mode row ----
            if (isEditing && editForm) {
              return (
                <tr key={p.id} className={rowClass}>
                  <td>
                    <input
                      name="partName"
                      value={editForm.partName}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="supplierName"
                      value={editForm.supplierName}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="machineModel"
                      value={editForm.machineModel}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <select
                      name="stage"
                      value={editForm.stage}
                      onChange={handleEditChange}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="stockQuantity"
                      min="0"
                      value={editForm.stockQuantity}
                      onChange={handleEditChange}
                    />
                  </td>
                  {/* "Advance" column is disabled during edit */}
                  <td>—</td>
                  <td>
                    <button className="btn-yellow" onClick={saveEdit}>
                      Save
                    </button>
                  </td>
                  <td>
                    <button className="btn-yellow" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            }

            // ---- Display-mode row ----
            return (
              <tr key={p.id} className={rowClass}>
                <td>{p.partName}</td>
                <td>{p.supplierName}</td>
                <td>{p.machineModel}</td>
                <td>{p.stage}</td>
                <td>{p.stockQuantity}</td>
                <td>
                  <button
                    className="btn-yellow"
                    onClick={() => handleAdvance(p.id)}
                    disabled={isFinalStage}
                    title={isFinalStage ? 'Already deployed' : 'Move to next stage'}
                  >
                    {isFinalStage ? 'Done' : 'Advance →'}
                  </button>
                </td>
                <td>
                  <button
                    className="btn-yellow"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn-yellow"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
          {visibleParts.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                {parts.length === 0
                  ? 'No parts yet. Add one above!'
                  : 'No parts match the current filters.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
