'use client';

import { forwardRef } from 'react';

/**
 * Input — accessible text input primitive.
 *
 * Features:
 * - Consistent ring focus ring using the design system
 * - Forward ref support for RHF / third-party integration
 * - Error state via `error` prop (adds red ring)
 * - Prefix/suffix slot for icons
 */
const Input = forwardRef(function Input(
  {
    id,
    type = 'text',
    placeholder,
    name,
    label,
    error,
    prefix,
    suffix,
    className = '',
    ...rest
  },
  ref
) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-zinc-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-zinc-400 pointer-events-none">{prefix}</span>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full bg-zinc-50 border-0 rounded-2xl py-3.5 text-sm font-medium
            placeholder-zinc-400 text-zinc-900 transition-all outline-none
            focus:ring-2
            ${error ? 'ring-2 ring-rose-400 focus:ring-rose-500' : 'focus:ring-zinc-950'}
            ${prefix ? 'pl-10 pr-5' : 'px-5'}
            ${suffix ? 'pr-10' : ''}
            ${className}
          `.trim()}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-4 text-zinc-400">{suffix}</span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-bold text-rose-600 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
