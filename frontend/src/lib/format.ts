export function formatDate(value?: string | null) {
  if (!value) return 'n/a';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) return 'n/a';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}
