import { headers, cookies } from 'next/headers';
import { getUserFromAccessToken, getUserFromRefreshToken } from '@/server/auth/session.service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { listAudit } from '@/server/admin/admin.service';
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
      fullUser = await getUserFromRefreshToken(c.get(refreshCookieName())?.value);
    } catch {
      return redirect('/');
    }
  }
  if (!fullUser || fullUser.role !== 'admin') return redirect('/');

  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams?.limit || '20', 10)));
  const result = await listAudit({ userId: String(fullUser.id), role: fullUser.role }, {
    page,
    limit,
    adminId: searchParams?.adminId || '',
    action: searchParams?.action || '',
    productId: searchParams?.productId || '',
  });
  const logs = JSON.parse(JSON.stringify(result.items));

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Admin Audit Logs</h1>
          <Link href="/dashboard" className="text-sm text-zinc-600 underline">Back</Link>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <h2 className="font-bold mb-4">Recent Admin Actions</h2>
          {logs.length === 0 ? (
            <div className="text-sm text-zinc-500">No audit logs found</div>
          ) : (
            <div className="space-y-3">
              {logs.map((l) => (
                <div key={l._id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">{l.action} — {l.resourceType} {l.metadata?.title ? `(${l.metadata.title})` : ''}</div>
                      <div className="text-xs text-zinc-500">By: {l.adminId?.userName || l.adminId?.email || 'Unknown'} • {new Date(l.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-zinc-500">{l.metadata?.previousStatus || '—'} → {l.metadata?.newStatus || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-zinc-500">Total: {result.pagination.total}</div>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/dashboard/audit?page=${page - 1}&limit=${limit}`} className="px-3 py-1 rounded border">Prev</Link>}
              {result.pagination.hasNextPage && <Link href={`/dashboard/audit?page=${page + 1}&limit=${limit}`} className="px-3 py-1 rounded border">Next</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
