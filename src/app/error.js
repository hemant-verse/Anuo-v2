'use client';

export default function GlobalError({ reset }) {
  return (
    <main className="min-h-screen grid place-items-center p-6 bg-[#FAF9F6]">
      <section role="alert" aria-labelledby="app-error-title" className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm text-center">
        <h1 id="app-error-title" className="text-xl font-black text-zinc-950">Something went wrong</h1>
        <p className="mt-2 text-sm text-zinc-600">Auno could not complete this request. Please try again.</p>
        <button type="button" onClick={() => reset()} className="mt-5 rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2">Try again</button>
      </section>
    </main>
  );
}
