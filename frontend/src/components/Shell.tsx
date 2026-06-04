import { ReactNode } from 'react';
import {
  BarChart3,
  ClipboardCheck,
  Flame,
  Gauge,
  LogOut,
  ShieldCheck,
  UserCog,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AppView =
  | 'dashboard'
  | 'inventory'
  | 'inspections'
  | 'maintenance'
  | 'reports'
  | 'users'
  | 'profile';

const navigation: Array<{
  view: AppView;
  label: string;
  icon: typeof Gauge;
}> = [
  { view: 'dashboard', label: 'Dashboard', icon: Gauge },
  { view: 'inventory', label: 'Inventory', icon: ShieldCheck },
  { view: 'inspections', label: 'Inspections', icon: ClipboardCheck },
  { view: 'maintenance', label: 'Maintenance', icon: Wrench },
  { view: 'reports', label: 'Reports', icon: BarChart3 },
  { view: 'users', label: 'Users', icon: Users },
  { view: 'profile', label: 'Profile', icon: UserCog }
];

export function Shell({
  activeView,
  onViewChange,
  children
}: {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  // Admin-only navigation keeps protected screens out of the repeated daily workflow for other roles.
  const visibleNavigation = navigation.filter((item) => item.view !== 'users' || user?.role === 'Admin');

  return (
    <div className="min-h-screen bg-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-200 bg-white p-5 lg:block">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-red-700 text-white">
            <Flame size={22} />
          </span>
          <div>
            <p className="text-xs font-black uppercase text-red-700">TZW LTD</p>
            <p className="text-lg font-black text-zinc-950">Safety Console</p>
          </div>
        </div>

        <nav className="mt-8 grid gap-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-bold transition ${
                  isActive ? 'bg-red-700 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                type="button"
                onClick={() => onViewChange(item.view)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute inset-x-5 bottom-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="font-bold text-zinc-950">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm font-semibold text-zinc-500">{user?.role}</p>
          <button className="btn-secondary mt-4 w-full" type="button" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="text-red-700" size={22} />
            <span className="font-black">TZW LTD</span>
          </div>
          <button className="btn-secondary" type="button" onClick={logout}>
            <LogOut size={17} />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                className={`btn shrink-0 ${
                  activeView === item.view ? 'bg-red-700 text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
                type="button"
                onClick={() => onViewChange(item.view)}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
