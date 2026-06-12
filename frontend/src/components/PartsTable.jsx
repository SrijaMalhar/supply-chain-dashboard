import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../api.js';

const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];

function exportCSV(rows) {
  const header = 'Part Name,Supplier,Machine Model,Stage,Stock';
  const lines = rows.map(p => [p.partName, p.supplierName, p.machineModel, p.stage, p.stockQuantity].join(','));
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'parts.csv' });
  a.click();
}

export default function PartsTable({ tick, onChange }) {
  const [parts, setParts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [stage, setStage]       = useState('ALL');
  const [model, setModel]       = useState('ALL');
  const [sortKey, setSortKey]   = useState('partName');
  const [sortAsc, setSortAsc]   = useState(true);
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(API_BASE).then(r => r.json()).then(d => { setParts(d); setLoading(false); }).catch(() => setLoading(false));
  }, [tick]);

  const models = useMemo(() => ['ALL', ...[...new Set(parts.map(p => p.machineModel))].sort()], [parts]);

  const sort = key => key === sortKey ? setSortAsc(a => !a) : (setSortKey(key), setSortAsc(true));

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return [...parts]
      .filter(p =>
        (stage === 'ALL' || p.stage === stage) &&
        (model === 'ALL' || p.machineModel === model) &&
        (!q || p.partName.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const [av, bv] = [a[sortKey], b[sortKey]];
        return (sortAsc ? 1 : -1) * (typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)));
      });
  }, [parts, stage, model, search, sortKey, sortAsc]);

  const del = id => {
    if (!confirm('Delete this part?')) return;
    fetch(`${API_BASE}/${id}`, { method: 'DELETE' }).then(onChange).catch(() => {});
  };

  const advance = id => {
    fetch(`${API_BASE}/${id}/advance`, { method: 'PUT' }).then(onChange).catch(() => {});
  };

  const save = () => {
    fetch(`${API_BASE}/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
      .then(() => { setEditId(null); onChange(); }).catch(() => {});
  };

  const icon = key => sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : ' ⇅';

  if (loading) return <p>Loading...</p>;

  return (
    <section className="card">
      <div className="table-header">
        <h2>All Parts</h2>
        <div className="table-controls">
          <label className="filter-label">Search: <input value={search} placeholder="Part or supplier..." onChange={e => setSearch(e.target.value)} /></label>
          <label className="filter-label">Stage:
            <select value={stage} onChange={e => setStage(e.target.value)}>
              {['ALL', ...STAGES].map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="filter-label">Machine:
            <select value={model} onChange={e => setModel(e.target.value)}>
              {models.map(m => <option key={m}>{m}</option>)}
            </select>
          </label>
          <button className="btn-yellow" onClick={() => exportCSV(visible)}>Export CSV</button>
        </div>
      </div>

      <table className="parts-table">
        <thead>
          <tr>
            {[['partName','Part Name'],['supplierName','Supplier'],['machineModel','Machine Model'],['stage','Stage'],['stockQuantity','Stock']].map(([k,l]) => (
              <th key={k} onClick={() => sort(k)}>{l}<span className="sort-icon">{icon(k)}</span></th>
            ))}
            <th>Advance</th><th>Edit</th><th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {visible.map(p => {
            const row = p.stockQuantity < 10 ? 'row-low' : 'row-ok';
            if (editId === p.id && editForm) {
              const upd = e => { const {name,value} = e.target; setEditForm(f => ({...f,[name]: name==='stockQuantity'?Number(value):value})); };
              return (
                <tr key={p.id} className={row}>
                  <td><input name="partName" value={editForm.partName} onChange={upd}/></td>
                  <td><input name="supplierName" value={editForm.supplierName} onChange={upd}/></td>
                  <td><input name="machineModel" value={editForm.machineModel} onChange={upd}/></td>
                  <td><select name="stage" value={editForm.stage} onChange={upd}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></td>
                  <td><input type="number" name="stockQuantity" min="0" value={editForm.stockQuantity} onChange={upd}/></td>
                  <td>—</td>
                  <td><button className="btn-yellow" onClick={save}>Save</button></td>
                  <td><button className="btn-yellow" onClick={() => setEditId(null)}>Cancel</button></td>
                </tr>
              );
            }
            return (
              <tr key={p.id} className={row}>
                <td>{p.partName}</td><td>{p.supplierName}</td><td>{p.machineModel}</td><td>{p.stage}</td><td>{p.stockQuantity}</td>
                <td><button className="btn-yellow" onClick={() => advance(p.id)} disabled={p.stage==='DEPLOYED'}>{p.stage==='DEPLOYED'?'Done':'Advance →'}</button></td>
                <td><button className="btn-yellow" onClick={() => { setEditId(p.id); setEditForm({...p}); }}>Edit</button></td>
                <td><button className="btn-danger" onClick={() => del(p.id)}>Delete</button></td>
              </tr>
            );
          })}
          {!visible.length && <tr><td colSpan="8" style={{textAlign:'center'}}>{!parts.length ? 'No parts yet.' : 'No matches.'}</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
