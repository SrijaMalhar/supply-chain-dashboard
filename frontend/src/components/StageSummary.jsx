import { useEffect, useState } from 'react';
import { API_BASE } from '../api.js';

const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];

export default function StageSummary({ tick }) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/summary`)
      .then(r => r.json())
      .then(setCounts)
      .catch(() => {});
  }, [tick]);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <section className="card">
      <h2>Pipeline Overview</h2>

      <div className="summary-grid">
        <div className="summary-tile total">
          <div className="summary-number">{total}</div>
          <div className="summary-label">Total Parts</div>
        </div>
        {STAGES.map(s => (
          <div key={s} className="summary-tile">
            <div className="summary-number">{counts[s] ?? 0}</div>
            <div className="summary-label">{s}</div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="pipeline-bar">
          {STAGES.map(s => {
            const pct = ((counts[s] ?? 0) / total) * 100;
            return pct > 0 ? (
              <div key={s} className={`pipeline-segment ${s}`} style={{ flex: pct }} title={`${s}: ${counts[s]}`}>
                {pct >= 10 ? s : ''}
              </div>
            ) : null;
          })}
        </div>
      )}
    </section>
  );
}
