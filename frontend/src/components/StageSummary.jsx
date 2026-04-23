import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api.js';

/**
 * StageSummary
 *
 * Fetches GET /api/parts/summary and shows a small card with:
 *   - The total number of parts
 *   - A count for each stage (Supplier, Warehouse, Assembly, Deployed)
 *
 * Props:
 *   - refreshKey: re-fetches whenever this changes
 */
export default function StageSummary({ refreshKey }) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/summary`)
      .then((res) => res.json())
      .then((data) => setCounts(data))
      .catch((err) => console.error('Failed to load summary:', err));
  }, [refreshKey]);

  // Total = sum of every stage's count.
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const stages = Object.entries(counts);

  return (
    <section className="card">
      <h2>Pipeline Overview</h2>
      <div className="summary-grid">
        <div className="summary-tile total">
          <div className="summary-number">{total}</div>
          <div className="summary-label">Total Parts</div>
        </div>
        {stages.map(([stage, count]) => (
          <div key={stage} className="summary-tile">
            <div className="summary-number">{count}</div>
            <div className="summary-label">{stage}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
