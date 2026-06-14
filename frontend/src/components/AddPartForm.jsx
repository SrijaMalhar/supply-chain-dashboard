import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../api.js';

const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];
const BLANK = { partName: '', supplierName: '', machineModel: '', stage: 'SUPPLIER', stockQuantity: 0, unitCost: 0, reorderThreshold: 10, notes: '' };

export default function AddPartForm({ onAdded }) {
  const [form, setForm] = useState(BLANK);
  const [allParts, setAllParts] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [msg, setMsg] = useState('');
  const ref = useRef(null);

  useEffect(() => { fetch(API_BASE).then(r => r.json()).then(setAllParts).catch(() => {}); }, []);

  const set = e => {
    const { name, value } = e.target;
    const nums = ['stockQuantity', 'unitCost', 'reorderThreshold'];
    setForm(f => ({ ...f, [name]: nums.includes(name) ? Number(value) : value }));
  };

  const term = form.partName.trim().toLowerCase();
  const suggestions = term.length >= 2 ? allParts.filter(p => p.partName.toLowerCase().includes(term)).slice(0, 6) : [];
  const exactMatch = allParts.find(p => p.partName.toLowerCase() === term);

  const apply = name => { setForm(f => ({ ...f, partName: name })); setShowSugg(false); ref.current?.blur(); };

  const submit = e => {
    e.preventDefault();
    fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => {
        setMsg('✅ Part added!'); setForm(BLANK);
        fetch(API_BASE).then(r => r.json()).then(setAllParts);
        onAdded(); setTimeout(() => setMsg(''), 2500);
      })
      .catch(() => setMsg('❌ Failed.'));
  };

  return (
    <section className="card">
      <h2>Add a New Part</h2>
      <form className="add-form" onSubmit={submit}>
        <label style={{position:'relative'}}>
          Part Name
          <input ref={ref} name="partName" value={form.partName} onChange={set} onFocus={() => setShowSugg(true)} onBlur={() => setTimeout(() => setShowSugg(false), 150)} autoComplete="off" required />
          {showSugg && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map(p => (
                <li key={p.id} className="suggestion-item" onMouseDown={() => apply(p.partName)}>
                  <span className="suggestion-name">{p.partName}</span>
                  <span className="suggestion-meta">{p.supplierName} · {p.stage} · stock {p.stockQuantity}</span>
                </li>
              ))}
            </ul>
          )}
          {exactMatch && (
            <p className="duplicate-warning">⚠️ A part with this name already exists ({exactMatch.supplierName}, {exactMatch.stage}, stock {exactMatch.stockQuantity})</p>
          )}
        </label>
        <label>Supplier<input name="supplierName" value={form.supplierName} onChange={set} required /></label>
        <label>Machine Model<input name="machineModel" value={form.machineModel} onChange={set} required /></label>
        <label>Stage<select name="stage" value={form.stage} onChange={set}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></label>
        <label>Stock Qty<input type="number" name="stockQuantity" min="0" value={form.stockQuantity} onChange={set} required /></label>
        <label>Unit Cost ($)<input type="number" name="unitCost" min="0" step="0.01" value={form.unitCost} onChange={set} required /></label>
        <label>Reorder At<input type="number" name="reorderThreshold" min="0" value={form.reorderThreshold} onChange={set} required /></label>
        <label className="notes-field">Notes<textarea name="notes" value={form.notes} onChange={set} placeholder="Optional — e.g. waiting on supplier quote" rows={2}/></label>
        <button type="submit" className="btn-yellow">Add Part</button>
        {msg && <p className="form-message">{msg}</p>}
      </form>
    </section>
  );
}
