import { useEffect, useState } from 'react';
import { API_BASE } from '../api.js';

export default function LowStockBanner({ tick }) {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/low-stock`).then(r => r.json()).then(setParts).catch(() => {});
  }, [tick]);

  if (!parts.length) return null;

  return (
    <div className="low-stock-banner">
      <div className="low-stock-title">
        ⚠️ {parts.length} part{parts.length === 1 ? '' : 's'} need{parts.length === 1 ? 's' : ''} reordering
      </div>
      <ul className="low-stock-list">
        {parts.map(p => (
          <li key={p.id}>
            <strong>{p.partName}</strong> — stock {p.stockQuantity} (threshold: {p.reorderThreshold})
          </li>
        ))}
      </ul>
    </div>
  );
}
