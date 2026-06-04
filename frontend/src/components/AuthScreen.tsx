import { FormEvent, useState } from 'react';
import { Flame, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const { login, register, loading, authError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'login') {
      await login(form.email, form.password);
      return;
    }

    //  registration  for normal User account (BY DEFAULT).
    await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-8">
      <section className="panel grid w-full max-w-5xl overflow-hidden md:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-zinc-950 p-8 text-white">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-lg bg-red-700">
              <Flame size={22} />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-200">TZW LTD</p>
              <h1 className="text-2xl font-black">Fire Extinguisher Management</h1>
            </div>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-zinc-300">
            
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p>Schedule inspections and log maintenance activity.</p>
            </div>
            
          </div>
        </div>


  {/* LOGIN  AND REGISTRATION FORMS */}
        <form className="grid gap-5 p-8" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase text-red-700">
                {mode === 'login' ? 'Login' : 'Register'}
              </p>
              <h2 className="text-2xl font-black text-zinc-950">
                {mode === 'login' ? 'Welcome Back' : 'Create account'}
              </h2>
            </div>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? <UserPlus size={17} /> : <LogIn size={17} />}
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </div>

          {mode === 'register' && (
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
          )}

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
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              minLength={8}
            />
          </label>

          {authError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {authError}
            </p>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
            {loading ? 'Please wait' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}
