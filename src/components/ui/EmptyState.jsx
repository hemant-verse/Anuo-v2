'use client';

/**
 * EmptyState — standardized empty data view.
 *
 * @param {ReactNode} [icon]      - SVG or element to display at top
 * @param {string}    title       - Short headline
 * @param {string}    [message]   - Supplementary description text
 * @param {ReactNode} [action]    - CTA button or link
 */
export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200/80 space-y-4">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
          {icon}
        </div>
      )}
      <div>
        <p className="text-base font-bold text-zinc-900">{title}</p>
        {message && (
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">{message}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
