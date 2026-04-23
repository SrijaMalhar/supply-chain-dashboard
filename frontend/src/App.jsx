import React, { useState } from 'react';
import LowStockBanner from './components/LowStockBanner.jsx';
import StageSummary from './components/StageSummary.jsx';
import AddPartForm from './components/AddPartForm.jsx';
import PartsTable from './components/PartsTable.jsx';

/**
 * Top-level component.
 *
 * We keep a `refreshKey` counter in state. Whenever a part is added
 * or deleted, we bump it -- the child components depend on it, so they
 * re-fetch from the backend. This is a simple way to keep the UI in
 * sync without introducing a state-management library.
 */
export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div>
      <header className="app-header">
        <h1>Supply Chain Parts Traceability Dashboard</h1>
      </header>

      <main className="app-main">
        <LowStockBanner refreshKey={refreshKey} />
        <StageSummary refreshKey={refreshKey} />
        <AddPartForm onPartAdded={triggerRefresh} />
        <PartsTable
          refreshKey={refreshKey}
          onPartDeleted={triggerRefresh}
          onPartChanged={triggerRefresh}
        />
      </main>
    </div>
  );
}
