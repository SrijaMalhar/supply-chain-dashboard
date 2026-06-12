import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../api.js';

const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];
const STAGE_COLOR = { SUPPLIER: '#4a7fcb', WAREHOUSE: '#e6a817', ASSEMBLY: '#e07d3c', DEPLOYED: '#3aaa6a' };
const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function ValueSummary({ tick }) {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    fetch(API_BASE).then(r => r.json()).then(setParts).catch(() => {});
  }, [tick]);

  const { total, byStage, topPart } = useMemo(() => {
    const byStage = Object.fromEntries(STAGES.map(s => [s, 0]));
    let topPart = null;
    for (const p of parts) {
      const val = p.stockQuantity * (p.unitCost ?? 0);
      byStage[p.stage] += val;
      if (!topPart || val > topPart.value) topPart = { name: p.partName, value: val };
    }
    return { total: Object.values(byStage).reduce((s, n) => s + n, 0), byStage, topPart };
  }, [parts]);

  if (!parts.length) return null;

  return (
    <section className="card">
      <h2>Inventory Value</h2>
      <div className="value-top">
        <div className="value-total">
          <div className="value-amount">{fmt(total)}</div>
          <div className="value-label">Total Inventory Value</div>
        </div>
        {topPart && (
          <div className="value-top-part">
            <div className="value-badge">Highest Value Part</div>
            <div className="value-part-name">{topPart.name}</div>
            <div className="value-part-amount">{fmt(topPart.value)}</div>
          </div>
        )}
      </div>
      <div className="value-stages">
        {STAGES.map(stage => {
          const val = byStage[stage] ?? 0;
          const pct = total > 0 ? (val / total) * 100 : 0;
          return (
            <div key={stage} className="value-stage-row">
              <span className="value-stage-label">{stage}</span>
              <div className="value-bar-track">
                <div className="value-bar-fill" style={{ width: `${pct}%`, background: STAGE_COLOR[stage] }} />
              </div>
              <span className="value-stage-amount">{fmt(val)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
