import { headers, cookies } from 'next/headers';
import { getUserFromAccessToken, getUserFromRefreshToken } from '@/server/auth/session.service';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';
import { listPending } from '@/server/admin/admin.service';
import { refreshCookieName } from '@/lib/auth-cookies';

export default async function Page({ searchParams }) {
  let fullUser = null;
  try {
    const hdrs = await headers();
    const authHeader = typeof hdrs.get === 'function' ? hdrs.get('authorization') : hdrs?.authorization;
    const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (token) fullUser = await getUserFromAccessToken(token);
  } catch {}

  if (!fullUser) {
    try {
      const c = await cookies();
      const refreshToken = typeof c.get === 'function' ? c.get(refreshCookieName())?.value : c?.[refreshCookieName()];
      fullUser = await getUserFromRefreshToken(refreshToken);
    } catch {
      return redirect('/');
    }
  }

  if (!fullUser || fullUser.role !== 'admin') return redirect('/');

  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const limit = Math.min(50, Math.max(5, parseInt(searchParams?.limit || '20', 10)));
  const search = searchParams?.search || '';
  const category = searchParams?.category || 'ALL';
  const result = await listPending({ userId: String(fullUser.id), role: fullUser.role }, { page, limit, search, category });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Admin Dashboard</h1>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">Pending Listings</h2>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
              {result.pagination.total} Review Required
            </span>
          </div>
          <AdminClient
            initialProducts={JSON.parse(JSON.stringify(result.items))}
            total={result.pagination.total}
            page={result.pagination.page}
            limit={result.pagination.limit}
            search={search}
            category={category}
          />
        </div>
      </div>
    </div>
  );
}
