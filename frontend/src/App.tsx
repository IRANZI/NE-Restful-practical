import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { AppView, Shell } from './components/Shell';
import { useAuth } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { InventoryPage } from './pages/InventoryPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  clearOperationsError,
  fetchExtinguishers,
  fetchInspections,
  fetchMaintenance,
  fetchSummary,
  fetchUsers
} from './store/operationsSlice';

type ConfirmIntent = 'login' | 'logout' | 'delete';

// User alert for critical actions like logout...
const confirmationMessages: Record<ConfirmIntent, string> = {
  login: 'Are you sure you want to log in?',
  logout: 'Are you sure you want to log out?',
  delete: 'Are you sure you want to delete this item? This action cannot be undone.'
};

//   user intent based on element attributes and text content
function normalizeActionText(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function getActionText(element: HTMLElement) {
  
  return normalizeActionText(
    [
      element.getAttribute('aria-label'),
      element.getAttribute('title'),
      element.textContent
    ]
      .filter(Boolean)
      .join(' ')
  );
}

// determine user intent based on clicked element

function getClickIntent(event: MouseEvent): { intent: ConfirmIntent; form?: HTMLFormElement } | null {
  const target = event.target instanceof Element ? event.target : null;
  const actionElement = target?.closest('button, a, [role="button"]');

  if (!(actionElement instanceof HTMLElement)) {
    return null;
  }

  const actionText = getActionText(actionElement);

  if (actionText.includes('delete') || actionText.includes('remove')) {
    return { intent: 'delete' };
  }

  if (actionText.includes('log out') || actionText.includes('logout') || actionText.includes('sign out')) {
    return { intent: 'logout' };
  }

  if (actionText.includes('log in') || actionText.includes('login') || actionText.includes('sign in')) {
    const form = actionElement.closest('form');
    return { intent: 'login', form: form instanceof HTMLFormElement ? form : undefined };
  }

  return null;
}


// determine if a form submission is a login attempt
function getSubmitIntent(event: SubmitEvent) {
  const form = event.target instanceof HTMLFormElement ? event.target : null;

  if (!form) {
    return null;
  }

  const formText = normalizeActionText(
    [
      form.getAttribute('aria-label'),
      form.querySelector('button[type="submit"]')?.textContent,
      form.textContent
    ]
      .filter(Boolean)
      .join(' ')
  );
  const hasEmail = Boolean(form.querySelector('input[type="email"], input[name="email"]'));
  const hasPassword = Boolean(form.querySelector('input[type="password"], input[name="password"]'));

  return hasEmail && hasPassword && (formText.includes('log in') || formText.includes('login') || formText.includes('sign in'))
    ? 'login'
    : null;
}

// confirm critical actions and prevent them if the user cancels
function cancelUnconfirmedAction(event: Event, intent: ConfirmIntent) {
  if (window.confirm(confirmationMessages[intent])) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  return true;
}


// render the appropriate page based on the active view
function renderView(view: AppView) {
  switch (view) {
    case 'inventory':
      return <InventoryPage />;
    case 'inspections':
      return <InspectionsPage />;
    case 'maintenance':
      return <MaintenancePage />;
    case 'reports':
      return <ReportsPage />;
    case 'users':
      return <UsersPage />;
    case 'profile':
      return <ProfilePage />;
    default:
      return <DashboardPage />;
  }
}

// Main application component that handles authentication and routing between views
export default function App() {
  const { user, token } = useAuth();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.operations);
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  
  useEffect(() => {
    const confirmedLoginForms = new WeakSet<HTMLFormElement>();

    function handleClick(event: MouseEvent) {
      const clickIntent = getClickIntent(event);

      if (!clickIntent) {
        return;
      }

      if (cancelUnconfirmedAction(event, clickIntent.intent)) {
        return;
      }

      if (clickIntent.intent === 'login' && clickIntent.form) {
        confirmedLoginForms.add(clickIntent.form);
      }
    }
// confirm critical actions and prevent them if the user cancels
    function handleSubmit(event: SubmitEvent) {
      const form = event.target instanceof HTMLFormElement ? event.target : null;

      if (form && confirmedLoginForms.has(form)) {
        confirmedLoginForms.delete(form);
        return;
      }

      const submitIntent = getSubmitIntent(event);

      if (submitIntent) {
        cancelUnconfirmedAction(event, submitIntent);
      }
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    void dispatch(fetchExtinguishers({}));
    void dispatch(fetchInspections());
    void dispatch(fetchMaintenance());
    void dispatch(fetchSummary());

    if (user?.role === 'Admin') {
      void dispatch(fetchUsers());
    }
  }, [dispatch, token, user?.role]);

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Shell activeView={activeView} onViewChange={setActiveView}>
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </span>
          <button className="btn-quiet text-red-700" type="button" onClick={() => dispatch(clearOperationsError())}>
            Dismiss
          </button>
        </div>
      )}
      {renderView(activeView)}
    </Shell>
  );
}
