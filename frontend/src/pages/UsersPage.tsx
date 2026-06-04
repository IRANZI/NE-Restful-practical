import { FormEvent, useState } from 'react';
import { RefreshCw, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { userRoles } from '../config/constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createUser, fetchUsers } from '../store/operationsSlice';
import type { UserRole } from '../types';

const emptyUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: 'password123',
  role: 'Inspector' as UserRole
};

export function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.operations);
  const [form, setForm] = useState(emptyUserForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Admin user creation is the only UI path that can create Inspector or Admin accounts.
    await dispatch(createUser(form)).unwrap();
    setForm(emptyUserForm);
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-red-700">Administration</p>
          <h1 className="text-3xl font-black text-zinc-950">Users and roles</h1>
        </div>
        <button className="btn-secondary" type="button" onClick={() => void dispatch(fetchUsers())}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <form className="panel grid gap-4 p-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <UserPlus className="text-red-700" size={20} />
          <h2 className="text-lg font-black text-zinc-950">Create account</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="field">
            First name
            <input
              className="input"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              required
            />
          </label>
          <label className="field">
            Last name
            <input
              className="input"
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              required
            />
          </label>
          <label className="field">
            Email
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label className="field">
            Password
            <input
              className="input"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <label className="field">
            Role
            <select
              className="input"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
            >
              {userRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn-primary justify-self-start" type="submit" disabled={loading}>
          <UserPlus size={17} />
          Create user
        </button>
      </form>

      <section className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-zinc-200 p-5">
          <Users className="text-red-700" size={20} />
          <h2 className="text-lg font-black text-zinc-950">Account directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => (
                <tr key={account.id}>
                  <td className="table-cell font-bold text-zinc-950">
                    {account.firstName} {account.lastName}
                  </td>
                  <td className="table-cell">{account.email}</td>
                  <td className="table-cell">
                    <span className="badge border-zinc-200 bg-zinc-50 text-zinc-700">
                      {account.role}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                      <ShieldCheck size={16} />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="table-cell" colSpan={4}>
                    No users found.
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
