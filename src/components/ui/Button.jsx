'use client';

import Spinner from './Spinner';

/**
 * Button — core interactive button primitive.
 *
 * Variants: 'primary' | 'secondary' | 'ghost' | 'danger'
 * Sizes:    'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Loading…',
  disabled = false,
  fullWidth = false,
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-zinc-950 hover:bg-zinc-800 text-white shadow-xl hover:shadow-2xl focus:ring-zinc-950',
    secondary: 'bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 shadow-sm focus:ring-zinc-400',
    ghost:     'bg-transparent hover:bg-zinc-100 text-zinc-700 focus:ring-zinc-400',
    danger:    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${base}
        ${variants[variant] ?? variants.primary}
        ${sizes[size] ?? sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner size="sm" label={loadingLabel} />
          <span>{loadingLabel}</span>
        </>
      ) : children}
    </button>
  );
}
