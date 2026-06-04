import { FormEvent, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Save, Search, Trash2, X } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import {
  extinguisherSizes,
  extinguisherStatuses,
  extinguisherTypes
} from '../config/constants';
import { useAuth } from '../context/AuthContext';
import { formatDate, todayDateInput } from '../lib/format';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchExtinguishers,
  fetchSummary,
  removeExtinguisher,
  saveExtinguisher
} from '../store/operationsSlice';
import type { Extinguisher, ExtinguisherPayload, ExtinguisherStatus } from '../types';

const emptyForm: ExtinguisherPayload = {
  serialNumber: '',
  location: '',
  type: 'CO2',
  size: '5 lb',
  installationDate: todayDateInput(),
  expiryDate: '',
  status: 'Active',
  assignedTo: null
};

export function InventoryPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { extinguishers, users, loading } = useAppSelector((state) => state.operations);
  const [form, setForm] = useState<ExtinguisherPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const inspectors = useMemo(() => users.filter((item) => item.role === 'Inspector'), [users]);
  const canEdit = user?.role === 'Admin' || user?.role === 'Inspector';
  const canDelete = user?.role === 'Admin';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await dispatch(saveExtinguisher({ ...form, id: editingId ?? undefined })).unwrap();
    await dispatch(fetchSummary());
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(extinguisher: Extinguisher) {
    setEditingId(extinguisher.id);
    setForm({
      serialNumber: extinguisher.serialNumber,
      location: extinguisher.location,
      type: extinguisher.type,
      size: extinguisher.size,
      installationDate: String(extinguisher.installationDate).slice(0, 10),
      expiryDate: String(extinguisher.expiryDate).slice(0, 10),
      status: extinguisher.status,
      assignedTo: extinguisher.assignedTo ?? null
    });
  }

  async function applyFilters() {
    await dispatch(
      fetchExtinguishers({
        search: filters.search || undefined,
        status: filters.status || undefined
      })
    );
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-red-700">Inventory</p>
          <h1 className="text-3xl font-black text-zinc-950">Fire extinguishers</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" type="button" onClick={applyFilters}>
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      <section className="panel p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="field">
            Search
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
              <input
                className="input w-full pl-9"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Serial or location"
              />
            </div>
          </label>
          <label className="field">
            Status
            <select
              className="input"
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            >
              <option value="">All statuses</option>
              {extinguisherStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-primary self-end" type="button" onClick={applyFilters}>
            <Search size={17} />
            Apply
          </button>
        </div>
      </section>

      {canEdit && (
        <form className="panel grid gap-4 p-5" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-zinc-950">
              {editingId ? 'Update extinguisher' : 'Register extinguisher'}
            </h2>
            {editingId && (
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                <X size={17} />
                Cancel
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="field">
              Serial number
              <input
                className="input"
                value={form.serialNumber}
                onChange={(event) => setForm({ ...form, serialNumber: event.target.value })}
                required
              />
            </label>
            <label className="field md:col-span-2">
              Location
              <input
                className="input"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                required
              />
            </label>
            <label className="field">
              Type
              <select
                className="input"
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value as ExtinguisherPayload['type'] })
                }
              >
                {extinguisherTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Size
              <select
                className="input"
                value={form.size}
                onChange={(event) =>
                  setForm({ ...form, size: event.target.value as ExtinguisherPayload['size'] })
                }
              >
                {extinguisherSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Installed
              <input
                className="input"
                type="date"
                value={form.installationDate}
                onChange={(event) => setForm({ ...form, installationDate: event.target.value })}
                required
              />
            </label>
            <label className="field">
              Expires
              <input
                className="input"
                type="date"
                value={form.expiryDate}
                onChange={(event) => setForm({ ...form, expiryDate: event.target.value })}
                required
              />
            </label>
            <label className="field">
              Status
              <select
                className="input"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as ExtinguisherStatus })
                }
              >
                {extinguisherStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Inspector
              <select
                className="input"
                value={form.assignedTo ?? ''}
                onChange={(event) => setForm({ ...form, assignedTo: event.target.value || null })}
              >
                <option value="">Unassigned</option>
                {inspectors.map((inspector) => (
                  <option key={inspector.id} value={inspector.id}>
                    {inspector.firstName} {inspector.lastName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="btn-primary justify-self-start" type="submit" disabled={loading}>
            {editingId ? <Save size={17} /> : <Plus size={17} />}
            {editingId ? 'Save changes' : 'Register'}
          </button>
        </form>
      )}

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Installed</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Inspector</th>
                {canEdit && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {extinguishers.map((extinguisher) => (
                <tr key={extinguisher.id}>
                  <td className="table-cell font-bold text-zinc-950">{extinguisher.serialNumber}</td>
                  <td className="table-cell">{extinguisher.location}</td>
                  <td className="table-cell">{extinguisher.type}</td>
                  <td className="table-cell">{extinguisher.size}</td>
                  <td className="table-cell">{formatDate(extinguisher.installationDate)}</td>
                  <td className="table-cell">{formatDate(extinguisher.expiryDate)}</td>
                  <td className="table-cell">
                    <StatusBadge status={extinguisher.status} />
                  </td>
                  <td className="table-cell">{extinguisher.assignedInspectorName ?? 'Unassigned'}</td>
                  {canEdit && (
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button className="btn-secondary" type="button" onClick={() => startEdit(extinguisher)}>
                          <Pencil size={16} />
                          Edit
                        </button>
                        {canDelete && (
                          <button
                            className="btn-secondary text-red-700"
                            type="button"
                            onClick={() => void dispatch(removeExtinguisher(extinguisher.id))}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {extinguishers.length === 0 && (
                <tr>
                  <td className="table-cell" colSpan={canEdit ? 9 : 8}>
                    No fire extinguishers found.
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
