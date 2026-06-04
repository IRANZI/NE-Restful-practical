import { FormEvent, useMemo, useState } from 'react';
import { Save, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate, todayDateInput } from '../lib/format';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSummary, logMaintenance } from '../store/operationsSlice';

export function MaintenancePage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { extinguishers, maintenance, users, loading } = useAppSelector((state) => state.operations);
  const inspectors = useMemo(() => users.filter((item) => item.role === 'Inspector'), [users]);
  const canLog = user?.role === 'Admin' || user?.role === 'Inspector';
  const [form, setForm] = useState({
    extinguisherId: '',
    inspectorId: user?.role === 'Inspector' ? user.id : '',
    actionTaken: '',
    issuesIdentified: '',
    notes: '',
    maintenanceDate: todayDateInput()
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await dispatch(
      logMaintenance({
        extinguisherId: form.extinguisherId,
        inspectorId: form.inspectorId || null,
        actionTaken: form.actionTaken,
        issuesIdentified: form.issuesIdentified || undefined,
        notes: form.notes || undefined,
        maintenanceDate: form.maintenanceDate
      })
    ).unwrap();
    await dispatch(fetchSummary());
    setForm({
      extinguisherId: '',
      inspectorId: user?.role === 'Inspector' ? user.id : '',
      actionTaken: '',
      issuesIdentified: '',
      notes: '',
      maintenanceDate: todayDateInput()
    });
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-black uppercase text-red-700">Maintenance</p>
        <h1 className="text-3xl font-black text-zinc-950">Service history</h1>
      </div>

      {canLog && (
        <form className="panel grid gap-4 p-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <Wrench className="text-red-700" size={20} />
            <h2 className="text-lg font-black text-zinc-950">Log maintenance</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="field xl:col-span-2">
              Fire extinguisher
              <select
                className="input"
                value={form.extinguisherId}
                onChange={(event) => setForm({ ...form, extinguisherId: event.target.value })}
                required
              >
                <option value="">Select unit</option>
                {extinguishers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.serialNumber} - {item.location}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Inspector
              <select
                className="input"
                value={form.inspectorId}
                onChange={(event) => setForm({ ...form, inspectorId: event.target.value })}
              >
                <option value="">Unassigned</option>
                {inspectors.map((inspector) => (
                  <option key={inspector.id} value={inspector.id}>
                    {inspector.firstName} {inspector.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Date
              <input
                className="input"
                type="date"
                value={form.maintenanceDate}
                onChange={(event) => setForm({ ...form, maintenanceDate: event.target.value })}
                required
              />
            </label>
            <label className="field md:col-span-2">
              Action taken
              <textarea
                className="input min-h-24 resize-y"
                value={form.actionTaken}
                onChange={(event) => setForm({ ...form, actionTaken: event.target.value })}
                required
              />
            </label>
            <label className="field">
              Issues identified
              <textarea
                className="input min-h-24 resize-y"
                value={form.issuesIdentified}
                onChange={(event) => setForm({ ...form, issuesIdentified: event.target.value })}
              />
            </label>
            <label className="field">
              Notes
              <textarea
                className="input min-h-24 resize-y"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </label>
          </div>
          <button className="btn-primary justify-self-start" type="submit" disabled={loading}>
            <Save size={17} />
            Save log
          </button>
        </form>
      )}

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Issues</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((log) => (
                <tr key={log.id}>
                  <td className="table-cell font-bold text-zinc-950">{log.serialNumber}</td>
                  <td className="table-cell">{log.location}</td>
                  <td className="table-cell">{log.inspectorName ?? 'Unassigned'}</td>
                  <td className="table-cell">{log.actionTaken}</td>
                  <td className="table-cell">{log.issuesIdentified ?? 'None'}</td>
                  <td className="table-cell">{formatDate(log.maintenanceDate)}</td>
                </tr>
              ))}
              {maintenance.length === 0 && (
                <tr>
                  <td className="table-cell" colSpan={6}>
                    No maintenance logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
