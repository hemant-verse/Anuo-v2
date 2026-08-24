'use client';

import Button from './Button';

/**
 * ErrorState — standardized error view with optional retry.
 *
 * @param {string}   [title]    - Headline, defaults to "Something went wrong"
 * @param {string}   [message]  - Details
 * @param {Function} [onRetry]  - If provided, shows a Retry button
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) {
  return (
    <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200/80 space-y-4">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-base font-bold text-zinc-900">{title}</p>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
