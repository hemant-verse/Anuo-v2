export default function Loading() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col justify-between p-6 sm:p-12 selection:bg-neutral-800 overflow-hidden">
      
      {/* Top Animated Progress Bar (Mobile & PC) */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-neutral-900 overflow-hidden z-50">
        <div className="h-full bg-neutral-100 w-1/3 animate-[loadingBar_1.5s_ease-in-out_infinite]" />
      </div>

      {/* Ambient Background Glow - Responsive Sizing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-neutral-800/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Bar / Header Skeleton */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="h-4 w-24 sm:w-32 bg-neutral-900 border border-neutral-800/60 rounded-md animate-pulse" />
        <div className="hidden sm:flex items-center gap-3">
          <div className="h-3 w-16 bg-neutral-900 rounded animate-pulse" />
          <div className="h-3 w-16 bg-neutral-900 rounded animate-pulse" />
        </div>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center text-center space-y-6">
        
        {/* Animated Loading Ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-neutral-800 border-t-neutral-100 animate-spin" />
          <div className="absolute w-2 h-2 rounded-full bg-neutral-100 animate-ping" />
        </div>

        {/* Minimal Typography */}
        <div className="space-y-2 max-w-xs sm:max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-neutral-400 tracking-wider uppercase">
              Loading...
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 font-mono">
            Fetching resources...
          </p>
        </div>

      </main>

      {/* Footer Status Line */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between text-[10px] sm:text-xs font-mono text-neutral-600">
        <span>I&apos;m handling</span>
        <span>the Situation</span>
      </footer>

    </div>
  );
}