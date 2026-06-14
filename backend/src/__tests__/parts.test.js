const { advanceStage, getLowStockParts, getStageSummary } = require('../partsService');

describe('advanceStage', () => {
  test('SUPPLIER moves to WAREHOUSE', () => {
    const p = { id: 1, stage: 'SUPPLIER' };
    expect(advanceStage(p).stage).toBe('WAREHOUSE');
  });

  test('WAREHOUSE moves to ASSEMBLY', () => {
    const p = { id: 2, stage: 'WAREHOUSE' };
    expect(advanceStage(p).stage).toBe('ASSEMBLY');
  });

  test('DEPLOYED stays DEPLOYED', () => {
    const p = { id: 3, stage: 'DEPLOYED' };
    expect(advanceStage(p).stage).toBe('DEPLOYED');
  });
});

describe('getLowStockParts', () => {
  const parts = [
    { id: 1, stockQuantity: 4,  reorderThreshold: 5  }, // below
    { id: 2, stockQuantity: 5,  reorderThreshold: 5  }, // exactly at threshold = needs reorder
    { id: 3, stockQuantity: 20, reorderThreshold: 10 }, // fine
  ];

  test('returns parts at or below threshold', () => {
    expect(getLowStockParts(parts)).toHaveLength(2);
  });

  test('does not flag parts above threshold', () => {
    const result = getLowStockParts(parts);
    expect(result.find(p => p.id === 3)).toBeUndefined();
  });
});

describe('getStageSummary', () => {
  const parts = [
    { stage: 'SUPPLIER' },
    { stage: 'SUPPLIER' },
    { stage: 'WAREHOUSE' },
    { stage: 'DEPLOYED' },
  ];

  test('counts each stage correctly', () => {
    const s = getStageSummary(parts);
    expect(s.SUPPLIER).toBe(2);
    expect(s.WAREHOUSE).toBe(1);
    expect(s.DEPLOYED).toBe(1);
  });

  test('returns 0 for stages with no parts', () => {
    expect(getStageSummary(parts).ASSEMBLY).toBe(0);
  });
});
