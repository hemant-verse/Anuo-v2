'use client';

/**
 * Spinner — reusable loading indicator primitive.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 * @param {string} [props.label='Loading…']  - sr-only accessible label
 */
export default function Spinner({ size = 'md', className = '', label = 'Loading…' }) {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-[3px]',
  };

  return (
    <span role="status" aria-label={label} className={`inline-flex ${className}`}>
      <span
        className={`${sizeMap[size]} rounded-full border-zinc-300 border-t-zinc-900 animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
