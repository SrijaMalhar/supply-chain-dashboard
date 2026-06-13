import { useMemo, useState } from 'react';
import { API_BASE } from '../api.js';

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];

export default function StatusReport({ tick }) {
  const [parts, setParts] = useState([]);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = () => {
    fetch(API_BASE).then(r => r.json()).then(d => { setParts(d); setOpen(true); });
  };

  const report = useMemo(() => {
    if (!parts.length) return 'No parts data available.';
    const now = new Date().toLocaleString();
    const totalValue = parts.reduce((s, p) => s + p.stockQuantity * (p.unitCost ?? 0), 0);
    const lowStock = parts.filter(p => p.stockQuantity <= p.reorderThreshold);
    const stageCounts = Object.fromEntries(STAGES.map(s => [s, 0]));
    for (const p of parts) stageCounts[p.stage]++;

    const supplierMap = new Map();
    for (const p of parts) {
      const r = supplierMap.get(p.supplierName) ?? { below: 0, total: 0 };
      r.total++; if (p.stockQuantity <= p.reorderThreshold) r.below++;
      supplierMap.set(p.supplierName, r);
    }
    const atRisk = [...supplierMap.entries()].filter(([, v]) => v.below / v.total >= 0.5);
    const div = '─'.repeat(50);

    const lines = [
      'SUPPLY CHAIN STATUS REPORT',
      'Generated: ' + now,
      div, '',
      'INVENTORY SUMMARY',
      '  Total Parts:       ' + parts.length,
      '  Inventory Value:   ' + fmt(totalValue),
      '  Needs Reorder:     ' + lowStock.length + ' of ' + parts.length + ' parts',
      '',
      'PIPELINE BREAKDOWN',
      ...STAGES.map(s => '  ' + s.padEnd(12) + ' ' + stageCounts[s] + ' part' + (stageCounts[s] !== 1 ? 's' : '')),
      '',
    ];

    if (lowStock.length) {
      lines.push('LOW STOCK ALERTS  ⚠️');
      for (const p of lowStock) {
        lines.push('  • ' + p.partName + ' (' + p.supplierName + ')  —  stock ' + p.stockQuantity + ', threshold ' + p.reorderThreshold);
        if (p.notes) lines.push('    Notes: ' + p.notes);
      }
      lines.push('');
    }

    if (atRisk.length) {
      lines.push('SUPPLIER RISK  🔴');
      for (const [name, v] of atRisk)
        lines.push('  • ' + name + '  —  ' + v.below + ' of ' + v.total + ' parts below threshold');
      lines.push('');
    }

    if (!lowStock.length && !atRisk.length) { lines.push('✅ All parts are within stock thresholds.'); lines.push(''); }
    lines.push(div, 'END OF REPORT');
    return lines.join('\n');
  }, [parts]);

  const copy = () => {
    navigator.clipboard.writeText(report).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <>
      <button className="btn-report" onClick={load}>📋 Generate Status Report</button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Status Report</h2>
              <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <pre className="report-text">{report}</pre>
            <div className="modal-footer">
              <button className="btn-yellow" onClick={copy}>{copied ? '✓ Copied!' : 'Copy to Clipboard'}</button>
              <button className="btn-ghost" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
