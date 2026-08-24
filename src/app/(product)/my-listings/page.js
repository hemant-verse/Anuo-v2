'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { listProducts, updateProduct, deleteProduct } from '@/features/products/api';

export default function MyListingsPage() {
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchListings = async () => {
    try {
      const result = await listProducts({ mine: true });
      setProducts(result.items || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchListings, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await updateProduct(productId, { availabilityStatus: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, availabilityStatus: newStatus } : p))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
      <div className="min-h-screen bg-[#FAF9F6] pb-16 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, #FDE68A 0%, transparent 40%),
            radial-gradient(circle at 90% 10%, #A7F3D0 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, #FCA5A5 0%, transparent 50%),
            radial-gradient(circle at 85% 75%, #6EE7B7 0%, transparent 45%)
          `
        }}
      />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* Top Back Button Navigation */}
        <div>
          <Link
            href="/feed"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Marketplace
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              My Listed Items
            </h1>
            <p className="text-xs sm:text-sm font-medium text-zinc-700 mt-1">
              Manage all the items you have listed on Auno.
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm shadow-sm hover:shadow transition-all self-start sm:self-auto cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            List New Item
          </Link>
        </div>

        {/* Listings Section */}
        {isFetching ? (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 sm:p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border border-zinc-100 rounded-2xl animate-pulse items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/4" />
                  <div className="h-3 bg-zinc-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200/80 space-y-3">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-base font-bold text-zinc-900">You haven&apos;t listed any items for sale yet</p>
            <p className="text-xs text-zinc-500">Start selling your old books, devices, or gear across campus today.</p>
            <div className="pt-2">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-zinc-950 text-white font-bold px-5 py-2.5 rounded-full text-xs hover:bg-zinc-800 transition-colors"
              >
                Create First Listing
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-3 sm:p-6 space-y-4 shadow-sm">
            {products.map((item) => {
              const statusUpper = item.availabilityStatus?.toUpperCase() || 'AVAILABLE';

              return (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-zinc-100 hover:border-zinc-200 bg-white rounded-2xl transition-all gap-4 group"
                >
                  {/* Left Product Information */}
                  <div className="flex items-center gap-4 min-w-0">
                    <Image
                      src={item.images?.[0] || '/images/placeholder.png'}
                      alt={item.title}
                      width={96}
                      height={96}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-zinc-100 shrink-0 border border-zinc-100"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <Link href={`/product/${item._id}`}>
                        <h3 className="font-bold text-sm sm:text-base text-zinc-950 hover:text-emerald-700 transition-colors truncate">
                          {item.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <span className="font-black text-emerald-800 text-sm">
                          ₹{item.price?.toLocaleString() || '0'}
                        </span>
                        <span>•</span>
                        <span className="truncate">{item.category || 'General'}</span>
                      </div>

                      {/* Status Tag */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full tracking-wider ${statusUpper === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : statusUpper === 'RESERVED'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                            }`}
                        >
                          {statusUpper}
                        </span>

                        {/* Verify Tag */}
                        {item.moderationStatus && (
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full tracking-wider ${item.moderationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : item.moderationStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-zinc-50 text-zinc-600 border border-zinc-200'}`}>
                            {item.moderationStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Block */}
                  <div className="flex items-center justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 shrink-0">
                    <div className="relative">
                      <select
                        value={statusUpper}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-900 text-xs font-bold rounded-xl py-2 pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-zinc-950 cursor-pointer"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="SOLD">Sold</option>
                      </select>
                      <svg
                        className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info box matching theme */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900">Keep Your Listings Active!</p>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Students can only see available items in the feed. Mark items as &quot;Reserved&quot; when discussing a purchase, or &quot;Sold&quot; when completed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}