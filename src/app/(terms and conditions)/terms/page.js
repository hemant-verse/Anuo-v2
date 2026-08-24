import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Auno',
  description: 'Legal agreement and platform terms for using Auno.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/feed" className="text-xl font-black tracking-tight">
            A<span className="text-emerald-700">uno</span>
          </Link>
          <Link href="/feed" className="text-xs font-bold text-zinc-600 hover:text-zinc-950">
            ← Back to Marketplace
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800">Legal Agreement</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">Terms of Service</h1>
          <p className="text-xs font-semibold text-zinc-400 mt-2">Last Updated: August 2026</p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-10 space-y-6 text-sm leading-relaxed text-zinc-700">
          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">1. Acceptance of Terms</h2>
            <p>
              By creating an account, browsing, or listing items on Auno, you agree to be legally bound by these Terms of Service. If you do not agree to these terms, you must discontinue using the platform immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">2. Marketplace Intermediary Disclaimer</h2>
            <p>
              Auno operates strictly as a venue for college community members to display listings and facilitate initial contact. Auno is not an auctioneer, seller, or broker of items. We do not take custody of products, process financial transactions, or offer escrow services. All exchanges, payments, and product inspections are conducted directly between buyers and sellers outside of Auno.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">3. Moderation & Listing Approval</h2>
            <p>
              All product submissions are subject to administrative review (`PENDING` status). Auno reserves the absolute right to approve, reject, or delete any listing at its sole discretion. Approval of a listing signifies compliance with basic platform presentation rules only and does not constitute verification of product quality, authenticity, or seller legitimacy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">4. Prohibited Content & Goods</h2>
            <p>Users are strictly prohibited from submitting listings involving:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stolen property or unauthorized campus equipment.</li>
              <li>Alcohol, drugs, prescription medication, or hazardous materials.</li>
              <li>Academic dishonesty materials (e.g., exam keys, proxy services).</li>
              <li>Counterfeit goods or copyrighted intellectual property without permission.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">5. Limitation of Liability</h2>
            <p>
              In no event shall Auno, its administrators, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from transactions, fraudulent activity, damaged goods, or personal injury occurring during in-person meetups.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">6. Account Termination</h2>
            <p>
              Auno reserves the right to suspend or terminate user accounts that violate our guidelines, attempt to bypass moderation systems, or exhibit abusive behavior.
            </p>
          </section>
        </div>

        <footer className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-200">
          <p>© {new Date().getFullYear()} Auno</p>
          <div className="flex gap-4 font-semibold">
            <Link href="/guidelines" className="hover:text-zinc-900">Guidelines</Link>
            <Link href="/privacy" className="hover:text-zinc-900">Privacy Policy</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}