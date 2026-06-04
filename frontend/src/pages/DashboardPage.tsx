import { AlertTriangle, CalendarClock, CheckCircle2, Flame, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../lib/format';
import { useAppSelector } from '../store/hooks';

function Metric({
  label,
  value,
  icon: Icon,
  tone
}: {
  label: string;
  value: string | number;
  icon: typeof Flame;
  tone: string;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-zinc-500">{label}</p>
          <p className="mt-1 text-3xl font-black text-zinc-950">{value}</p>
        </div>
        <span className={`grid size-11 place-items-center rounded-lg ${tone}`}>
          <Icon size={22} />
        </span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { summary, inspections, extinguishers } = useAppSelector((state) => state.operations);

  const activeCount = extinguishers.filter((item) => item.status === 'Active').length;
  const scheduledCount = inspections.filter((item) => item.status === 'Scheduled').length;

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-black uppercase text-red-700">Operations</p>
        <h1 className="text-3xl font-black text-zinc-950">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total units"
          value={summary?.inventory.total ?? extinguishers.length}
          icon={Flame}
          tone="bg-red-50 text-red-700"
        />
        <Metric label="Active" value={activeCount} icon={ShieldCheck} tone="bg-emerald-50 text-emerald-700" />
        <Metric
          label="Scheduled"
          value={scheduledCount}
          icon={CalendarClock}
          tone="bg-sky-50 text-sky-700"
        />
        <Metric
          label="Expired"
          value={summary?.compliance.expired ?? 0}
          icon={AlertTriangle}
          tone="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-zinc-950">Compliance</h2>
            {summary && <StatusBadge status={summary.compliance.status} />}
          </div>
          <div className="mt-5 grid gap-3">
            <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
              <span className="font-semibold text-zinc-600">Upcoming expirations</span>
              <span className="font-black text-zinc-950">{summary?.compliance.upcomingExpirations ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
              <span className="font-semibold text-zinc-600">Overdue inspections</span>
              <span className="font-black text-zinc-950">{summary?.compliance.overdueInspections ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
              <span className="font-semibold text-zinc-600">Completed inspections</span>
              <span className="font-black text-zinc-950">
                {summary?.inspections.find((item) => item.status === 'Completed')?.total ?? 0}
              </span>
            </div>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">Recent maintenance</h2>
            <CheckCircle2 className="text-teal-700" size={20} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.recentMaintenance ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="table-cell font-bold text-zinc-950">{item.serialNumber}</td>
                    <td className="table-cell">{item.location}</td>
                    <td className="table-cell">{item.actionTaken}</td>
                    <td className="table-cell">{formatDate(item.maintenanceDate)}</td>
                  </tr>
                ))}
                {summary?.recentMaintenance.length === 0 && (
                  <tr>
                    <td className="table-cell" colSpan={4}>
                      No maintenance logs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
