// pure service functions — no express, easy to test
const STAGES = ['SUPPLIER', 'WAREHOUSE', 'ASSEMBLY', 'DEPLOYED'];

function advanceStage(part) {
  const idx = STAGES.indexOf(part.stage);
  if (idx === -1 || idx === STAGES.length - 1) return part;
  return { ...part, stage: STAGES[idx + 1] };
}

function getLowStockParts(parts) {
  return parts.filter(p => p.stockQuantity <= p.reorderThreshold);
}

function getStageSummary(parts) {
  const counts = {};
  for (const s of STAGES) counts[s] = 0;
  for (const p of parts) {
    if (counts[p.stage] !== undefined) counts[p.stage]++;
  }
  return counts;
}

module.exports = { advanceStage, getLowStockParts, getStageSummary };
