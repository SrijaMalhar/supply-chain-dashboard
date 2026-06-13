import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../api.js';

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function SupplierPerformance({ tick }) {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    fetch(API_BASE).then(r => r.json()).then(setParts).catch(() => {});
  }, [tick]);

  const suppliers = useMemo(() => {
    const map = new Map();
    for (const p of parts) {
      const row = map.get(p.supplierName) ?? { name: p.supplierName, partCount: 0, totalValue: 0, avgStock: 0, belowThreshold: 0 };
      row.partCount += 1;
      row.totalValue += p.stockQuantity * (p.unitCost ?? 0);
      row.avgStock += p.stockQuantity;
      if (p.stockQuantity <= p.reorderThreshold) row.belowThreshold += 1;
      map.set(p.supplierName, row);
    }
    return [...map.values()]
      .map(r => ({ ...r, avgStock: Math.round(r.avgStock / r.partCount) }))
      .sort((a, b) => b.belowThreshold - a.belowThreshold || b.totalValue - a.totalValue);
  }, [parts]);

  if (!suppliers.length) return null;

  return (
    <section className="card">
      <h2>Supplier Performance</h2>
      <table className="supplier-table">
        <thead>
          <tr>
            <th>Supplier</th><th>Parts</th><th>Avg Stock</th><th>Inventory Value</th><th>Needs Reorder</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => {
            const pct = s.partCount > 0 ? s.belowThreshold / s.partCount : 0;
            const status = pct === 0 ? { label: 'Healthy', cls: 'status-ok' } : pct < 0.5 ? { label: 'Watch', cls: 'status-warn' } : { label: 'At Risk', cls: 'status-bad' };
            return (
              <tr key={s.name}>
                <td><strong>{s.name}</strong></td>
                <td>{s.partCount}</td>
                <td>{s.avgStock}</td>
                <td>{fmt(s.totalValue)}</td>
                <td>{s.belowThreshold > 0 ? <span className="reorder-count">⚠️ {s.belowThreshold} / {s.partCount}</span> : <span style={{color:'#3aaa6a'}}>None</span>}</td>
                <td><span className={`supplier-status ${status.cls}`}>{status.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
