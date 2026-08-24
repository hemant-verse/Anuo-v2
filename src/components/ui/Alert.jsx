'use client';

/**
 * Alert — reusable dismissible alert banner.
 *
 * @param {'error'|'success'|'warning'|'info'} variant
 * @param {string} message
 * @param {string} [id] - unique id for aria-describedby linking
 */
export default function Alert({ variant = 'error', message, id }) {
  if (!message) return null;

  const variants = {
    error:   { role: 'alert',  live: 'assertive', bg: 'bg-rose-50 border-rose-200 text-rose-800' },
    success: { role: 'status', live: 'polite',     bg: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    warning: { role: 'alert',  live: 'polite',     bg: 'bg-amber-50 border-amber-200 text-amber-800' },
    info:    { role: 'status', live: 'polite',     bg: 'bg-blue-50 border-blue-200 text-blue-800' },
  };

  const { role, live, bg } = variants[variant] ?? variants.error;

  return (
    <div
      id={id}
      role={role}
      aria-live={live}
      className={`p-3 border rounded-2xl text-xs font-bold tracking-wide ${bg}`}
    >
      {message}
    </div>
  );
}
