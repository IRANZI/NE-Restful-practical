import { FormEvent, useState } from 'react';
import { KeyRound, Save, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateProfile(profile);
    setMessage('Profile updated.');
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await changePassword(passwords.currentPassword, passwords.newPassword);
    setPasswords({ currentPassword: '', newPassword: '' });
    setMessage('Password changed.');
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-black uppercase text-red-700">Profile</p>
        <h1 className="text-3xl font-black text-zinc-950">Account settings</h1>
      </div>

      {message && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
          {message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <form className="panel grid gap-4 p-5" onSubmit={handleProfile}>
          <div className="flex items-center gap-2">
            <UserCog className="text-red-700" size={20} />
            <h2 className="text-lg font-black text-zinc-950">Profile</h2>
          </div>
          <label className="field">
            First name
            <input
              className="input"
              value={profile.firstName}
              onChange={(event) => setProfile({ ...profile, firstName: event.target.value })}
              required
            />
          </label>
          <label className="field">
            Last name
            <input
              className="input"
              value={profile.lastName}
              onChange={(event) => setProfile({ ...profile, lastName: event.target.value })}
              required
            />
          </label>
          <label className="field">
            Email
            <input
              className="input"
              type="email"
              value={profile.email}
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              required
            />
          </label>
          <button className="btn-primary justify-self-start" type="submit">
            <Save size={17} />
            Save profile
          </button>
        </form>

        <form className="panel grid gap-4 p-5" onSubmit={handlePassword}>
          <div className="flex items-center gap-2">
            <KeyRound className="text-red-700" size={20} />
            <h2 className="text-lg font-black text-zinc-950">Password</h2>
          </div>
          <label className="field">
            Current password
            <input
              className="input"
              type="password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
              required
            />
          </label>
          <label className="field">
            New password
            <input
              className="input"
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
              required
              minLength={8}
            />
          </label>
          <button className="btn-secondary justify-self-start" type="submit">
            <Save size={17} />
            Change password
          </button>
        </form>
      </div>
    </section>
  );
}
