import { FormEvent, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, ClipboardCheck, Save, X } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../lib/format';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { completeInspection, fetchSummary, scheduleInspection } from '../store/operationsSlice';

export function InspectionsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { extinguishers, inspections, users, loading } = useAppSelector((state) => state.operations);
  const inspectors = useMemo(() => users.filter((item) => item.role === 'Inspector'), [users]);
  const canComplete = user?.role === 'Admin' || user?.role === 'Inspector';
  const [form, setForm] = useState({
    extinguisherId: '',
    inspectorId: '',
    scheduledFor: '',
    notes: ''
  });
  const [completeForm, setCompleteForm] = useState({
    id: '',
    result: 'Passed',
    notes: ''
  });

  async function handleSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await dispatch(
      scheduleInspection({
        extinguisherId: form.extinguisherId,
        inspectorId: form.inspectorId || null,
        scheduledFor: new Date(form.scheduledFor).toISOString(),
        notes: form.notes || undefined
      })
    ).unwrap();
    await dispatch(fetchSummary());
    setForm({ extinguisherId: '', inspectorId: '', scheduledFor: '', notes: '' });
  }

  async function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await dispatch(
      completeInspection({
        id: completeForm.id,
        result: completeForm.result,
        notes: completeForm.notes || undefined
      })
    ).unwrap();
    await dispatch(fetchSummary());
    setCompleteForm({ id: '', result: 'Passed', notes: '' });
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-black uppercase text-red-700">Inspections</p>
        <h1 className="text-3xl font-black text-zinc-950">Schedule and results</h1>
      </div>

      <form className="panel grid gap-4 p-5" onSubmit={handleSchedule}>
        <div className="flex items-center gap-2">
          <CalendarPlus className="text-red-700" size={20} />
          <h2 className="text-lg font-black text-zinc-950">Schedule inspection</h2>
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
            Date and time
            <input
              className="input"
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(event) => setForm({ ...form, scheduledFor: event.target.value })}
              required
            />
          </label>
          <label className="field md:col-span-2 xl:col-span-4">
            Notes
            <textarea
              className="input min-h-24 resize-y"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </label>
        </div>
        <button className="btn-primary justify-self-start" type="submit" disabled={loading}>
          <CalendarPlus size={17} />
          Schedule
        </button>
      </form>

      {completeForm.id && (
        <form className="panel grid gap-4 border-teal-200 p-5" onSubmit={handleComplete}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-zinc-950">Complete inspection</h2>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setCompleteForm({ id: '', result: 'Passed', notes: '' })}
            >
              <X size={17} />
              Cancel
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <label className="field">
              Result
              <input
                className="input"
                value={completeForm.result}
                onChange={(event) => setCompleteForm({ ...completeForm, result: event.target.value })}
                required
              />
            </label>
            <label className="field">
              Notes
              <input
                className="input"
                value={completeForm.notes}
                onChange={(event) => setCompleteForm({ ...completeForm, notes: event.target.value })}
              />
            </label>
          </div>
          <button className="btn-primary justify-self-start" type="submit" disabled={loading}>
            <Save size={17} />
            Save result
          </button>
        </form>
      )}

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px]">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Result</th>
                {canComplete && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => (
                <tr key={inspection.id}>
                  <td className="table-cell font-bold text-zinc-950">{inspection.serialNumber}</td>
                  <td className="table-cell">{inspection.location}</td>
                  <td className="table-cell">{inspection.inspectorName ?? 'Unassigned'}</td>
                  <td className="table-cell">{formatDateTime(inspection.scheduledFor)}</td>
                  <td className="table-cell">
                    <StatusBadge status={inspection.status} />
                  </td>
                  <td className="table-cell">{inspection.result ?? 'Pending'}</td>
                  {canComplete && (
                    <td className="table-cell">
                      <button
                        className="btn-secondary"
                        type="button"
                        disabled={inspection.status === 'Completed'}
                        onClick={() =>
                          setCompleteForm({
                            id: inspection.id,
                            result: inspection.result ?? 'Passed',
                            notes: inspection.notes ?? ''
                          })
                        }
                      >
                        <CheckCircle2 size={16} />
                        Complete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td className="table-cell" colSpan={canComplete ? 7 : 6}>
                    No inspections found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="hidden">
        <ClipboardCheck />
      </div>
    </section>
  );
}
