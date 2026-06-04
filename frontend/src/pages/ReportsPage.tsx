import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { downloadCsv } from '../lib/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSummary } from '../store/operationsSlice';

export function ReportsPage() {
  const dispatch = useAppDispatch();
  const { summary, loading } = useAppSelector((state) => state.operations);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleDownload(path: string, filename: string) {
    setExportError(null);
    try {
      await downloadCsv(path, filename);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed.');
    }
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-red-700">Reports</p>
          <h1 className="text-3xl font-black text-zinc-950">Compliance reports</h1>
        </div>
        <button className="btn-secondary" type="button" disabled={loading} onClick={() => void dispatch(fetchSummary())}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm font-bold text-zinc-500">Inventory total</p>
          <p className="mt-2 text-3xl font-black text-zinc-950">{summary?.inventory.total ?? 0}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-bold text-zinc-500">Upcoming expirations</p>
          <p className="mt-2 text-3xl font-black text-zinc-950">{summary?.compliance.upcomingExpirations ?? 0}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-bold text-zinc-500">Compliance status</p>
          <div className="mt-3">{summary && <StatusBadge status={summary.compliance.status} />}</div>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-black text-zinc-950">Exports</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="btn-primary"
            type="button"
            onClick={() => void handleDownload('/reports/inventory.csv', 'inventory-report.csv')}
          >
            <Download size={17} />
            Inventory CSV
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => void handleDownload('/reports/maintenance.csv', 'maintenance-report.csv')}
          >
            <Download size={17} />
            Maintenance CSV
          </button>
        </div>
        {exportError && <p className="mt-3 text-sm font-bold text-red-700">{exportError}</p>}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel overflow-hidden">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">Inventory by status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.inventory.byStatus ?? []).map((row) => (
                  <tr key={row.status}>
                    <td className="table-cell">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="table-cell font-black text-zinc-950">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">Inspections by status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.inspections ?? []).map((row) => (
                  <tr key={row.status}>
                    <td className="table-cell">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="table-cell font-black text-zinc-950">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
