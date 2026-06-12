import { useState } from 'react';
import { API_BASE } from '../api.js';

const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];
const BLANK = { partName: '', supplierName: '', machineModel: '', stage: 'SUPPLIER', stockQuantity: 0 };

export default function AddPartForm({ onAdded }) {
  const [form, setForm] = useState(BLANK);
  const [msg, setMsg] = useState('');

  const set = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'stockQuantity' ? Number(value) : value }));
  };

  const submit = e => {
    e.preventDefault();
    fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { setMsg('✅ Part added!'); setForm(BLANK); onAdded(); setTimeout(() => setMsg(''), 2500); })
      .catch(() => setMsg('❌ Failed to add part.'));
  };

  return (
    <section className="card">
      <h2>Add a New Part</h2>
      <form className="add-form" onSubmit={submit}>
        <label>Part Name<input name="partName" value={form.partName} onChange={set} required /></label>
        <label>Supplier<input name="supplierName" value={form.supplierName} onChange={set} required /></label>
        <label>Machine Model<input name="machineModel" value={form.machineModel} onChange={set} required /></label>
        <label>Stage
          <select name="stage" value={form.stage} onChange={set}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Stock Qty<input type="number" name="stockQuantity" min="0" value={form.stockQuantity} onChange={set} required /></label>
        <button type="submit" className="btn-yellow">Add Part</button>
        {msg && <p className="form-message">{msg}</p>}
      </form>
    </section>
  );
}
