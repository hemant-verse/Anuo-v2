import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 selection:bg-neutral-800">
      {/* Background Glow Effect */}
      <div className="absolute w-72 h-72 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 text-center max-w-sm space-y-6">
        {/* Status Badge */}
        <div className="inline-block px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900 text-xs font-mono text-neutral-400">
          404 Error
        </div>

        {/* Minimal Typography */}
        <div className="space-y-2">
          <h1 className="text-6xl font-light tracking-tight text-neutral-50 font-mono">
            404
          </h1>
          <p className="text-sm text-neutral-400">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-medium hover:bg-neutral-200 transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}