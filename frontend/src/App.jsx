import { useState } from 'react';
import LowStockBanner from './components/LowStockBanner.jsx';
import StageSummary from './components/StageSummary.jsx';
import ValueSummary from './components/ValueSummary.jsx';
import AddPartForm from './components/AddPartForm.jsx';
import PartsTable from './components/PartsTable.jsx';

export default function App() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  return (
    <div>
      <header className="app-header">
        <h1>Supply Chain Parts Traceability</h1>
      </header>
      <main className="app-main">
        <LowStockBanner tick={tick} />
        <StageSummary tick={tick} />
        <ValueSummary tick={tick} />
        <AddPartForm onAdded={refresh} />
        <PartsTable tick={tick} onChange={refresh} />
      </main>
    </div>
  );
}
