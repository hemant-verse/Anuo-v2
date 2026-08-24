import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Auno',
  description: 'Learn how Auno handles your data, images, and contact information.',
};

export default function PrivacyPage() {
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
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800">Data Practices</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">Privacy Policy</h1>
          <p className="text-xs font-semibold text-zinc-400 mt-2">Last Updated: August 2026</p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-10 space-y-6 text-sm leading-relaxed text-zinc-700">
          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">1. Information We Collect</h2>
            <p>To provide a functional campus marketplace, Auno collects:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Details:</strong> Email address, encrypted passwords, and user account role.</li>
              <li><strong>Listing Data:</strong> Titles, descriptions, prices, categories, and item condition.</li>
              <li><strong>Voluntary Contact Handles:</strong> WhatsApp numbers, Telegram handles, or Instagram usernames provided during product listing.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">2. Public Contact Display</h2>
            <p>
              When you submit a listing, the contact information you provide (WhatsApp, Telegram, or Instagram) is displayed on approved listings so potential buyers can reach out to you. By submitting this information, you consent to making these details visible on the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">3. Third-Party Infrastructure & Services</h2>
            <p>Auno utilizes secure cloud partners to process and store platform data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Media Storage:</strong> Product images are optimized and hosted securely on ImageKit.</li>
              <li><strong>Database:</strong> Metadata and user accounts are managed via MongoDB Atlas databases.</li>
              <li><strong>Authentication:</strong> Secure HTTP cookies/JWT tokens are used solely for session management.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">4. Data Deletion Rights</h2>
            <p>
              You have the right to request deletion of your account and associated listings at any time. When a listing or account is deleted, item photos and metadata are permanently unlinked or deleted from our active database and CDN storage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-950">5. Contact Us</h2>
            <p>
              For privacy requests or account removal inquiries, contact our moderation team via support channels on the marketplace.
            </p>
          </section>
        </div>

        <footer className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-200">
          <p>© {new Date().getFullYear()} Auno</p>
          <div className="flex gap-4 font-semibold">
            <Link href="/guidelines" className="hover:text-zinc-900">Guidelines</Link>
            <Link href="/terms" className="hover:text-zinc-900">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}