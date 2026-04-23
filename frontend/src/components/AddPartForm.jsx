import React, { useState } from 'react';
import { API_BASE } from '../api.js';

// The four valid stages defined by the backend spec.
const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];

const EMPTY_FORM = {
  partName: '',
  supplierName: '',
  machineModel: '',
  stage: 'SUPPLIER',
  stockQuantity: 0,
};

/**
 * AddPartForm
 *
 * A simple controlled form. On submit it POSTs to /api/parts and
 * shows "Part added!" briefly on success.
 *
 * Props:
 *   - onPartAdded: callback fired after a successful add, so the
 *                  parent can trigger a refresh of the parts table.
 */
export default function AddPartForm({ onPartAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');

  // Generic change handler for all inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      // stockQuantity must be a number on the wire.
      [name]: name === 'stockQuantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add part');
        return res.json();
      })
      .then(() => {
        setMessage('Part added!');
        setForm(EMPTY_FORM);
        if (onPartAdded) onPartAdded();
        // Clear the success message after 2 seconds.
        setTimeout(() => setMessage(''), 2000);
      })
      .catch((err) => {
        console.error(err);
        setMessage('Error adding part.');
      });
  };

  return (
    <section className="card">
      <h2>Add a New Part</h2>
      <form onSubmit={handleSubmit} className="add-form">
        <label>
          Part Name
          <input
            name="partName"
            value={form.partName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Supplier Name
          <input
            name="supplierName"
            value={form.supplierName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Machine Model
          <input
            name="machineModel"
            value={form.machineModel}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Stage
          <select name="stage" value={form.stage} onChange={handleChange}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Stock Quantity
          <input
            type="number"
            name="stockQuantity"
            min="0"
            value={form.stockQuantity}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="btn-yellow">
          Add Part
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </section>
  );
}
