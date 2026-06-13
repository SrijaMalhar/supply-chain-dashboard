import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../api.js';

const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];
const EVENT_ICON = { created: '🟢', stock_updated: '📦', stage_changed: '➡️' };

function exportCSV(rows) {
  const header = 'Part Name,Supplier,Machine Model,Stage,Stock,Unit Cost,Reorder At,Notes';
  const lines = rows.map(p => [p.partName, p.supplierName, p.machineModel, p.stage, p.stockQuantity, p.unitCost, p.reorderThreshold, '"' + (p.notes||'').replace(/"/g,'""') + '"'].join(','));
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([[header,...lines].join('\n')], {type:'text/csv'})), download: 'parts.csv' });
  a.click();
}

function HistoryPanel({ partId }) {
  const [entries, setEntries] = useState(null);
  useEffect(() => { fetch(`${API_BASE}/${partId}/history`).then(r=>r.json()).then(setEntries).catch(()=>setEntries([])); }, [partId]);
  if (!entries) return <p style={{margin:'8px 0',color:'#666'}}>Loading...</p>;
  if (!entries.length) return <p style={{margin:'8px 0',color:'#666'}}>No history yet.</p>;
  return (
    <ul style={{margin:'6px 0',padding:0,listStyle:'none',fontSize:'0.85rem'}}>
      {entries.map(e => (
        <li key={e.id} style={{padding:'4px 0',borderBottom:'1px solid #eee',display:'flex',gap:10}}>
          <span>{EVENT_ICON[e.event]??'•'}</span>
          <span style={{color:'#888',whiteSpace:'nowrap'}}>{new Date(e.timestamp).toLocaleString()}</span>
          <span>{e.note}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PartsTable({ tick, onChange }) {
  const [parts, setParts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [stage, setStage]         = useState('ALL');
  const [model, setModel]         = useState('ALL');
  const [sortKey, setSortKey]     = useState('partName');
  const [sortAsc, setSortAsc]     = useState(true);
  const [editId, setEditId]       = useState(null);
  const [editForm, setEditForm]   = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [bulkMode, setBulkMode]   = useState(false);
  const [selected, setSelected]   = useState(new Set());
  const [bulkQtys, setBulkQtys]   = useState({});
  const [applying, setApplying]   = useState(false);

  const load = () => {
    setLoading(true);
    fetch(API_BASE).then(r=>r.json()).then(d=>{setParts(d);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(load, [tick]);

  const models = useMemo(() => ['ALL', ...[...new Set(parts.map(p=>p.machineModel))].sort()], [parts]);
  const sortBy = key => key===sortKey ? setSortAsc(a=>!a) : (setSortKey(key), setSortAsc(true));
  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return [...parts].filter(p =>
      (stage==='ALL'||p.stage===stage) && (model==='ALL'||p.machineModel===model) &&
      (!q||p.partName.toLowerCase().includes(q)||p.supplierName.toLowerCase().includes(q))
    ).sort((a,b) => {
      const [av,bv]=[a[sortKey],b[sortKey]];
      return (sortAsc?1:-1)*(typeof av==='number'?av-bv:String(av).localeCompare(String(bv)));
    });
  }, [parts, stage, model, search, sortKey, sortAsc]);

  const enterBulk = () => { setBulkMode(true); setSelected(new Set()); setBulkQtys({}); };
  const exitBulk  = () => { setBulkMode(false); setSelected(new Set()); setBulkQtys({}); };

  const toggleAll = () => {
    if (selected.size===visible.length) { setSelected(new Set()); }
    else {
      const ids = new Set(visible.map(p=>p.id));
      setSelected(ids);
      const init={};
      for (const p of visible) if (!(p.id in bulkQtys)) init[p.id]=String(p.stockQuantity);
      setBulkQtys(q=>({...q,...init}));
    }
  };

  const handleCheck = (p, checked) => {
    setSelected(prev => { const s=new Set(prev); checked?s.add(p.id):s.delete(p.id); return s; });
    if (checked && !(p.id in bulkQtys)) setBulkQtys(q=>({...q,[p.id]:String(p.stockQuantity)}));
  };

  const applyBulk = async () => {
    const toUpdate = [...selected].map(id => ({ part: parts.find(p=>p.id===id), newQty: Number(bulkQtys[id]??parts.find(p=>p.id===id)?.stockQuantity) }))
      .filter(({part,newQty}) => newQty !== part.stockQuantity);
    if (!toUpdate.length) { alert('No quantities changed.'); return; }
    setApplying(true);
    await Promise.all(toUpdate.map(({part,newQty}) => fetch(`${API_BASE}/${part.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...part,stockQuantity:newQty}) })));
    setApplying(false);
    exitBulk();
    onChange();
  };

  const del = id => { if(!confirm('Delete?')) return; fetch(`${API_BASE}/${id}`,{method:'DELETE'}).then(onChange); };
  const advance = id => fetch(`${API_BASE}/${id}/advance`,{method:'PUT'}).then(onChange);
  const save = () => fetch(`${API_BASE}/${editId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editForm)}).then(()=>{setEditId(null);onChange();});
  const icon = key => sortKey===key?(sortAsc?' ▲':' ▼'):' ⇅';
  const COLS=[['partName','Part Name'],['supplierName','Supplier'],['machineModel','Machine Model'],['stage','Stage'],['stockQuantity','Stock'],['reorderThreshold','Reorder At']];

  if (loading) return <p>Loading...</p>;

  return (
    <section className="card">
      <div className="table-header">
        <h2>All Parts</h2>
        <div className="table-controls">
          <label className="filter-label">Search:<input value={search} placeholder="Part or supplier..." onChange={e=>setSearch(e.target.value)}/></label>
          <label className="filter-label">Stage:<select value={stage} onChange={e=>setStage(e.target.value)}>{['ALL',...STAGES].map(s=><option key={s}>{s}</option>)}</select></label>
          <label className="filter-label">Machine:<select value={model} onChange={e=>setModel(e.target.value)}>{models.map(m=><option key={m}>{m}</option>)}</select></label>
          {!bulkMode && <><button className="btn-ghost" onClick={enterBulk}>Bulk Update Stock</button><button className="btn-yellow" onClick={()=>exportCSV(visible)}>Export CSV</button></>}
          {bulkMode && <button className="btn-ghost" onClick={exitBulk}>✕ Cancel Bulk</button>}
        </div>
      </div>

      {bulkMode && (
        <div className="bulk-bar">
          <span className="bulk-bar-info">{selected.size===0?'Check rows to update their stock quantity':selected.size+' part'+(selected.size>1?'s':'')+' selected'}</span>
          <button className="btn-yellow" onClick={applyBulk} disabled={selected.size===0||applying}>{applying?'Applying…':'Apply Changes'+(selected.size>0?' ('+selected.size+')':'')}</button>
        </div>
      )}

      <table className="parts-table">
        <thead>
          <tr>
            {bulkMode && <th style={{width:36,textAlign:'center'}}><input type="checkbox" checked={visible.length>0&&selected.size===visible.length} onChange={toggleAll}/></th>}
            {COLS.map(([k,l]) => <th key={k} onClick={()=>sortBy(k)}>{l}<span className="sort-icon">{icon(k)}</span></th>)}
            {bulkMode && <th>New Stock</th>}
            <th>Notes</th>
            {!bulkMode && <><th>Advance</th><th>Edit</th><th>History</th><th>Delete</th></>}
          </tr>
        </thead>
        <tbody>
          {visible.map(p => {
            const nr = p.stockQuantity<=p.reorderThreshold;
            const sel = selected.has(p.id);
            const row = [nr?'row-low':'row-ok', bulkMode&&sel?'row-bulk-selected':''].join(' ').trim();
            const open = historyId===p.id;

            if (!bulkMode && editId===p.id && editForm) {
              const upd = e => { const {name,value}=e.target; const nums=['stockQuantity','unitCost','reorderThreshold']; setEditForm(f=>({...f,[name]:nums.includes(name)?Number(value):value})); };
              return (
                <tr key={p.id} className={row}>
                  <td><input name="partName" value={editForm.partName} onChange={upd}/></td>
                  <td><input name="supplierName" value={editForm.supplierName} onChange={upd}/></td>
                  <td><input name="machineModel" value={editForm.machineModel} onChange={upd}/></td>
                  <td><select name="stage" value={editForm.stage} onChange={upd}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></td>
                  <td><input type="number" name="stockQuantity" min="0" value={editForm.stockQuantity} onChange={upd}/></td>
                  <td><input type="number" name="reorderThreshold" min="0" value={editForm.reorderThreshold} onChange={upd}/></td>
                  <td><textarea name="notes" value={editForm.notes||''} onChange={upd} rows={2} style={{width:'100%',fontSize:13,padding:'4px 6px',borderRadius:4,border:'1px solid #cbd2dc'}}/></td>
                  <td>—</td><td><button className="btn-yellow" onClick={save}>Save</button></td><td>—</td><td><button className="btn-yellow" onClick={()=>setEditId(null)}>Cancel</button></td>
                </tr>
              );
            }

            return (
              <>
                <tr key={p.id} className={row}>
                  {bulkMode && <td style={{textAlign:'center'}}><input type="checkbox" checked={sel} onChange={e=>handleCheck(p,e.target.checked)}/></td>}
                  <td>{p.partName}</td><td>{p.supplierName}</td><td>{p.machineModel}</td><td>{p.stage}</td>
                  <td>{p.stockQuantity}{nr&&<span> ⚠️</span>}</td><td>{p.reorderThreshold}</td>
                  {bulkMode && <td>{sel?<input type="number" min="0" className="bulk-qty-input" value={bulkQtys[p.id]??p.stockQuantity} onChange={e=>setBulkQtys(q=>({...q,[p.id]:e.target.value}))}/>:<span style={{color:'#bbb',fontSize:13}}>—</span>}</td>}
                  <td className="notes-cell">{p.notes?<span className="notes-preview" title={p.notes}>📝 {p.notes.length>40?p.notes.slice(0,40)+'…':p.notes}</span>:<span style={{color:'#bbb'}}>—</span>}</td>
                  {!bulkMode && <>
                    <td><button className="btn-yellow" onClick={()=>advance(p.id)} disabled={p.stage==='DEPLOYED'}>{p.stage==='DEPLOYED'?'Done':'Advance →'}</button></td>
                    <td><button className="btn-yellow" onClick={()=>{setEditId(p.id);setEditForm({...p});}}>Edit</button></td>
                    <td><button className="btn-ghost" onClick={()=>setHistoryId(open?null:p.id)}>{open?'Hide':'History'}</button></td>
                    <td><button className="btn-danger" onClick={()=>del(p.id)}>Delete</button></td>
                  </>}
                </tr>
                {!bulkMode && open && <tr key={`h${p.id}`}><td colSpan="11" style={{padding:'8px 16px',background:'#f8f9fb'}}><strong style={{fontSize:'0.85rem',color:'#555'}}>Change log — {p.partName}</strong><HistoryPanel partId={p.id}/></td></tr>}
              </>
            );
          })}
          {!visible.length && <tr><td colSpan={bulkMode?9:11} style={{textAlign:'center'}}>{!parts.length?'No parts yet.':'No matches.'}</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
