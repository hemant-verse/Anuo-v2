'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { approveProduct, rejectProduct } from '@/features/admin/api';
import Link from 'next/link';

export default function AdminClient({
  initialProducts = [],
  total = 0,
  page = 1,
  limit = 20,
  search = '',
  category = '',
}) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [q, setQ] = useState(search || '');
  const [cat, setCat] = useState(category || 'ALL');
  const [perPage, setPerPage] = useState(limit || 20);
  const router = useRouter();

  const updateVerify = async (productId, verify) => {
    try {
      setLoading(true);
      if (verify === 'APPROVED') await approveProduct(productId);
      else await rejectProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      if (selectedProduct?._id === productId) {
        setSelectedProduct(null);
      }
    } catch (err) {
      alert('Failed to update product verification status');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(
      `/dashboard?page=1&limit=${perPage}&search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`
    );
  };

  const renderPageLinks = () => {
    const current = Number(page || 1);
    const pages = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(totalPages, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages.map((p) => (
      <Link
        key={p}
        href={`/dashboard?page=${p}&limit=${perPage}&search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
          p === current ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200'
        }`}
      >
        {p}
      </Link>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Responsive Filter Bar */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
        <div className="sm:col-span-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or description..."
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-zinc-50/50"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-zinc-50/50 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Dorm">Dorm</option>
            <option value="Fashion">Fashion</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-zinc-50/50 cursor-pointer"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#2D5A46] hover:bg-[#234737] text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-zinc-500 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
          No pending listings match your criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <article
              key={p._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between border border-zinc-200 rounded-2xl p-3 sm:p-4 hover:border-emerald-700/40 transition-all gap-4 bg-white shadow-xs"
            >
              {/* Product Info Trigger */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProduct(p)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProduct(p);
                  }
                }}
                aria-label={`Inspect listing ${p.title}`}
                className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 text-left focus:outline-none focus:ring-2 focus:ring-emerald-700 rounded-xl"
              >
                <Image
                  src={p.images?.[0] || '/images/placeholder.png'}
                  alt={p.title}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-zinc-100 flex-shrink-0 group-hover:opacity-90 transition-opacity"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-800 transition-colors truncate">
                      {p.title}
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50 hidden sm:inline-block">
                      Click to Inspect
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">
                    Seller: <span className="text-zinc-700 font-medium">{p.sellerId?.userName || p.sellerId?.email || 'Unknown'}</span>
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-black text-zinc-900">₹{p.price}</span>
                    {p.isNegotiable && (
                      <span className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                        Negotiable
                      </span>
                    )}
                    <span className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                      {p.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Approve / Reject Controls */}
              <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                <button
                  disabled={loading}
                  onClick={() => updateVerify(p._id, 'REJECTED')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  disabled={loading}
                  onClick={() => updateVerify(p._id, 'APPROVED')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#2D5A46] hover:bg-[#234737] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-100">
        <div className="text-xs font-semibold text-zinc-500">
          Total: <span className="text-zinc-900 font-bold">{total}</span> listings
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {Number(page) > 1 && (
            <Link
              href={`/dashboard?page=${Number(page) - 1}&limit=${perPage}&search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
            >
              Prev
            </Link>
          )}
          {renderPageLinks()}
          {Number(page) * perPage < total && (
            <Link
              href={`/dashboard?page=${Number(page) + 1}&limit=${perPage}&search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
            >
              Next
            </Link>
          )}
        </div>
      </div>

      {/* FULL PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                  Inspection Mode
                </span>
                <span className="text-xs text-zinc-400 font-mono">ID: {selectedProduct._id}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                type="button"
                aria-label="Close listing details"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Image Display */}
                <div className="space-y-2">
                  <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                    <Image
                      src={selectedProduct.images?.[0] || '/images/placeholder.png'}
                      alt={selectedProduct.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Primary Specs */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 leading-tight">{selectedProduct.title}</h2>
                    <p className="text-2xl font-black text-emerald-800 mt-2">
                      ₹{selectedProduct.price}
                      {selectedProduct.isNegotiable && (
                        <span className="text-xs font-bold text-zinc-500 ml-2">(Negotiable)</span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                      <span className="text-zinc-400 font-medium block">Category</span>
                      <span className="font-bold text-zinc-800">{selectedProduct.category || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                      <span className="text-zinc-400 font-medium block">Condition</span>
                      <span className="font-bold text-zinc-800">{selectedProduct.condition || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Seller Details Card */}
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2">
                    <h4 className="text-xs font-bold text-zinc-900">Seller Information</h4>
                    <div className="text-xs space-y-1 text-zinc-600">
                      <p><span className="font-semibold text-zinc-800">Name:</span> {selectedProduct.sellerId?.userName || 'N/A'}</p>
                      <p><span className="font-semibold text-zinc-800">Email:</span> {selectedProduct.sellerId?.email || 'N/A'}</p>
                      
                      {/* Direct Contacts */}
                      <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                        {selectedProduct.contacts?.whatsapp ? (
                          <span className="bg-emerald-100/80 text-emerald-900 font-bold px-2 py-0.5 rounded">
                            WA: {selectedProduct.contacts?.whatsapp}
                          </span>
                        ) : null}
                        {selectedProduct.contacts?.telegram ? (
                          <span className="bg-sky-100/80 text-sky-900 font-bold px-2 py-0.5 rounded">
                            TG: @{selectedProduct.contacts?.telegram}
                          </span>
                        ) : null}
                        {selectedProduct.contacts?.instagram ? (
                          <span className="bg-pink-100/80 text-pink-900 font-bold px-2 py-0.5 rounded">
                            IG: @{selectedProduct.contacts?.instagram}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5 border-t border-zinc-100 pt-4">
                <h4 className="text-xs font-bold text-zinc-900">Full Description</h4>
                <div className="p-4 bg-zinc-50 rounded-2xl text-xs font-medium text-zinc-700 leading-relaxed whitespace-pre-wrap border border-zinc-100">
                  {selectedProduct.description || 'No description provided.'}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-3">
              <button
                disabled={loading}
                onClick={() => updateVerify(selectedProduct._id, 'REJECTED')}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Reject Listing
              </button>
              <button
                disabled={loading}
                onClick={() => updateVerify(selectedProduct._id, 'APPROVED')}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#2D5A46] hover:bg-[#234737] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                Approve Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}