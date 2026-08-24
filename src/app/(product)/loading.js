export default function ProductLoading() {
  return (
    <main aria-busy="true" aria-label="Loading marketplace" className="min-h-screen grid place-items-center bg-[#FAF9F6]">
      <div className="h-8 w-8 rounded-full border-4 border-zinc-200 border-t-zinc-950 animate-spin" aria-hidden="true" />
    </main>
  );
}
