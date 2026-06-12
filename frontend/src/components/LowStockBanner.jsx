import { useEffect, useState } from 'react';
import { API_BASE } from '../api.js';

export default function LowStockBanner({ tick }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/low-stock`)
      .then(r => r.json())
      .then(d => setCount(d.length))
      .catch(() => {});
  }, [tick]);

  if (!count) return null;

  return (
    <div className="low-stock-banner">
      ⚠️ {count} part{count > 1 ? 's are' : ' is'} low on stock
    </div>
  );
}
