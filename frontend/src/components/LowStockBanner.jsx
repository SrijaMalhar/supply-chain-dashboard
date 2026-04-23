import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api.js';

/**
 * LowStockBanner
 *
 * Pings GET /api/parts/low-stock and shows a warning banner
 * when at least one part is low on stock.
 *
 * Props:
 *   - refreshKey: re-fetches whenever this changes
 */
export default function LowStockBanner({ refreshKey }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/low-stock`)
      .then((res) => res.json())
      .then((data) => setCount(data.length))
      .catch((err) => console.error('Failed to load low-stock parts:', err));
  }, [refreshKey]);

  // Hide the banner entirely when nothing is low.
  if (count <= 0) return null;

  return (
    <div className="low-stock-banner">
      ⚠️ {count} part{count === 1 ? '' : 's'} {count === 1 ? 'is' : 'are'} low on stock
    </div>
  );
}
